"""CSB anomaly mining: crowd-sourced sonar vs the NOAA depth model.

Finds places where several independent crowd-sourced sonar tracks disagree with
the NOAA NCEI DEM -- likely uncharted structure.  'rise' = the crowd reads
SHALLOWER than the model (bump, wreck, rock); 'hole' = the crowd reads DEEPER
(depression, scour, borrow pit).  Output is a GoFish data file
(window.<OUT_VAR> = [...]) with one point per feature.

Sources
  * Crowdsourced bathymetry (CSB): NOAA / IHO DCDB, AWS Open Data bucket
    noaa-dcdb-bathymetry-pds, csb/csv/YYYY/MM/DD/<upload>_pointData.csv
    (columns UNIQUE_ID,FILE_UUID,LON,LAT,DEPTH,TIME,PLATFORM_NAME,PROVIDER).
    The bucket is partitioned by upload date only, so the spatial index is the
    NCEI "CSB Lines" feature layer (gis.ngdc.noaa.gov/arcgis/rest/services/csb/
    MapServer/1): its NAME field is the upload name, which maps 1:1 to the S3
    key.  We query the lines that cross the box, keep the ones whose
    (densified) track actually runs through open offshore water, and stream
    only those CSVs, keeping just the soundings inside the box.
  * Depth model: NOAA NCEI DEM_mosaics/DEM_all ImageServer, exportImage F32
    raw (bsq) at DEM_RES_DEG (~100 m), bilinear, sampled bilinearly at each
    sounding.

Method
  1. Offshore mask: the Gulf-side shoreline is found per DEM column by walking
     north from the south edge to the first land pixel; a running minimum over
     PASS_WINDOW_KM closes the tidal passes, so bays and sounds behind the
     barrier islands (Mobile Bay, Perdido Bay, Pensacola Bay, Santa Rosa
     Sound, Choctawhatchee Bay, Mississippi Sound) fall outside.  Soundings must
     be SHORE_BUFFER_M seaward of that line, in model depth >= MIN_DEPTH_FT
     (drops the surf zone), and outside EXCLUDE_RECTS (dredged bar channels).
  2. Track = platform UNIQUE_ID + UTC day.  Per track, bias = median(model
     depth - crowd depth) over its offshore soundings (drafts, tides and
     waterline offsets differ by boat); the de-biased residual is
     r = model - (crowd + bias), in feet.  Tracks with too few offshore
     soundings or a noisy residual (robust sigma > TRACK_MAX_SIGMA_FT) are
     dropped; gross outliers (|r| > OUTLIER_FRAC x model depth, e.g. second
     echoes / lost bottom) are dropped.
  3. Soundings are binned into CELL_DEG cells.  Per cell, each track gives the
     median of its residuals (needs MIN_PER_TRACK soundings); the cell anomaly
     is the median over tracks.  A cell is a hit when |anomaly| >= ANOM_MIN_FT,
     at least MIN_TRACKS tracks confirm it (same sign, |track median| >=
     CONFIRM_FRAC x ANOM_MIN_FT), confirming tracks are >= AGREE_FRAC of the
     tracks in the cell (the crowd agrees with itself), the cell holds
     >= MIN_SOUNDINGS soundings, and |anomaly| beats SLOPE_FACTOR x the local
     DEM relief (so a small position error on a steep slope cannot explain it).
  4. Hit cells of the same kind within MERGE_GAP_CELLS cells of each other
     merge into one feature, reported at the strongest cell.  Features within KNOWN_RADIUS_M of known structure
     (reefs, charted wrecks/obstructions, platforms in KNOWN_SOURCES) are
     skipped.  'boats' = distinct platforms among the agreeing tracks; a
     feature seen by one boat only is kept when that boat agrees on
     >= SINGLE_BOAT_MIN_DAYS different days.  Grade B = >= GRADE_B_BOATS boats
     and >= GRADE_B_TRACKS tracks agree, otherwise C.
     Anomaly sign: anom = model - de-biased crowd (ft); NEGATIVE = hole,
     POSITIVE = rise.  Kept: strongest MAX_OUT, sorted by strength.

Usage
  python -I tools/bottom/csb_anomalies.py            # fetch what is missing, compute, write
  python -I tools/bottom/csb_anomalies.py --stats    # also print diagnostics
To run another region, change the REGION block below (box, output file/var,
title, known-structure sources, channel rectangles).  Caches live in WORK_DIR
(outside the repo); delete a cache file to refetch it.  stdlib + numpy only.
"""
import datetime
import json
import math
import os
import sys
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

