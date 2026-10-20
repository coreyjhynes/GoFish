"""AIS fleet-activity loiter spots: where fishing/charter/pleasure boats held station offshore.

Source
    NOAA Marine Cadastre AIS daily files (https://coast.noaa.gov/htdata/CMSP/AISDataHandler/<year>/
    AIS_<yyyy>_<mm>_<dd>.zip, one zipped CSV per UTC day, ~400 MB each). Columns used: MMSI,
    BaseDateTime, LAT, LON, SOG, VesselType, Status, Length. Note: as of Oct 2026 the 2024 index
    still lists Jan-Jun files but only Jul-Dec 2024 actually download (Jan-Jun return 404).

Method
    1. fetch:  download each sampled day into WORK, stream the CSV inside the zip (no full
               extraction), keep only rows inside BOX with a candidate vessel type, write a small
               per-day extract (WORK/extract_<date>.csv) and delete the zip.
    2. coast:  find the Gulf-facing shoreline from the NOAA NCEI DEM ImageServer (getSamples):
               along each meridian, the southernmost land sample (value >= 0) is the beach. The
               shoreline latitude is smoothed with a running minimum (COAST_SMOOTH_DEG) so passes
               and bay mouths are closed off. Cached as WORK/coast_<region>.json. Assumes land is
               NORTH of the fishing grounds (true for the Alabama / NW Florida coast).
    3. build:  keep fixes from fishing (30), pleasure (37) and small passenger/charter (60-69 with a
               reported Length <= MAX_LEN_M) vessels; drop any vessel reporting Length > MAX_LEN_M;
               drop commercial trawlers entirely (type 30 >= COMMERCIAL_LEN_M, or >= TRAWL_BAND_H
               hours at 1.8-3.8 kn summed over the sampled days: shrimpers tow at ~3 kn and
               otherwise swamp the nearshore result); SOG <= MAX_SOG_KN; drop Status at anchor / moored / aground; drop fixes north of the
               smoothed shoreline (bays, sounds, passes, marinas) or within MIN_SHORE_MI of the
               beach. Thin to one fix per vessel per THIN_S seconds (so pts ~ minutes on station).
               Per vessel-day, chain consecutive fixes into "stops" (each fix within STOP_R_M of the
               stop's first fix, gap <= STOP_GAP_S); drop stops longer than MAX_STAY_H (anchored /
               overnight) and stops shorter than MIN_STOP_PTS fixes. Then cluster stops from all
               vessels and days greedily: seed = stop with the most other vessel-days within
               CLUSTER_R_M, take every unassigned stop within CLUSTER_R_M of the seed, re-centre on
               the pts-weighted centroid. Keep a cluster when it has >= 2 distinct days or >= 2
               distinct vessels and >= MIN_CLUSTER_PTS fixes, and its DEM depth >= MIN_DEPTH_FT.
    4. grade:  B = 2+ distinct vessels, C = one vessel seen on 2+ days. Sorted strongest first
               (vessels, days, pts). Output carries no MMSI, names or other vessel identifiers.

Bias: many small private boats carry no AIS; the result leans to larger charter/sport boats.

Usage
    python -I tools/bottom/ais_loiter.py            # fetch (skips days already extracted) + build
    python -I tools/bottom/ais_loiter.py fetch      # downloads only
    python -I tools/bottom/ais_loiter.py build      # rebuild output from existing extracts
    For another region change the constants below (REGION, VAR, BOX, DATES, TITLE).
"""
import csv
import datetime
import json
import math
import re
import sys
import time
import urllib.parse
import urllib.request
import zipfile
import zlib
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np

