"""Find bottom structure (rises, holes, ledges) in a NOAA NCEI DEM raster for GoFish.

Input: a fine elevation raster written by fetch_dem.py (default 0.0004 deg,
locked to crm_vol4_2023) that covers the region box plus a pad (>= 1.5 mi each
side; extra pad is analysed but only features inside the region box are written).

Method
------
1. Block-average the fine raster 3x3 to the ~120 m analysis raster
   (0.0012 deg; 133 m N-S x ~116 m E-W at 30 N). Depth in feet.
2. Seams: ``detect_seams`` on the FINE raster flags straight steps that run
   exactly along a latitude or longitude line (survey-patch edges and source
   seams inside the compilation). Flagged coarse cells are buffered 1 cell
   ("seam core") and 5 cells ("seam zone").
3. Open-Gulf mask (``gulf_mask``): below sea level, S/SW/SE rays clear of land
   (so Mobile Bay, Perdido/Pensacola/Choctawhatchee Bays, Santa Rosa Sound and
   Mississippi Sound drop out), opened by 3 cells to cut the passes, connected
   to the south edge; then depth between MIN_FT and MAX_FT, and more than
   SHORE_BUF cells from land or water shallower than SHORE_FT (the beach
   shoreface and pass/ship-channel slopes would otherwise read as ledges).
4. Background = mean depth in a +/-1.5 mi window (water cells only).
   resid = depth - background (ft; negative = shallower than surroundings).
   slope = gradient of the 3x3-smoothed depth, ft per mile; bgslope = mean
   slope in the same 1.5 mi window.
5. Candidate cells: rise resid <= -RISE_T; hole resid >= HOLE_T; ledge
   slope >= LEDGE_S and slope - bgslope >= LEDGE_X (steep for its
   neighbourhood, so a uniformly steep shelf break or canyon wall is not one
   long ledge). Seam-core cells never count. 8-connected blobs of at least
   MIN_NPX cells (MIN_NPX_STRONG for a rise/hole with |resid| >= STRONG_RESID)
   become features; one point per blob at its strongest cell. Ledges are
   8-connected blobs; rises and holes are peak-seeded regions
   (``_peak_regions``: each local extreme grows over the candidate cells at
   least half as strong), so pinnacles are not swallowed by broad blobs.
   Rises and holes must also have directional prominence (``_prominence``)
   >= PROM_MIN / HOLE_PROM_MIN: higher (deeper) than the cells on BOTH sides
   in all four directions, which rejects shelf-break crests, sand ridges and
   dredged channels that are flat along their own length.
   Survey texture (``bottom_common.texture``): where the compilation is
   interpolated between sparse soundings (index < TEX_THR) a feature needs
   MODEL_MIN_NPX cells and is graded C at most, and the track-line test
   (``_aligned``) applies: ALIGN_N or more same-kind blobs (small ones
   included) strung along one grid row or column are bullseyes around a
   survey line and are dropped. Multibeam areas keep full detail, so an
   E-W reef trend there is not mistaken for a track line.
6. Seam rejection: blobs with more than SEAM_FRAC of their cells in the seam
   zone, or whose strongest cell is in the seam zone, are dropped.
7. Fields: depth (ft at that cell), resid (ft), slope (ft/mi), npx, area
   (sq mi), relief (ft): rise = ring median depth - shallowest blob depth;
   hole = deepest blob depth - ring median; ledge = depth range over the blob
   plus a 2-cell ring. grade B = strong (see GRADE_*), else C.
8. Thinning: keep the best feature of each kind within THIN_MI (THIN_DEEP_MI
   deeper than DEEP_FT, where canyon walls would otherwise flood the list).

Usage
-----
    python -I compute_ledges.py --raster <dem>/gulfshores_0004.npy \
        --region 29.30,30.45,-88.45,-86.25 --name GULFSHORES \
        --out <repo>/data/ledges_gulfshores.js --diag <workdir>

Thresholds are constants below and can be overridden with --set KEY=VALUE.
"""
import argparse
import datetime
from collections import deque
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bottom_common as bc  # noqa: E402