import numpy as np

# ---------------------------------------------------------------- REGION ----
REGION = "gulfshores"
REGION_TITLE = ("Gulf Shores / Orange Beach, AL through Pensacola and Destin, FL "
                "offshore")
LAT_MIN, LAT_MAX = 29.30, 30.45
LON_MIN, LON_MAX = -88.45, -86.25
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, "..", ".."))
WORK_DIR = os.path.normpath(os.path.join(REPO, "..", "bottom_work", "csb", REGION))
OUT_JS = os.path.join(REPO, "data", "csb_gulfshores.js")
OUT_VAR = "CSB_ANOMALIES_GULFSHORES"
# (file, [window variables]); objects need lat/lon keys, rows are [lat, lon, ...]
KNOWN_SOURCES = [
    (os.path.join(REPO, "data", "reefs_gulfshores.js"),
     ["REEFS_GULFSHORES", "WRECKS_GULFSHORES"]),
    (os.path.join(REPO, "data", "rigs_gulfshores.js"), ["RIGS_GULFSHORES"]),
]
# Dredged channels / inlet shoals the shoreline mask does not catch:
# (name, lat_min, lat_max, lon_min, lon_max)
EXCLUDE_RECTS = [
    ("Mobile Bar channel + ebb shoal", 30.08, 30.26, -88.10, -87.98),
    ("Pensacola Bar (Caucus) channel", 30.24, 30.34, -87.345, -87.27),
    ("Perdido Pass channel", 30.24, 30.29, -87.575, -87.54),
    ("Destin East Pass channel", 30.36, 30.40, -86.535, -86.50),
]

# ------------------------------------------------------------ THRESHOLDS ----
DEM_RES_DEG = 0.001          # ~100 m model grid
CELL_DEG = 0.0013            # ~145 m (lat) x ~125 m (lon) analysis cells
MIN_DEPTH_FT = 25.0          # surf zone / beach shoals out
MAX_DEPTH_FT = 300.0         # deeper, small-boat sounders lose bottom / beam-on-slope bias
SHORE_BUFFER_M = 400.0       # seaward of the Gulf beach line
PASS_WINDOW_KM = 6.0         # running-min window that closes tidal passes
TRACK_MIN_PTS = 60           # offshore soundings needed to estimate a track's bias
TRACK_MAX_SIGMA_FT = 6.0     # robust residual sigma above which a track is too noisy
BIAS_BANDS_FT = [40, 60, 80, 100, 130, 160, 200, 250]  # depth bands for the de-bias
BAND_MIN_PTS = 300           # soundings a track needs in a band to refine its bias
OUTLIER_FRAC = 0.5           # drop soundings with |r| > this x model depth ...
OUTLIER_MAX_FT = 60.0        # ... or > this (second echoes, lost bottom, fish)
ANOM_MIN_FT = 10.0           # |anomaly| to report ...
ANOM_REL = 0.05              # ... and at least this x model depth
CONFIRM_FRAC = 0.7           # a track confirms if |its median| >= this x ANOM_MIN_FT
MIN_TRACKS = 2               # confirming tracks needed
MIN_PLATFORMS = 1            # distinct boats among the confirming tracks
AGREE_FRAC = 0.66            # confirming share of all tracks in the cell
GRADE_B_TRACKS = 3           # grade B needs this many agreeing tracks ...
GRADE_B_BOATS = 2            # ... from at least this many different boats
SINGLE_BOAT_MIN_DAYS = 3     # a one-boat feature must repeat on this many days
MIN_PER_TRACK = 2            # soundings per track inside a cell
MIN_SOUNDINGS = 8            # soundings per cell
SLOPE_FACTOR = 1.0           # |anomaly| must beat this x DEM relief (3x3 px)
MERGE_GAP_CELLS = 3          # same-kind hit cells this many cells apart = one feature
KNOWN_RADIUS_M = 200.0
MAX_OUT = 80