# ---------------------------------------------------------------- region / run constants
REGION = "gulfshores"
VAR = "AIS_LOITER_GULFSHORES"
TITLE = "offshore Gulf Shores / Orange Beach, AL -> Pensacola -> Destin, FL"
BOX = (29.30, 30.45, -88.45, -86.25)  # lat_min, lat_max, lon_min, lon_max
# 16 days Jul-Oct 2024 (Jan-Jun 2024 files are not downloadable): 12 weekend, 4 weekday.
# 2024-10-19 was replaced by 2024-10-26: its zip fails to decompress (corrupt on the server).
DATES = [
    "2024-07-06", "2024-07-10", "2024-07-14", "2024-07-20",
    "2024-08-03", "2024-08-11", "2024-08-15", "2024-08-24",
    "2024-09-03", "2024-09-07", "2024-09-15", "2024-09-21",
    "2024-10-05", "2024-10-13", "2024-10-25", "2024-10-26",
]
AIS_URL = "https://coast.noaa.gov/htdata/CMSP/AISDataHandler/{y}/AIS_{y}_{m}_{d}.zip"
DEM_URL = ("https://gis.ngdc.noaa.gov/arcgis/rest/services/DEM_mosaics/DEM_all/"
           "ImageServer/getSamples")

REPO = Path(__file__).resolve().parents[2]
WORK = REPO.parent / "bottom_work" / "ais"
OUT = REPO / "data" / f"ais_loiter_{REGION}.js"

# ---------------------------------------------------------------- filter / cluster constants
KEEP_TYPES = {30, 37}            # fishing, pleasure craft
SMALL_PASSENGER = range(60, 70)  # passenger: kept only with a reported Length <= MAX_LEN_M
MAX_LEN_M = 30.0
# Commercial shrimp trawlers (type 30, 22-30 m) tow at 2-3.5 kn and pass the speed filter; they
# would otherwise dominate the nearshore clusters (e.g. off Dauphin Island). Excluded entirely:
COMMERCIAL_LEN_M = 22.0          # type-30 vessels this long or longer
TRAWL_SOG = (1.8, 3.8)           # any vessel with >= TRAWL_BAND_H hours in this band (all days)
TRAWL_BAND_H = 2.0
MAX_SOG_KN = 3.0
DROP_STATUS = {1, 5, 6}          # at anchor, moored, aground
MIN_SHORE_MI = 2.0
COAST_LAT_RANGE = (30.10, 30.55)  # latitude band scanned for the beach
COAST_LAT_STEP = 0.0015
COAST_LON_STEP = 0.01
COAST_SMOOTH_DEG = 0.08          # running-minimum half-width (closes Mobile Bay mouth, passes)
THIN_S = 60
STOP_R_M = 600.0
STOP_GAP_S = 30 * 60
MIN_STOP_PTS = 5
MAX_STAY_H = 6.0
CLUSTER_R_M = 500.0
MIN_CLUSTER_PTS = 15
MIN_DEPTH_FT = 30
MAX_OUT = 60

DL_THREADS = 12
PART_BYTES = 8 << 20


def log(*a):
    print(*a, flush=True)


# ================================================================= fetch
def _box_rows(raw, iLa, iLo):
    """Yield parsed CSV rows whose LAT/LON integer parts fall in BOX's, from a binary stream.

    A C-level regex over 16 MB chunks does the coarse cut (pure-Python csv over ~1 GB/day is far
    too slow); the exact box test happens in the caller. Assumes LON directly follows LAT and the
    box does not straddle 0 deg.
    """
    assert iLo == iLa + 1
    la_i = range(math.trunc(BOX[0]), math.trunc(BOX[1]) + 1)
    lo_i = range(math.trunc(BOX[2]), math.trunc(BOX[3]) + 1)
    alt = lambda r: b"|".join(str(v).encode() for v in r)
    pat = re.compile(rb"^(?:[^,\n]*,){%d}(?:%s)\.[0-9]*,(?:%s)\.[^\n]*"
                     % (iLa, alt(la_i), alt(lo_i)), re.M)
    rest = b""
    while True:
        b = raw.read(1 << 24)
        if not b:
            chunk, rest = rest, b""
        else:
            chunk = rest + b
            cut = chunk.rfind(b"\n") + 1
            chunk, rest = chunk[:cut], chunk[cut:]
        lines = [m.rstrip(b"\r").decode("utf-8", "replace") for m in pat.findall(chunk)]
        yield from csv.reader(lines)
        if not b:
            return