P = dict(
    FACTOR=3,          # fine -> analysis block size (0.0004 * 3 = 0.0012 deg)
    BG_MI=1.5,         # background window half-width, miles
    MIN_FT=25.0,       # shallowest water analysed (surf zone excluded)
    MAX_FT=600.0,      # deepest water analysed
    SHORE_FT=20.0,     # water shallower than this (and land) ...
    SHORE_BUF=6,       # ... is buffered this many cells: shoreface/pass slopes are not structure
    RISE_T=12.0,       # rise: resid <= -RISE_T ft
    HOLE_T=14.0,       # hole: resid >= HOLE_T ft
    LEDGE_S=80.0,      # ledge: slope >= LEDGE_S ft/mi ...
    LEDGE_X=50.0,      # ... and slope - bgslope >= LEDGE_X ft/mi
    PEAK_WIN=3,        # rise/hole peaks: local extreme within +/- this many cells
    MIN_NPX=8,         # smallest blob, cells ...
    MIN_NPX_STRONG=3,  # ... or this many for a rise/hole with |resid| >= STRONG_RESID
    STRONG_RESID=25.0, #     (pinnacles are only 1-3 cells wide at 120 m)
    PROM_MIN=6.0,      # rise: directional prominence >= this, ft
    HOLE_PROM_MIN=8.0, # hole: directional prominence >= this, ft
    TEX_THR=-1.0,      # survey-texture index below this = interpolated "model" zone ...
    MODEL_MIN_NPX=30,  # ... where a feature needs this many cells, is grade C at best,
                       #     and the track-line test applies
    ALIGN_N=4,         # >= this many same-kind blobs (>= MIN_NPX_STRONG) on one grid row/column ...
    ALIGN_TOL=1,       # ... within this many cells of the line ...
    ALIGN_GAP=40,      # ... each <= this many cells from the next = track-line artifact
    SEAM_STEP=0.3,     # seam: step >= 0.3 m over the neighbouring differences
    SEAM_LEN=30,       # seam: run >= 30 fine px (~1.3 km) on one grid line
    SEAM_FRAC=0.35,    # drop blobs with more than this share in the seam zone
    OPEN_R=3,          # gulf mask opening radius, cells
    GRADE_RISE=20.0,   # B if |resid| >= this (rise/hole) ...
    GRADE_HOLE=20.0,
    GRADE_LEDGE=150.0,  # ... or slope >= this for ledges
    GRADE_PROM=12.0,   # ... and prominence >= this (rise/hole)
    GRADE_RELIEF=40.0, # ... or relief >= this with npx >= 20 (rise/hole)
    THIN_MI=1.5,       # keep best feature per kind within this distance
    THIN_DEEP_MI=4.0,  # wider thinning deeper than DEEP_FT
    DEEP_FT=300.0,
    MAX_PER_KIND=150,
)


def parse_args():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--raster", required=True)
    ap.add_argument("--region", required=True, help="south,north,west,east")
    ap.add_argument("--name", required=True, help="JS suffix, e.g. GULFSHORES")
    ap.add_argument("--out", required=True)
    ap.add_argument("--label", default="", help="place name for the header")
    ap.add_argument("--diag", default="", help="folder for diagnostic PNG/npz")
    ap.add_argument("--check", action="append", default=[],
                    help="name:south,north,west,east box to report on (repeatable)")
    ap.add_argument("--set", action="append", default=[], help="KEY=VALUE override")
    return ap.parse_args()