# ---------------------------------------------------------------- SOURCES ---
CSB_LINES = "https://gis.ngdc.noaa.gov/arcgis/rest/services/csb/MapServer/1/query"
CSB_S3 = "https://noaa-dcdb-bathymetry-pds.s3.amazonaws.com/csb/csv/"
DEM_EXPORT = ("https://gis.ngdc.noaa.gov/arcgis/rest/services/DEM_mosaics/DEM_all/"
              "ImageServer/exportImage")
M_TO_FT = 3.28084
UA = {"User-Agent": "GoFish-csb-anomalies/1.0"}


def log(*a):
    print(*a, flush=True)


def http_get(url, tries=4, timeout=180):
    for k in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 404:
                raise
            err = e
        except Exception as e:  # network hiccup: retry
            err = e
        time.sleep(2 + 3 * k)
    raise err


# --------------------------------------------------------------------- DEM --
def dem_grid():
    """Return (elev[ny,nx] north-up, lat0_top, lon0_left, res); cached."""
    path = os.path.join(WORK_DIR, "dem_%g.npy" % DEM_RES_DEG)
    nx = int(round((LON_MAX - LON_MIN) / DEM_RES_DEG))
    ny = int(round((LAT_MAX - LAT_MIN) / DEM_RES_DEG))
    if os.path.exists(path):
        return np.load(path), LAT_MAX, LON_MIN, DEM_RES_DEG
    elev = np.full((ny, nx), np.nan, dtype=np.float32)
    band = 400
    for r0 in range(0, ny, band):
        h = min(band, ny - r0)
        top = LAT_MAX - r0 * DEM_RES_DEG
        bot = top - h * DEM_RES_DEG
        q = urllib.parse.urlencode({
            "bbox": "%.6f,%.6f,%.6f,%.6f" % (LON_MIN, bot, LON_MAX, top),
            "bboxSR": 4326, "imageSR": 4326, "size": "%d,%d" % (nx, h),
            "format": "bsq", "pixelType": "F32",
            "interpolation": "RSP_BilinearInterpolation", "f": "image"})
        b = http_get(DEM_EXPORT + "?" + q)
        npx = nx * h
        a = np.frombuffer(b[:4 * npx], dtype="<f4").reshape(h, nx).copy()
        mask = np.unpackbits(np.frombuffer(b[4 * npx:], dtype=np.uint8))[:npx]
        if mask.size == npx:
            a[mask.reshape(h, nx) == 0] = np.nan
        elev[r0:r0 + h] = a
        log("  DEM rows %d-%d" % (r0, r0 + h))
    np.save(path, elev)
    return elev, LAT_MAX, LON_MIN, DEM_RES_DEG


def dem_sample(elev, lat, lon):
    """Bilinear sample of the north-up grid at points (pixel centres)."""
    ny, nx = elev.shape
    fy = (LAT_MAX - lat) / DEM_RES_DEG - 0.5
    fx = (lon - LON_MIN) / DEM_RES_DEG - 0.5
    y0 = np.clip(np.floor(fy).astype(int), 0, ny - 2)
    x0 = np.clip(np.floor(fx).astype(int), 0, nx - 2)
    wy = np.clip(fy - y0, 0, 1)
    wx = np.clip(fx - x0, 0, 1)
    return ((elev[y0, x0] * (1 - wx) + elev[y0, x0 + 1] * wx) * (1 - wy)
            + (elev[y0 + 1, x0] * (1 - wx) + elev[y0 + 1, x0 + 1] * wx) * wy)