def _get_range(url, a, b):
    req = urllib.request.Request(url, headers={"Range": f"bytes={a}-{b}"})
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                status = r.status
                data = r.read()
            if status == 206 and len(data) == b - a + 1:
                return data
            raise IOError(f"short read {len(data)}")
        except Exception as e:  # network hiccup: retry
            log("range error", a, e)
            time.sleep(3 * (attempt + 1))
    raise RuntimeError(f"could not download {url} bytes {a}-{b}")


def download(url, path):
    """Parallel ranged download (one NOAA connection is often throttled to ~1 MB/s)."""
    req = urllib.request.Request(url, headers={"Range": "bytes=0-0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        size = int(r.headers["Content-Range"].rsplit("/", 1)[1])
    parts = [(a, min(a + PART_BYTES, size) - 1) for a in range(0, size, PART_BYTES)]
    with open(path, "wb") as f:
        f.truncate(size)
        with ThreadPoolExecutor(DL_THREADS) as ex:
            for (a, _b), data in zip(parts, ex.map(lambda p: _get_range(url, *p), parts)):
                f.seek(a)
                f.write(data)


def fetch_day(date):
    y, m, d = date.split("-")
    out = WORK / f"extract_{date}.csv"
    if out.exists():
        log(date, "extract exists, skip")
        return
    url = AIS_URL.format(y=y, m=m, d=d)
    zpath = WORK / f"AIS_{y}_{m}_{d}.zip"
    tmp = out.with_suffix(".part")
    for attempt in range(3):
        t0 = time.time()
        download(url, zpath)
        t1 = time.time()
        try:
            total, kept = _extract(zpath, tmp)
            break
        except (zlib.error, zipfile.BadZipFile, EOFError) as e:  # corrupt download: refetch
            log(date, "corrupt zip, retrying:", e)
            zpath.unlink()
    else:
        tmp.unlink(missing_ok=True)
        log(f"{date}: zip corrupt after 3 downloads, SKIPPED (pick another date)")
        return
    tmp.replace(out)
    zpath.unlink()
    log(f"{date}: {total:,} rows near box, kept {kept:,} in box/type; dl {t1 - t0:.0f}s, "
        f"parse {time.time() - t1:.0f}s")


def _extract(zpath, tmp):
    """Stream the day's CSV out of the zip; write rows inside BOX with a candidate type."""
    la0, la1, lo0, lo1 = BOX
    kept = total = 0
    with zipfile.ZipFile(zpath) as z, open(tmp, "w", newline="\n", encoding="utf-8") as fo:
        member = next(n for n in z.namelist() if n.lower().endswith(".csv"))
        w = csv.writer(fo, lineterminator="\n")
        w.writerow(["mmsi", "t", "lat", "lon", "sog", "type", "status", "len", "name"])
        with z.open(member) as raw:
            hdr = next(csv.reader([raw.readline().decode("utf-8").strip()]))
            ix = {h: i for i, h in enumerate(hdr)}
            iM, iT, iLa, iLo, iS = ix["MMSI"], ix["BaseDateTime"], ix["LAT"], ix["LON"], ix["SOG"]
            iTy, iSt, iLe, iN = ix["VesselType"], ix["Status"], ix["Length"], ix["VesselName"]
            for row in _box_rows(raw, iLa, iLo):
                total += 1
                try:
                    lat = float(row[iLa])
                    if lat < la0 or lat > la1:
                        continue
                    lon = float(row[iLo])
                    if lon < lo0 or lon > lo1:
                        continue
                    vt = int(float(row[iTy])) if row[iTy] else -1
                except (ValueError, IndexError):
                    continue
                if vt not in KEEP_TYPES and vt not in SMALL_PASSENGER:
                    continue
                w.writerow([row[iM], row[iT], row[iLa], row[iLo], row[iS], vt,
                            row[iSt], row[iLe], row[iN]])
                kept += 1
    return total, kept


# ================================================================= DEM helpers
def dem_samples(points):
    """points: list of (lon, lat). Returns list of float metres (nan when no data)."""
    vals = []
    for i in range(0, len(points), 1000):
        chunk = points[i:i + 1000]
        g = {"points": [[round(x, 6), round(y, 6)] for x, y in chunk],
             "spatialReference": {"wkid": 4326}}
        data = urllib.parse.urlencode({
            "geometry": json.dumps(g), "geometryType": "esriGeometryMultipoint",
            "returnFirstValueOnly": "true", "f": "json"}).encode()
        for attempt in range(4):
            try:
                with urllib.request.urlopen(DEM_URL, data, timeout=120) as r:
                    res = json.load(r)
                break
            except Exception as e:
                log("DEM error", e)
                time.sleep(3 * (attempt + 1))
        else:
            raise RuntimeError("DEM service failed")
        got = {s["locationId"]: s.get("value") for s in res.get("samples", [])}
        for j in range(len(chunk)):
            v = got.get(j)
            try:
                vals.append(float(v))
            except (TypeError, ValueError):
                vals.append(float("nan"))
    return vals


def coastline():
    """Southernmost land latitude per meridian (raw) and its running minimum (smoothed)."""
    cache = WORK / f"coast_{REGION}.json"
    if cache.exists():
        c = json.loads(cache.read_text(encoding="utf-8"))
        return np.array(c["lon"]), np.array(c["lat"])
    lons = np.round(np.arange(BOX[2] - COAST_SMOOTH_DEG, BOX[3] + COAST_SMOOTH_DEG + 1e-9,
                              COAST_LON_STEP), 4)
    lats = np.round(np.arange(COAST_LAT_RANGE[0], COAST_LAT_RANGE[1] + 1e-9, COAST_LAT_STEP), 5)
    pts = [(lo, la) for lo in lons for la in lats]
    log(f"coast: sampling DEM at {len(pts):,} points")
    v = np.array(dem_samples(pts)).reshape(len(lons), len(lats))
    coast = []
    for i in range(len(lons)):
        land = np.nonzero(v[i] >= 0)[0]
        coast.append(float(lats[land[0]]) if len(land) else float("nan"))
    c = {"lon": lons.tolist(), "lat": coast}
    cache.write_text(json.dumps(c), encoding="utf-8", newline="\n")
    return lons, np.array(coast)


# ================================================================= build
def load_extracts():
    rows = []
    vessel_len = {}
    for date in DATES:
        p = WORK / f"extract_{date}.csv"
        if not p.exists():
            log("missing extract", date)
            continue
        with open(p, encoding="utf-8", newline="") as f:
            rd = csv.reader(f)
            next(rd)
            for mm, t, la, lo, sog, vt, st, ln, _name in rd:
                try:
                    L = float(ln) if ln else 0.0
                except ValueError:
                    L = 0.0
                if L > 0:
                    vessel_len[mm] = max(vessel_len.get(mm, 0.0), L)
                rows.append((mm, t, float(la), float(lo), float(sog or 0), int(vt),
                             int(float(st)) if st else -1, date))
    return rows, vessel_len


def hav_m(lat1, lon1, lat2, lon2):
    p1, p2 = np.radians(lat1), np.radians(lat2)
    a = (np.sin((p2 - p1) / 2) ** 2
         + np.cos(p1) * np.cos(p2) * np.sin(np.radians(lon2 - lon1) / 2) ** 2)
    return 6_371_000 * 2 * np.arcsin(np.sqrt(a))


def build():
    rows, vlen = load_extracts()
    log(f"loaded {len(rows):,} candidate rows, {len({r[0] for r in rows}):,} vessels")
    clon, craw = coastline()
    ok = ~np.isnan(craw)
    csm = np.array([np.nanmin(craw[max(0, i - int(COAST_SMOOTH_DEG / COAST_LON_STEP)):
                                   i + int(COAST_SMOOTH_DEG / COAST_LON_STEP) + 1])
                    for i in range(len(clon))])
    cpl, cpo = craw[ok], clon[ok]

    # ---- commercial trawlers: big type-30 hulls, or hours at trawl speed summed over the days
    band = {}
    for mm, t, la, lo, sog, vt, st, date in rows:
        if TRAWL_SOG[0] <= sog <= TRAWL_SOG[1]:
            minute = int(datetime.datetime.fromisoformat(t).timestamp() // 60)
            band.setdefault((mm, date), set()).add(minute)
    band_min = {}
    for (mm, _d), mins in band.items():
        band_min[mm] = band_min.get(mm, 0) + len(mins)
    trawlers = {mm for mm, n in band_min.items() if n >= TRAWL_BAND_H * 60}
    trawlers |= {r[0] for r in rows if r[5] == 30 and vlen.get(r[0], 0) >= COMMERCIAL_LEN_M}
    log(f"commercial/trawler vessels excluded: {len(trawlers)}")

    # ---- per-fix filters
    stats = {"type/len": 0, "trawler": 0, "sog": 0, "status": 0, "inshore": 0}
    kept = []
    for r in rows:
        mm, t, la, lo, sog, vt, st, date = r
        L = vlen.get(mm, 0.0)
        if L > MAX_LEN_M or (vt in SMALL_PASSENGER and not (0 < L <= MAX_LEN_M)):
            stats["type/len"] += 1
            continue
        if mm in trawlers:
            stats["trawler"] += 1
            continue
        if sog > MAX_SOG_KN:
            stats["sog"] += 1
            continue
        if st in DROP_STATUS:
            stats["status"] += 1
            continue
        kept.append(r)
    log(f"after type/len/sog/status: {len(kept):,}")
    la = np.array([r[2] for r in kept])
    lo = np.array([r[3] for r in kept])
    coast_here = np.interp(lo, clon, csm)
    off = la < coast_here
    dshore = np.full(len(kept), 0.0)
    for i in np.nonzero(off)[0]:
        dshore[i] = hav_m(la[i], lo[i], cpl, cpo).min()
    off &= dshore >= MIN_SHORE_MI * 1609.344
    stats["inshore"] = int((~off).sum())
    kept = [r for r, k in zip(kept, off) if k]
    log(f"after inshore/2 mi filter: {len(kept):,} fixes, {len({r[0] for r in kept}):,} vessels")

    # ---- thin to one fix per vessel per THIN_S, build stops per vessel-day
    by_vd = {}
    for mm, t, la_, lo_, sog, vt, st, date in kept:
        ts = datetime.datetime.fromisoformat(t).timestamp()
        by_vd.setdefault((mm, date), {}).setdefault(int(ts // THIN_S), (ts, la_, lo_))
    stops = []  # (lat, lon, pts, mmsi, date)
    long_dropped = short_dropped = 0
    for (mm, date), buckets in by_vd.items():
        fx = sorted(buckets.values())
        cur = [fx[0]]
        segs = []
        for f in fx[1:]:
            a = cur[0]
            if (f[0] - cur[-1][0] <= STOP_GAP_S
                    and hav_m(a[1], a[2], f[1], f[2]) <= STOP_R_M):
                cur.append(f)
            else:
                segs.append(cur)
                cur = [f]
        segs.append(cur)
        for s in segs:
            dur_h = (s[-1][0] - s[0][0]) / 3600
            if dur_h > MAX_STAY_H:
                long_dropped += 1
                continue
            if len(s) < MIN_STOP_PTS:
                short_dropped += 1
                continue
            stops.append((float(np.mean([p[1] for p in s])), float(np.mean([p[2] for p in s])),
                          len(s), mm, date))
    log(f"stops: {len(stops):,} kept, {long_dropped} >{MAX_STAY_H}h dropped, "
        f"{short_dropped} short dropped")

    # ---- greedy clustering of stops
    S_la = np.array([s[0] for s in stops])
    S_lo = np.array([s[1] for s in stops])
    S_pt = np.array([s[2] for s in stops])
    vd_key = [(s[3], s[4]) for s in stops]
    n = len(stops)
    nb = [np.nonzero(hav_m(S_la[i], S_lo[i], S_la, S_lo) <= CLUSTER_R_M)[0] for i in range(n)]
    free = np.ones(n, bool)
    clusters = []
    while free.any():
        best, bscore = -1, None
        for i in np.nonzero(free)[0]:
            m = nb[i][free[nb[i]]]
            sc = (len({vd_key[j][0] for j in m}), len({vd_key[j] for j in m}), S_pt[m].sum())
            if bscore is None or sc > bscore:
                best, bscore = i, sc
        cla, clo = S_la[best], S_lo[best]
        for _ in range(2):
            d = hav_m(cla, clo, S_la, S_lo)
            m = np.nonzero((d <= CLUSTER_R_M) & free)[0]
            w = S_pt[m]
            cla, clo = float((S_la[m] * w).sum() / w.sum()), float((S_lo[m] * w).sum() / w.sum())
        if best not in m:
            m = np.append(m, best)
        free[m] = False
        clusters.append({
            "lat": cla, "lon": clo,
            "vessels": len({vd_key[j][0] for j in m}),
            "days": len({vd_key[j][1] for j in m}),
            "pts": int(S_pt[m].sum())})
    good = [c for c in clusters
            if (c["days"] >= 2 or c["vessels"] >= 2) and c["pts"] >= MIN_CLUSTER_PTS]
    log(f"clusters: {len(clusters)} total, {len(good)} pass days/vessels/pts rule")

    # ---- depth
    dep = dem_samples([(c["lon"], c["lat"]) for c in good])
    out = []
    for c, dm in zip(good, dep):
        if math.isnan(dm):
            continue
        ft = round(-dm * 3.28084)
        if ft < MIN_DEPTH_FT:
            continue
        out.append({"lat": round(c["lat"], 3), "lon": round(c["lon"], 3), "depth": ft,
                    "vessels": c["vessels"], "days": c["days"], "pts": c["pts"],
                    "grade": "B" if c["vessels"] >= 2 else "C"})
    out.sort(key=lambda c: (-c["vessels"], -c["days"], -c["pts"]))
    out = out[:MAX_OUT]
    log(f"output {len(out)}: B={sum(c['grade'] == 'B' for c in out)} "
        f"C={sum(c['grade'] == 'C' for c in out)}; depth "
        f"{min((c['depth'] for c in out), default=0)}-{max((c['depth'] for c in out), default=0)} ft")
    log("filter drops:", stats)

    days_txt = ", ".join(datetime.date.fromisoformat(d).strftime("%b %d") for d in DATES)
    hdr = (f"/* AIS fleet-activity loiter spots — {TITLE}. Slow-speed\n"
           f"   (<={MAX_SOG_KN:g} kn) fishing/pleasure/small charter vessels from NOAA Marine "
           f"Cadastre AIS\n   ({len(DATES)} sampled 2024 days: {days_txt}),\n"
           f"   clustered where independent boats held station across days. B = 2+ boats,\n"
           f"   C = one boat on 2+ days. Commercial shrimp trawlers excluded. Biased to\n"
           f"   larger charter/sport boats (many small private boats carry no AIS). The\n"
           f"   working fleet fishes here — verify on your sounder. "
           f"{datetime.date.today().isoformat()}. */\n")
    body = json.dumps(out, separators=(",", ":"))
    OUT.write_text(f"{hdr}window.{VAR} = {body};\n", encoding="utf-8", newline="\n")
    log("wrote", OUT)


def main():
    WORK.mkdir(parents=True, exist_ok=True)
    stage = sys.argv[1] if len(sys.argv) > 1 else "all"
    if stage in ("fetch", "all"):
        for d in DATES:
            fetch_day(d)
    if stage in ("build", "all"):
        build()


if __name__ == "__main__":
    main()