def main():
    a = parse_args()
    for kv in a.set:
        k, v = kv.split("=", 1)
        P[k] = type(P[k])(v)
    south, north, west, east = (float(x) for x in a.region.split(","))
    fine, meta = bc.load_raster(a.raster)
    f = P["FACTOR"]
    step = meta["step"] * f
    z = bc.block_mean(fine.astype(np.float64), f)
    R, C = z.shape
    lat_n = meta["north"] - meta["step"] * (f - 1) / 2.0     # centre of coarse row 0
    lon_w = meta["west"] + meta["step"] * (f - 1) / 2.0
    lats = lat_n - np.arange(R) * step
    lons = lon_w + np.arange(C) * step
    dy = step * bc.M_PER_DEG
    dx_row = step * bc.M_PER_DEG * np.cos(np.radians(lats))
    print(f"analysis raster {R} x {C} step {step:.4f} deg, N {lat_n:.4f} W {lon_w:.4f}")

    # --- seams (fine raster) -> coarse
    seam_f = bc.detect_seams(fine.astype(np.float32), P["SEAM_STEP"], P["SEAM_LEN"])
    seam_c = seam_f[:R * f, :C * f].reshape(R, f, C, f).any(axis=(1, 3))
    del seam_f
    seam_core = bc.box_any(seam_c, 1, 1)
    seam_zone = bc.box_any(seam_c, 5, 5)
    tex = bc.texture(fine, f, 4)[:R, :C]
    model = tex < P["TEX_THR"]
    print(f"seam cells (coarse): {int(seam_c.sum())}")

    # --- masks
    depth = -z * bc.FT_PER_M
    gulf = bc.gulf_mask(z, open_r=P["OPEN_R"])
    water = z < 0
    shore = bc.box_any(~water | (depth < P["SHORE_FT"]), P["SHORE_BUF"], P["SHORE_BUF"])
    ana = gulf & (depth >= P["MIN_FT"]) & (depth <= P["MAX_FT"]) & ~shore
    print(f"open-gulf cells {int(gulf.sum())}, analysed {int(ana.sum())}")

    # --- background, residual, slope
    bg_mi = P["BG_MI"] * bc.M_PER_MI
    ry = int(round(bg_mi / dy))
    rx = int(round(bg_mi / float(np.mean(dx_row))))
    dw = np.where(water, depth, np.nan)
    bg = bc.box_mean(dw, ry, rx)
    resid = depth - bg
    sm = bc.box_mean(dw, 1, 1)
    gy = np.zeros_like(sm)
    gx = np.zeros_like(sm)
    gy[1:-1] = (sm[2:] - sm[:-2]) / (2 * dy)
    gx[:, 1:-1] = (sm[:, 2:] - sm[:, :-2]) / (2 * dx_row[:, None])
    slope = np.hypot(gx, gy) * bc.M_PER_MI
    slope = np.nan_to_num(slope, nan=0.0)
    bgslope = bc.box_mean(np.where(water, slope, np.nan), ry, rx)
    print(f"background window +/-{ry} x {rx} cells")

    cell_sqmi = (dy * dx_row / bc.M_PER_MI ** 2)[:, None] * np.ones((1, C))
    kinds = {
        "rise": ana & (resid <= -P["RISE_T"]) & ~seam_core,
        "hole": ana & (resid >= P["HOLE_T"]) & ~seam_core,
        "ledge": ana & (slope >= P["LEDGE_S"]) & (slope - bgslope >= P["LEDGE_X"]) & ~seam_core,
    }
    in_region = ((lats[:, None] >= south) & (lats[:, None] <= north)
                 & (lons[None, :] >= west) & (lons[None, :] <= east))
    i_off = int(round((lat_n - north) / step))
    j_off = int(round((west - lon_w) / step))
    ring_k = 2
    feats = {}
    stats = {}
    for kind, cand in kinds.items():
        if kind == "ledge":
            regions = _blob_regions(cand)
        else:
            regions = _peak_regions(cand, -resid if kind == "rise" else resid, P["PEAK_WIN"])
        n = len(regions)
        out = []
        dropped_seam = 0
        dropped_small = 0
        dropped_prom = 0
        dropped_model = 0
        small_peaks = []   # every blob >= MIN_NPX_STRONG cells, for the track-line test
        for rr, cc in regions:
            npx = int(rr.size)
            if npx < P["MIN_NPX_STRONG"]:
                dropped_small += 1
                continue
            r0, r1 = max(int(rr.min()) - ring_k, 0), min(int(rr.max()) + 1 + ring_k, R)
            c0, c1 = max(int(cc.min()) - ring_k, 0), min(int(cc.max()) + 1 + ring_k, C)
            sub = np.zeros((r1 - r0, c1 - c0), bool)
            sub[rr - r0, cc - c0] = True
            if kind == "rise":
                score = resid[rr, cc]
                m = int(np.argmin(score))
            elif kind == "hole":
                score = resid[rr, cc]
                m = int(np.argmax(score))
            else:
                score = slope[rr, cc] - bgslope[rr, cc]
                m = int(np.argmax(score))
            pr, pc = int(rr[m]), int(cc[m])
            if model[pr, pc]:
                small_peaks.append({"_r": pr, "_c": pc})
            strong_small = kind != "ledge" and abs(float(resid[pr, pc])) >= P["STRONG_RESID"]
            if npx < P["MIN_NPX"] and not strong_small:
                dropped_small += 1
                continue
            in_model = bool(model[pr, pc])
            if in_model and npx < P["MODEL_MIN_NPX"]:
                dropped_model += 1
                continue
            zone_frac = float(seam_zone[rr, cc].mean())
            if zone_frac > P["SEAM_FRAC"] or seam_zone[pr, pc]:
                dropped_seam += 1
                continue
            # ring = 2-cell band outside the blob
            dil = bc.box_any(sub, ring_k, ring_k)
            ring = dil & ~sub & water[r0:r1, c0:c1]
            dsub = depth[r0:r1, c0:c1]
            ringd = dsub[ring]
            blobd = depth[rr, cc]
            if ringd.size == 0:
                continue
            if kind == "rise":
                relief = float(np.median(ringd) - blobd.min())
            elif kind == "hole":
                relief = float(blobd.max() - np.median(ringd))
            else:
                alld = dsub[dil & water[r0:r1, c0:c1]]
                relief = float(alld.max() - alld.min())
            d_ft = float(depth[pr, pc])
            res = float(resid[pr, pc])
            slp = float(slope[pr, pc])
            prom = 0.0
            if kind in ("rise", "hole"):
                prom = _prominence(sm, pr, pc, -1.0 if kind == "rise" else 1.0)
                if prom < P["PROM_MIN" if kind == "rise" else "HOLE_PROM_MIN"]:
                    dropped_prom += 1
                    continue
            if kind == "rise":
                strong = -res >= P["GRADE_RISE"] and prom >= P["GRADE_PROM"]
            elif kind == "hole":
                strong = res >= P["GRADE_HOLE"] and prom >= P["GRADE_PROM"]
            else:
                strong = slp >= P["GRADE_LEDGE"]
            strong = strong or (relief >= P["GRADE_RELIEF"] and npx >= 20 and kind != "ledge")
            strong = strong and not in_model
            out.append({
                "kind": kind, "i": pr - i_off, "j": pc - j_off,
                "lat": round(float(lats[pr]), 4), "lon": round(float(lons[pc]), 4),
                "depth": int(round(d_ft)), "relief": round(relief, 1), "resid": round(res, 1),
                "slope": int(round(slp)), "area": round(float(cell_sqmi[rr, cc].sum()), 3),
                "npx": npx, "grade": "B" if strong else "C",
                "_in": bool(in_region[pr, pc]),
                "_score": prom if kind != "ledge" else float(abs(score[m])) / 10.0,
                "_r": pr, "_c": pc, "_model": in_model,
            })
        aligned = _aligned([x for x in out if x["_model"]] + small_peaks,
                           P["ALIGN_N"], P["ALIGN_TOL"], P["ALIGN_GAP"])
        for x in out:
            if id(x) in aligned:
                print(f"  aligned-artifact drop {kind} {x['lat']},{x['lon']} depth {x['depth']}")
        out = [x for x in out if id(x) not in aligned]
        stats[kind] = dict(blobs=n, small=dropped_small, seam=dropped_seam, prom=dropped_prom,
                           model=dropped_model,
                           aligned=len(aligned), kept=len(out))
        feats[kind] = out

    # --- spot checks (before region clip and thinning)
    for chk in a.check:
        nm, box = chk.split(":", 1)
        s, nn, w, e = (float(x) for x in box.split(","))
        print(f"\nCHECK {nm} {s}-{nn}N {w}-{e}E")
        rsel = (lats >= s) & (lats <= nn)
        csel = (lons >= w) & (lons <= e)
        sub = depth[np.ix_(rsel, csel)]
        rs = resid[np.ix_(rsel, csel)]
        print(f"  depth {np.nanmin(sub):.0f}-{np.nanmax(sub):.0f} ft, min resid {np.nanmin(rs):.1f}"
              f" max resid {np.nanmax(rs):.1f}, cells resid<=-{P['RISE_T']}: {int((rs <= -P['RISE_T']).sum())}"
              f", seam cells {int(seam_c[np.ix_(rsel, csel)].sum())}")
        pad = 0.01
        for kind, lst in feats.items():
            for x in lst:
                if s - pad <= x["lat"] <= nn + pad and w - pad <= x["lon"] <= e + pad:
                    print(f"  {kind} {x['lat']},{x['lon']} depth {x['depth']} resid {x['resid']} relief {x['relief']}"
                          f" slope {x['slope']} npx {x['npx']} grade {x['grade']} in_region {x['_in']}")

    # --- clip to region, thin, rank
    def dist_mi(p, q):
        dlat = (p["lat"] - q["lat"]) * 69.17
        dlon = (p["lon"] - q["lon"]) * 69.17 * np.cos(np.radians(p["lat"]))
        return float(np.hypot(dlat, dlon))

    result = {}
    for kind, lst in feats.items():
        lst = [x for x in lst if x["_in"]]
        lst.sort(key=lambda x: (x["grade"] != "B", -x["_score"] * np.sqrt(x["npx"])))
        kept = []
        for x in lst:
            rad = P["THIN_DEEP_MI"] if x["depth"] > P["DEEP_FT"] else P["THIN_MI"]
            if any(dist_mi(x, y) < rad for y in kept):
                continue
            kept.append(x)
            if len(kept) >= P["MAX_PER_KIND"]:
                break
        result[kind + "s"] = kept
        stats[kind]["final"] = len(kept)
    print("\n" + json.dumps(stats))

    # --- bay / land verification
    print("\nverification:")
    for kind, lst in result.items():
        bad = 0
        for x in lst:
            r = x["i"] + i_off
            c = x["j"] + j_off
            if not gulf[r, c] or not water[r, c]:
                bad += 1
        ds = [x["depth"] for x in lst]
        print(f"  {kind}: {len(lst)} (B {sum(x['grade'] == 'B' for x in lst)}),"
              f" depth {min(ds) if ds else '-'}-{max(ds) if ds else '-'} ft, outside open Gulf: {bad}")

    for lst in result.values():
        for x in lst:
            for k in ("_in", "_score", "_r", "_c", "_model"):
                x.pop(k)
    today = datetime.date.today().isoformat()
    label_txt = a.label or a.name.title()
    header = (f"/* Tier-2 computed structure — {label_txt}. Terrain analysis of the NOAA NCEI DEM\n"
              f"   (crm_vol4_2023 Coastal Relief Model, block-averaged to a ~120 m raster,\n"
              f"   residual-from-1.5mi-background + slope). Rises = hard bottom standing above\n"
              f"   surroundings; holes = depressions; ledges = steep drop-offs. Open-Gulf water\n"
              f"   {int(P['MIN_FT'])}-{int(P['MAX_FT'])} ft only (bays/sounds masked); straight source seams suppressed.\n"
              f"   COMPUTED — verify on your sounder. Harvested {today} via tools/bottom/compute_ledges.py. */\n")
    body = json.dumps({"rises": result["rises"], "ledges": result["ledges"], "holes": result["holes"]},
                      separators=(",", ":"), ensure_ascii=False)
    with open(a.out, "w", newline="\n", encoding="utf-8") as fh:
        fh.write(header)
        fh.write(f"window.LEDGES_{a.name} = {body};\n")
    print(f"wrote {a.out} ({os.path.getsize(a.out)} bytes)")

    if a.diag:
        os.makedirs(a.diag, exist_ok=True)
        np.savez_compressed(os.path.join(a.diag, "ledges_diag.npz"), depth=depth.astype(np.float32),
                            resid=resid.astype(np.float32), slope=slope.astype(np.float32),
                            seam=seam_c, gulf=gulf, lat_n=lat_n, lon_w=lon_w, step=step)
        _diag_png(os.path.join(a.diag, "ledges_diag.png"), depth, resid, seam_c, gulf, result,
                  lat_n, lon_w, step)