def shoreline(elev):
    """Gulf beach latitude per DEM column (passes closed by running min)."""
    ny, nx = elev.shape
    land = ~(elev < 0)                      # NaN counts as land (safe side)
    shore = np.full(nx, LAT_MAX, dtype=float)
    for x in range(nx):
        rows = np.nonzero(land[:, x])[0]    # row 0 = north
        if rows.size:
            # southernmost land pixel reachable walking north from the south edge
            shore[x] = LAT_MAX - (rows.max() + 1) * DEM_RES_DEG
    w = max(1, int(PASS_WINDOW_KM / (111.32 * math.cos(math.radians(30)) * DEM_RES_DEG)))
    out = shore.copy()
    for x in range(nx):
        out[x] = shore[max(0, x - w):x + w + 1].min()
    return out


def offshore_mask(elev, shore, lat, lon):
    model_ft = -dem_sample(elev, lat, lon) * M_TO_FT
    col = np.clip(((lon - LON_MIN) / DEM_RES_DEG).astype(int), 0, shore.size - 1)
    ok = (lat < shore[col] - SHORE_BUFFER_M / 111320.0) & (model_ft >= MIN_DEPTH_FT)
    ok &= model_ft <= MAX_DEPTH_FT
    ok &= (lat >= LAT_MIN) & (lat < LAT_MAX) & (lon >= LON_MIN) & (lon < LON_MAX)
    for _, a, b, c, d in EXCLUDE_RECTS:
        ok &= ~((lat >= a) & (lat <= b) & (lon >= c) & (lon <= d))
    return ok, model_ft


# ------------------------------------------------------------- CSB index ----
def csb_index(elev, shore):
    """Lines crossing the box (NCEI CSB Lines), flagged if they run offshore."""
    path = os.path.join(WORK_DIR, "csb_lines.json")
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    rows, off = [], 0
    while True:
        q = urllib.parse.urlencode({
            "where": "1=1", "geometryType": "esriGeometryEnvelope",
            "geometry": "%f,%f,%f,%f" % (LON_MIN, LAT_MIN, LON_MAX, LAT_MAX),
            "inSR": 4326, "outSR": 4326, "spatialRel": "esriSpatialRelIntersects",
            "outFields": "NAME,PLATFORM,PROVIDER,FILE_SIZE,YEAR,OBJECTID",
            "returnGeometry": "true", "maxAllowableOffset": 0.0005,
            "orderByFields": "OBJECTID", "resultOffset": off,
            "resultRecordCount": 200, "f": "json"})
        d = json.loads(http_get(CSB_LINES + "?" + q))
        feats = d.get("features", [])
        for ft in feats:
            a = ft["attributes"]
            pts = []
            for path_ in (ft.get("geometry") or {}).get("paths", []):
                for (x0, y0), (x1, y1) in zip(path_[:-1], path_[1:]):
                    k = max(1, int(math.hypot(x1 - x0, y1 - y0) / 0.003))
                    t = np.arange(k) / k
                    pts.append(np.c_[x0 + (x1 - x0) * t, y0 + (y1 - y0) * t])
                if path_:
                    pts.append(np.array([path_[-1]]))
            hits = 0
            if pts:
                p = np.vstack(pts)
                m, _ = offshore_mask(elev, shore, p[:, 1], p[:, 0])
                hits = int(m.sum())
            a["offshore_vertices"] = hits
            rows.append(a)
        off += len(feats)
        log("  CSB lines: %d" % off)
        if not feats or not d.get("exceededTransferLimit"):
            break
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(rows, f)
    return rows


def s3_key(name):
    base = name[:-7] if name.endswith(".tar.gz") else name
    return "%s/%s/%s/%s_pointData.csv" % (base[0:4], base[4:6], base[6:8], base)