def _prominence(sm, pr, pc, sign, scales=(2, 4, 8)):
    """Directional prominence of cell (pr, pc) in the smoothed depth ``sm``.

    For each scale d and each of 4 directions (N-S, E-W, two diagonals) take
    h = mean(depth at p-d*u, p+d*u) - depth(p) (sign=-1, rises: positive when p is
    shallower than both sides) or depth(p) - mean(...) (sign=+1, holes). The
    feature's prominence is the best scale's MINIMUM over directions, so a
    feature must stand out in every direction: a shelf-break crest, a sand
    ridge or a dredged channel is flat along its own length and scores ~0.
    """
    R, C = sm.shape
    best = -1e9
    p = sm[pr, pc]
    for d in scales:
        hs = []
        for ur, uc in ((1, 0), (0, 1), (1, 1), (1, -1)):
            r1, c1, r2, c2 = pr - d * ur, pc - d * uc, pr + d * ur, pc + d * uc
            if not (0 <= r1 < R and 0 <= r2 < R and 0 <= c1 < C and 0 <= c2 < C):
                continue
            a, b = sm[r1, c1], sm[r2, c2]
            if np.isnan(a) or np.isnan(b):
                continue
            mean = 0.5 * (a + b)
            hs.append((mean - p) if sign < 0 else (p - mean))
        if len(hs) >= 3:
            best = max(best, min(hs))
    return float(best) if best > -1e8 else 0.0


def _aligned(feats, nmin, tol, gap):
    """ids of features that sit nmin-or-more in a row on one grid row or column.

    Sparse-sounding DEMs leave 'bullseye' pits and bumps strung along survey
    track lines that run exactly E-W or N-S. Features whose peak cells share a
    row (or column) within ``tol`` cells, with neighbours no more than ``gap``
    cells apart, in groups of at least ``nmin``, are treated as track-line
    artifacts.
    """
    bad = set()
    for key, other in (("_r", "_c"), ("_c", "_r")):
        order = sorted(feats, key=lambda x: x[key])
        for x in order:
            line = [y for y in order if abs(y[key] - x[key]) <= tol]
            line.sort(key=lambda y: y[other])
            group = [line[0]] if line else []
            for y in line[1:]:
                if y[other] - group[-1][other] <= gap:
                    group.append(y)
                else:
                    if len(group) >= nmin:
                        bad.update(id(g) for g in group)
                    group = [y]
            if len(group) >= nmin:
                bad.update(id(g) for g in group)
    return bad


def _blob_regions(cand):
    """8-connected blobs of ``cand`` as a list of (rows, cols) index arrays."""
    lab, n = bc.label(cand)
    out = []
    if n == 0:
        return out
    rr, cc = np.nonzero(lab)
    ll = lab[rr, cc]
    order = np.argsort(ll, kind="stable")
    ll, rr, cc = ll[order], rr[order], cc[order]
    bounds = np.flatnonzero(np.diff(ll)) + 1
    for s, e in zip(np.r_[0, bounds], np.r_[bounds, ll.size]):
        out.append((rr[s:e], cc[s:e]))
    return out