def fetch_points(name):
    """Stream one CSB CSV, keep soundings in the box; cached as .npz."""
    pdir = os.path.join(WORK_DIR, "pts")
    out = os.path.join(pdir, name.replace(".tar.gz", "") + ".npz")
    if os.path.exists(out):
        return out, 0
    try:
        req = urllib.request.Request(CSB_S3 + s3_key(name), headers=UA)
        lon, lat, dep, day, uid = [], [], [], [], {}
        uidx = []
        nbytes = 0
        for attempt in range(4):
            try:
                with urllib.request.urlopen(req, timeout=300) as r:
                    lon, lat, dep, day, uidx, uid, nbytes = [], [], [], [], [], {}, 0
                    r.readline()
                    for raw in r:
                        nbytes += len(raw)
                        p = raw.split(b",", 6)
                        if len(p) < 6:
                            continue
                        try:
                            x = float(p[2]); y = float(p[3])
                        except ValueError:
                            continue
                        if not (LAT_MIN <= y < LAT_MAX and LON_MIN <= x < LON_MAX):
                            continue
                        try:
                            z = float(p[4])
                        except ValueError:
                            continue
                        t = p[5][:10].decode("ascii", "replace")
                        try:
                            dn = datetime.date(int(t[0:4]), int(t[5:7]), int(t[8:10])).toordinal()
                        except ValueError:
                            dn = 0
                        u = p[0].decode("utf-8", "replace")
                        lon.append(x); lat.append(y); dep.append(z); day.append(dn)
                        uidx.append(uid.setdefault(u, len(uid)))
                break
            except urllib.error.HTTPError:
                raise
            except Exception:
                if attempt == 3:
                    raise
                time.sleep(3 + 5 * attempt)
        np.savez(out, lon=np.array(lon, float), lat=np.array(lat, float),
                 depth=np.array(dep, np.float32), day=np.array(day, np.int32),
                 uidx=np.array(uidx, np.int32),
                 uids=np.array(list(uid.keys()) or [""]))
        return out, nbytes
    except urllib.error.HTTPError as e:
        np.savez(out, lon=np.zeros(0), lat=np.zeros(0), depth=np.zeros(0, np.float32),
                 day=np.zeros(0, np.int32), uidx=np.zeros(0, np.int32),
                 uids=np.array([""]), missing=np.array([e.code]))
        return out, 0


# ------------------------------------------------------------ known stuff ---
def known_points():
    pts = []
    for path, names in KNOWN_SOURCES:
        with open(path, encoding="utf-8") as f:
            txt = f.read()
        dec = json.JSONDecoder()
        for nm in names:
            i = txt.find("window.%s" % nm)
            if i < 0:
                raise SystemExit("missing %s in %s" % (nm, path))
            i = txt.index("=", i) + 1
            while txt[i].isspace():
                i += 1
            arr, _ = dec.raw_decode(txt, i)
            for o in arr:
                if isinstance(o, dict):
                    pts.append((float(o["lat"]), float(o["lon"])))
                else:
                    pts.append((float(o[0]), float(o[1])))
    return np.array(pts, float)


def near_known(lat, lon, known):
    dy = (known[:, 0] - lat) * 111320.0
    dx = (known[:, 1] - lon) * 111320.0 * math.cos(math.radians(lat))
    return bool(np.any(dy * dy + dx * dx <= KNOWN_RADIUS_M ** 2))


# --------------------------------------------------------------- analysis ---
def median_by_group(keys, vals):
    """Return (unique keys, median per key, count per key)."""
    o = np.lexsort((vals, keys))
    k, v = keys[o], vals[o]
    uk, start, cnt = np.unique(k, return_index=True, return_counts=True)
    lo = start + (cnt - 1) // 2
    hi = start + cnt // 2
    return uk, 0.5 * (v[lo] + v[hi]), cnt


def main():
    stats = "--stats" in sys.argv
    os.makedirs(os.path.join(WORK_DIR, "pts"), exist_ok=True)
    log("DEM ...")
    elev, _, _, _ = dem_grid()
    shore = shoreline(elev)
    log("CSB index ...")
    lines = csb_index(elev, shore)
    want = sorted({a["NAME"] for a in lines if a["offshore_vertices"] > 0})
    log("  %d lines cross the box, %d run offshore" % (len(lines), len(want)))
    todo = [n for n in want if not os.path.exists(
        os.path.join(WORK_DIR, "pts", n.replace(".tar.gz", "") + ".npz"))]
    if todo:
        log("downloading %d CSB files ..." % len(todo))
        done = 0
        with ThreadPoolExecutor(8) as ex:
            for _, nb in ex.map(fetch_points, todo):
                done += 1
                if done % 25 == 0:
                    log("  %d/%d" % (done, len(todo)))

    # ---- load soundings
    L = {"lon": [], "lat": [], "depth": [], "track": []}
    tracks = {}
    platform_of = []
    missing = 0
    for n in want:
        z = np.load(os.path.join(WORK_DIR, "pts", n.replace(".tar.gz", "") + ".npz"))
        if "missing" in z.files:
            missing += 1
            continue
        if z["lon"].size == 0:
            continue
        uids = z["uids"]
        for u_i, d in set(zip(z["uidx"].tolist(), z["day"].tolist())):
            key = (str(uids[u_i]), d)
            if key not in tracks:
                tracks[key] = len(tracks)
                platform_of.append(str(uids[u_i]))
        tid = np.array([tracks[(str(uids[u]), d)] for u, d in
                        zip(z["uidx"].tolist(), z["day"].tolist())], np.int64)
        for k in ("lon", "lat", "depth"):
            L[k].append(z[k])
        L["track"].append(tid)
    lon = np.concatenate(L["lon"]); lat = np.concatenate(L["lat"])
    crowd_ft = np.concatenate(L["depth"]).astype(float) * M_TO_FT
    trk = np.concatenate(L["track"])
    platform_of = np.array(platform_of)
    n_box, t_box = lon.size, np.unique(trk).size
    log("soundings in box: %d from %d tracks (%d platforms); %d files missing on S3"
        % (n_box, t_box, np.unique(platform_of[np.unique(trk)]).size, missing))

    # ---- offshore + sane soundings
    ok, model_ft = offshore_mask(elev, shore, lat, lon)
    ok &= np.isfinite(model_ft) & (crowd_ft > 1.0)
    lon, lat, crowd_ft, trk, model_ft = lon[ok], lat[ok], crowd_ft[ok], trk[ok], model_ft[ok]
    log("offshore soundings: %d from %d tracks" % (lon.size, np.unique(trk).size))

    # ---- per-track bias
    # Overall median per track, refined per depth band where the track has
    # BAND_MIN_PTS soundings (a sound-speed / scale error drifts with depth),
    # interpolated linearly in depth between the band medians.
    d0 = model_ft - crowd_ft
    ut, bias, cnt = median_by_group(trk, d0)
    bias_of = np.full(len(tracks), np.nan)
    bias_of[ut] = np.where(cnt >= TRACK_MIN_PTS, bias, np.nan)
    corr = bias_of[trk].copy()
    nb = len(BIAS_BANDS_FT) + 1
    tb = trk * nb + np.digitize(model_ft, BIAS_BANDS_FT)
    ub, bmed, bcnt = median_by_group(tb, d0)
    _, bdep, _ = median_by_group(tb, model_ft)
    sel = bcnt >= BAND_MIN_PTS
    ub, bmed, bdep = ub[sel], bmed[sel], bdep[sel]
    order = np.argsort(trk, kind="stable")
    tstart = np.searchsorted(trk[order], np.arange(len(tracks) + 1))
    for t in np.unique(ub // nb):
        if not np.isfinite(bias_of[t]):
            continue
        k = (ub // nb) == t
        idx = order[tstart[t]:tstart[t + 1]]
        xs, ys = bdep[k], bmed[k]
        o = np.argsort(xs)
        corr[idx] = np.interp(model_ft[idx], xs[o], ys[o])
    r = model_ft - (crowd_ft + corr)
    good = np.isfinite(r) & (np.abs(r) <= np.minimum(OUTLIER_FRAC * model_ft, OUTLIER_MAX_FT))
    ut2, mad, cnt2 = median_by_group(trk[good], np.abs(r[good]))
    sig_of = np.full(len(tracks), np.inf)
    sig_of[ut2] = 1.4826 * mad
    good &= sig_of[trk] <= TRACK_MAX_SIGMA_FT
    if stats:
        s = sig_of[np.isfinite(sig_of)]
        log("track sigma pct 10/50/90:", np.percentile(s, [10, 50, 90]).round(1) if s.size else "-")
        b = bias_of[np.isfinite(bias_of)]
        log("track bias  pct 10/50/90:", np.percentile(b, [10, 50, 90]).round(1) if b.size else "-")
    lon, lat, r, trk, model_ft = lon[good], lat[good], r[good], trk[good], model_ft[good]
    n_used, t_used = lon.size, np.unique(trk).size
    log("used after de-bias/noise filter: %d soundings, %d tracks, %d platforms"
        % (n_used, t_used, np.unique(platform_of[np.unique(trk)]).size))

    # ---- cells
    ci = np.floor((lat - LAT_MIN) / CELL_DEG).astype(np.int64)
    cj = np.floor((lon - LON_MIN) / CELL_DEG).astype(np.int64)
    NJ = int(math.ceil((LON_MAX - LON_MIN) / CELL_DEG)) + 1
    cell = ci * NJ + cj
    ntr = len(tracks)
    ct_key = cell * ntr + trk
    uct, tmed, tcnt = median_by_group(ct_key, r)
    uc_cell, uc_trk = uct // ntr, uct % ntr
    keep = tcnt >= MIN_PER_TRACK
    uc_cell, uc_trk, tmed, tcnt = uc_cell[keep], uc_trk[keep], tmed[keep], tcnt[keep]
    ucell, cmed, ctr = median_by_group(uc_cell, tmed)
    hits = {}
    order = np.argsort(uc_cell, kind="stable")
    sc, st, sm, sn = uc_cell[order], uc_trk[order], tmed[order], tcnt[order]
    bounds = np.searchsorted(sc, ucell)
    ends = np.append(bounds[1:], sc.size)
    for c, a, b0, b1 in zip(ucell, cmed, bounds, ends):
        if abs(a) < ANOM_MIN_FT or b1 - b0 < MIN_TRACKS:
            continue
        i, j = divmod(int(c), NJ)
        clat = LAT_MIN + (i + 0.5) * CELL_DEG
        clon = LON_MIN + (j + 0.5) * CELL_DEG
        cdep = -float(dem_sample(elev, np.array([clat]), np.array([clon]))[0]) * M_TO_FT
        thr = max(ANOM_MIN_FT, ANOM_REL * cdep)
        if abs(a) < thr:
            continue
        m, t_, nn = sm[b0:b1], st[b0:b1], sn[b0:b1]
        conf = (np.sign(m) == np.sign(a)) & (np.abs(m) >= CONFIRM_FRAC * thr)
        if conf.sum() < MIN_TRACKS or conf.sum() < AGREE_FRAC * m.size:
            continue
        if np.unique(platform_of[t_[conf]]).size < MIN_PLATFORMS:
            continue
        if nn.sum() < MIN_SOUNDINGS:
            continue
        # local DEM relief (3x3 px around the cell centre)
        y = int((LAT_MAX - clat) / DEM_RES_DEG); x = int((clon - LON_MIN) / DEM_RES_DEG)
        win = elev[max(0, y - 1):y + 2, max(0, x - 1):x + 2] * M_TO_FT
        relief = float(np.nanmax(win) - np.nanmin(win))
        if abs(a) < SLOPE_FACTOR * relief:
            continue
        hits[(i, j)] = {"anom": float(a), "n": int(nn.sum()),
                        "tracks": set(t_[conf].tolist()), "lat": clat, "lon": clon,
                        "relief": relief}
    log("hit cells: %d" % len(hits))

    # ---- merge adjacent same-kind cells
    seen, feats = set(), []
    for k0 in hits:
        if k0 in seen:
            continue
        sgn = np.sign(hits[k0]["anom"])
        comp, stack = [], [k0]
        seen.add(k0)
        while stack:
            k = stack.pop()
            comp.append(k)
            for di in range(-MERGE_GAP_CELLS, MERGE_GAP_CELLS + 1):
                for dj in range(-MERGE_GAP_CELLS, MERGE_GAP_CELLS + 1):
                    nb = (k[0] + di, k[1] + dj)
                    if nb in hits and nb not in seen and np.sign(hits[nb]["anom"]) == sgn:
                        seen.add(nb)
                        stack.append(nb)
        best = max(comp, key=lambda k: abs(hits[k]["anom"]) * math.sqrt(len(hits[k]["tracks"])))
        h = hits[best]
        feats.append(dict(h, cells=len(comp)))

    known = known_points()
    out, skipped, one_boat = [], 0, 0
    for f in feats:
        if near_known(f["lat"], f["lon"], known):
            skipped += 1
            continue
        nt = len(f["tracks"])
        boats = int(np.unique(platform_of[list(f["tracks"])]).size)
        # A track is one boat-day: a single boat must repeat itself on
        # SINGLE_BOAT_MIN_DAYS different days to count.
        if boats < 2 and nt < SINGLE_BOAT_MIN_DAYS:
            one_boat += 1
            continue
        depth = -float(dem_sample(elev, np.array([f["lat"]]), np.array([f["lon"]]))[0]) * M_TO_FT
        out.append({"lat": round(f["lat"], 5), "lon": round(f["lon"], 5),
                    "depth": int(round(depth)), "anom": round(f["anom"], 1),
                    "n": f["n"], "tracks": nt, "boats": boats,
                    "kind": "rise" if f["anom"] > 0 else "hole",
                    "grade": ("B" if boats >= GRADE_B_BOATS and nt >= GRADE_B_TRACKS
                              else "C"),
                    "_score": abs(f["anom"]) * math.sqrt(min(nt, 8)),
                    "_cells": f["cells"], "_relief": round(f["relief"], 1)})
    out.sort(key=lambda o: -o["_score"])
    out = out[:MAX_OUT]
    log("features: %d merged, %d skipped near known structure, %d dropped "
        "(one boat, < %d days), %d written"
        % (len(feats), skipped, one_boat, SINGLE_BOAT_MIN_DAYS, len(out)))
    if stats:
        for o in out:
            log("  %(lat).5f %(lon).5f %(depth)4dft %(anom)+6.1f n=%(n)4d tr=%(tracks)2d "
                "boats=%(boats)d cells=%(_cells)d relief=%(_relief)s %(kind)s %(grade)s" % o)
    kinds = {}
    for o in out:
        kinds[(o["kind"], o["grade"])] = kinds.get((o["kind"], o["grade"]), 0) + 1
    log("by kind/grade:", kinds)
    if out:
        log("depth range: %d-%d ft" % (min(o["depth"] for o in out), max(o["depth"] for o in out)))

    rows = [{k: v for k, v in o.items() if not k.startswith("_")} for o in out]
    today = datetime.date.today().isoformat()
    header = (
        "/* CSB anomaly mining — %s.\n"
        "   Crowdsourced sonar (NOAA DCDB, AWS noaa-dcdb-bathymetry-pds) vs the NOAA DEM,\n"
        "   per-track de-biased for draft/tide (by depth band).\n"
        "   Cells where multiple crowd tracks disagree with the model = uncharted structure:\n"
        "   'rise' = shallower than charted (bump/wreck), 'hole' = deeper (depression).\n"
        "   Known reefs, charted wrecks/obstructions and platforms within %dm are left out.\n"
        "   COMPUTED from crowd data — verify on your sounder. Harvested %s. */\n"
        % (REGION_TITLE, int(KNOWN_RADIUS_M), today))
    with open(OUT_JS, "w", encoding="utf-8", newline="\n") as f:
        f.write(header)
        f.write("window.%s = %s;\n" % (OUT_VAR, json.dumps(rows, separators=(",", ":"))))
    log("wrote %s (%d features)" % (OUT_JS, len(rows)))


if __name__ == "__main__":
    main()