def _peak_regions(cand, v, win):
    """Peak-seeded regions for rises/holes.

    ``v`` is the strength (positive = more rise-like or hole-like). Every cell
    of ``cand`` that is the maximum of ``v`` in a (2*win+1)^2 window seeds a
    region, strongest first: the region is the connected candidate cells with
    v >= half the peak value that no stronger region has claimed. This keeps a
    narrow pinnacle from being swallowed by a broad low-relief blob around it
    (e.g. on a shelf-break crest) and gives each pinnacle of a reef trend its
    own point.
    """
    R, C = v.shape
    w = np.where(cand, v, -np.inf)
    mx = w.copy()
    for axis in (0, 1):
        base = mx.copy()
        for k in range(1, win + 1):
            fwd = np.full_like(base, -np.inf)
            bwd = np.full_like(base, -np.inf)
            if axis == 0:
                fwd[k:] = base[:-k]
                bwd[:-k] = base[k:]
            else:
                fwd[:, k:] = base[:, :-k]
                bwd[:, :-k] = base[:, k:]
            mx = np.maximum(mx, np.maximum(fwd, bwd))
    peaks = np.argwhere(cand & (w >= mx))
    peaks = sorted(peaks.tolist(), key=lambda p: -w[p[0], p[1]])
    claimed = np.zeros((R, C), bool)
    out = []
    for pr, pc in peaks:
        if claimed[pr, pc]:
            continue
        lim = 0.5 * w[pr, pc]
        q = deque([(pr, pc)])
        claimed[pr, pc] = True
        cells = [(pr, pc)]
        while q:
            r, c = q.popleft()
            for dr in (-1, 0, 1):
                for dc in (-1, 0, 1):
                    r2, c2 = r + dr, c + dc
                    if 0 <= r2 < R and 0 <= c2 < C and not claimed[r2, c2] and w[r2, c2] >= lim:
                        claimed[r2, c2] = True
                        cells.append((r2, c2))
                        q.append((r2, c2))
        a = np.array(cells)
        out.append((a[:, 0], a[:, 1]))
    return out


def _diag_png(path, depth, resid, seam, gulf, result, lat_n, lon_w, step):
    from PIL import Image, ImageDraw
    r = np.clip(np.nan_to_num(resid), -20, 20) / 20.0
    img = np.zeros(depth.shape + (3,), np.float64)
    img[..., 0] = 128 + 127 * np.clip(-r, 0, 1) - 60 * np.clip(r, 0, 1)
    img[..., 1] = 128 - 60 * np.abs(r)
    img[..., 2] = 128 + 127 * np.clip(r, 0, 1) - 60 * np.clip(-r, 0, 1)
    img[~gulf] *= 0.5
    img[np.isnan(depth) | (depth <= 0)] = [40, 90, 40]
    img[seam] = [255, 255, 0]
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(im)
    col = {"rises": (255, 0, 0), "holes": (0, 255, 0), "ledges": (255, 255, 255)}
    for kind, lst in result.items():
        for x in lst:
            rr = (lat_n - x["lat"]) / step
            cc = (x["lon"] - lon_w) / step
            d.ellipse([cc - 5, rr - 5, cc + 5, rr + 5], outline=col[kind], width=2)
    im.save(path)


if __name__ == "__main__":
    main()
