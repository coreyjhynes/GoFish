"""Build a GoFish depth lattice + depth contours (data/depth_<region>.js).

Input: a fine elevation raster written by fetch_dem.py (metres, row 0 north),
covering at least the region box.

Output (same shapes as data/depth_tampa.js):
    window.DEPTH_<NAME> = { lat0, lon0, step, rows, cols, d: [...] }
        lat0/lon0 = SW corner of the region box; row-major from the SOUTH
        (index r*cols+c; lat = lat0 + r*step; lon = lon0 + c*step);
        each value = depth in FEET (integer), -1 for land / no data.
    window.CONTOURS_<NAME> = [{ft, paths: [[[lat,lon],...], ...]}, ...]

Method
------
Lattice: at each node, if the fine raster's 3x3 mean at the node is at or
above sea level the node is land (-1); otherwise depth = mean of the
below-sea-level fine cells within +/-LATTICE_HALF degrees of the node.
The lattice includes bays and sounds.

Contours: the fine raster is block-averaged to CONTOUR_STEP degrees,
lightly smoothed (SMOOTH_PASSES of a 3x3 mean), and masked to open-Gulf
water (bottom_common.gulf_mask: S/SW/SE rays clear of land, pass channels
opened away, connected to the south edge) so bay channels do not clutter the
map. Marching squares (saddles resolved by the cell mean) traces each level;
segments are chained into polylines, simplified with Douglas-Peucker
(SIMPLIFY_DEG) and paths shorter than MIN_PATH_DEG dropped.

Usage
-----
    python -I build_depth.py --raster <dem>/gulfshores_0004.npy \
        --region 29.30,30.45,-88.45,-86.25 --name GULFSHORES \
        --label "Gulf Shores / Orange Beach - Pensacola - Destin" \
        --out <repo>/data/depth_gulfshores.js
"""
import argparse
import datetime
import json
import math
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bottom_common as bc  # noqa: E402

P = dict(
    STEP=0.015,          # lattice spacing, degrees
    LATTICE_HALF=0.002,  # lattice node = mean of fine water cells within +/- this
    CONTOUR_STEP=0.004,  # contour grid spacing, degrees
    SMOOTH_PASSES=2,     # 3x3 mean passes on the contour grid
    SIMPLIFY_DEG=0.0012, # Douglas-Peucker tolerance
    MIN_PATH_DEG=0.03,   # drop paths shorter than this (degrees of path length)
    OPEN_R=1,            # gulf-mask opening radius on the contour grid, cells
)
LEVELS = [30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 140, 160, 180, 240, 300, 360, 480, 600]


def parse_args():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--raster", required=True)
    ap.add_argument("--region", required=True, help="south,north,west,east")
    ap.add_argument("--name", required=True, help="JS suffix, e.g. GULFSHORES")
    ap.add_argument("--label", default="")
    ap.add_argument("--out", required=True)
    ap.add_argument("--levels", default=",".join(str(x) for x in LEVELS))
    ap.add_argument("--set", action="append", default=[], help="KEY=VALUE override")
    return ap.parse_args()


def lattice(fine, meta, south, west, rows, cols, step, half):
    fn, fw, fs = meta["north"], meta["west"], meta["step"]
    R, C = fine.shape
    h = int(round(half / fs))
    out = []
    for r in range(rows):
        lat = south + r * step
        fr = int(round((fn - lat) / fs))
        for c in range(cols):
            lon = west + c * step
            fc = int(round((lon - fw) / fs))
            if not (0 <= fr < R and 0 <= fc < C):
                out.append(-1)
                continue
            core = fine[max(fr - 1, 0):fr + 2, max(fc - 1, 0):fc + 2]
            if np.isnan(core).all() or np.nanmean(core) >= 0:
                out.append(-1)
                continue
            win = fine[max(fr - h, 0):fr + h + 1, max(fc - h, 0):fc + h + 1]
            wv = win[win < 0]
            out.append(int(round(-float(wv.mean()) * bc.FT_PER_M)))
    return out


def marching_squares(g, level):
    """Contour polylines of grid g (row 0 = north) at ``level``; NaN cells skipped.

    Returns a list of polylines in fractional (row, col) coordinates.
    """
    R, C = g.shape
    above = g >= level
    seg_by_edge = {}
    segs = []

    def interp(v0, v1):
        d = v1 - v0
        return 0.5 if d == 0 else (level - v0) / d

    for i in range(R - 1):
        for j in range(C - 1):
            tl, tr, br, bl = g[i, j], g[i, j + 1], g[i + 1, j + 1], g[i + 1, j]
            if math.isnan(tl) or math.isnan(tr) or math.isnan(br) or math.isnan(bl):
                continue
            idx = (above[i, j] << 3) | (above[i, j + 1] << 2) | (above[i + 1, j + 1] << 1) | above[i + 1, j]
            if idx == 0 or idx == 15:
                continue
            # edge ids and points: top, right, bottom, left
            e = {
                "t": (("h", i, j), (i, j + interp(tl, tr))),
                "r": (("v", i, j + 1), (i + interp(tr, br), j + 1)),
                "b": (("h", i + 1, j), (i + 1, j + interp(bl, br))),
                "l": (("v", i, j), (i + interp(tl, bl), j)),
            }
            table = {
                1: [("l", "b")], 2: [("b", "r")], 3: [("l", "r")], 4: [("t", "r")],
                6: [("t", "b")], 7: [("l", "t")], 8: [("l", "t")], 9: [("t", "b")],
                11: [("t", "r")], 12: [("l", "r")], 13: [("b", "r")], 14: [("l", "b")],
            }
            if idx in (5, 10):
                centre_above = (tl + tr + br + bl) / 4.0 >= level
                if idx == 5:   # tr and bl above
                    pairs = [("t", "l"), ("b", "r")] if not centre_above else [("t", "r"), ("l", "b")]
                else:          # tl and br above
                    pairs = [("t", "r"), ("l", "b")] if not centre_above else [("t", "l"), ("b", "r")]
            else:
                pairs = table[idx]
            for a, b in pairs:
                ea, eb = e[a], e[b]
                k = len(segs)
                segs.append((ea, eb))
                seg_by_edge.setdefault(ea[0], []).append(k)
                seg_by_edge.setdefault(eb[0], []).append(k)
    used = [False] * len(segs)
    lines = []
    for k in range(len(segs)):
        if used[k]:
            continue
        used[k] = True
        (ea, eb) = segs[k]
        chain = [ea, eb]
        # extend forward from chain[-1], then backward from chain[0]
        for direction in (1, -1):
            while True:
                end = chain[-1] if direction == 1 else chain[0]
                nxt = None
                for s in seg_by_edge.get(end[0], []):
                    if not used[s]:
                        nxt = s
                        break
                if nxt is None:
                    break
                used[nxt] = True
                a2, b2 = segs[nxt]
                other = b2 if a2[0] == end[0] else a2
                if direction == 1:
                    chain.append(other)
                else:
                    chain.insert(0, other)
        lines.append([p for _, p in chain])
    return lines


def douglas_peucker(pts, tol):
    if len(pts) < 3:
        return pts
    a = np.asarray(pts, float)
    keep = np.zeros(len(a), bool)
    keep[0] = keep[-1] = True
    stack = [(0, len(a) - 1)]
    while stack:
        s, e = stack.pop()
        if e <= s + 1:
            continue
        p0, p1 = a[s], a[e]
        d = p1 - p0
        n = math.hypot(d[0], d[1])
        seg = a[s + 1:e]
        if n == 0:
            dist = np.hypot(seg[:, 0] - p0[0], seg[:, 1] - p0[1])
        else:
            dist = np.abs(d[0] * (seg[:, 1] - p0[1]) - d[1] * (seg[:, 0] - p0[0])) / n
        k = int(np.argmax(dist))
        if dist[k] > tol:
            m = s + 1 + k
            keep[m] = True
            stack.append((s, m))
            stack.append((m, e))
    return [pts[i] for i in np.flatnonzero(keep)]


def main():
    a = parse_args()
    for kv in a.set:
        k, v = kv.split("=", 1)
        P[k] = type(P[k])(v)
    south, north, west, east = (float(x) for x in a.region.split(","))
    levels = [int(x) for x in a.levels.split(",")]
    fine, meta = bc.load_raster(a.raster)
    fine = fine.astype(np.float64)
    step = P["STEP"]
    rows = int(math.floor((north - south) / step + 1e-9)) + 1
    cols = int(math.floor((east - west) / step + 1e-9)) + 1
    d = lattice(fine, meta, south, west, rows, cols, step, P["LATTICE_HALF"])
    nwater = sum(1 for v in d if v >= 0)
    print(f"lattice {rows} x {cols}: {nwater} water nodes, max {max(d)} ft")

    # contour grid over the region box
    fs = meta["step"]
    k = int(round(P["CONTOUR_STEP"] / fs))
    cstep = k * fs
    r0 = int(round((meta["north"] - north) / fs))
    c0 = int(round((west - meta["west"]) / fs))
    nr = int((south - (meta["north"] - r0 * fs)) / -fs) // k
    nc = int((east - (meta["west"] + c0 * fs)) / fs) // k
    sub = fine[r0:r0 + nr * k, c0:c0 + nc * k]
    z = sub.reshape(nr, k, nc, k).mean(axis=(1, 3))
    glat_n = meta["north"] - r0 * fs - (k - 1) * fs / 2.0
    glon_w = meta["west"] + c0 * fs + (k - 1) * fs / 2.0
    gulf = bc.gulf_mask(z, open_r=P["OPEN_R"])
    depth = np.where(gulf, -z * bc.FT_PER_M, np.nan)
    for _ in range(P["SMOOTH_PASSES"]):
        depth = np.where(gulf, bc.box_mean(depth, 1, 1), np.nan)
    print(f"contour grid {nr} x {nc} at {cstep:.4f} deg, gulf cells {int(gulf.sum())}")

    contours = []
    npts = 0
    for lv in levels:
        paths = []
        for line in marching_squares(depth, float(lv)):
            ll = [[round(glat_n - p[0] * cstep, 4), round(glon_w + p[1] * cstep, 4)] for p in line]
            ll = douglas_peucker(ll, P["SIMPLIFY_DEG"])
            length = sum(math.hypot(ll[i + 1][0] - ll[i][0], ll[i + 1][1] - ll[i][1])
                         for i in range(len(ll) - 1))
            if length < P["MIN_PATH_DEG"] or len(ll) < 3:
                continue
            paths.append(ll)
        npts += sum(len(p) for p in paths)
        print(f"  {lv:4d} ft: {len(paths)} paths, {sum(len(p) for p in paths)} pts")
        contours.append({"ft": lv, "paths": paths})

    today = datetime.date.today().isoformat()
    label = a.label or a.name.title()
    with open(a.out, "w", newline="\n", encoding="utf-8") as fh:
        fh.write(f"/* Computed depth detail - {label}. Harvested from NOAA NCEI DEM\n"
                 f"   (exportImage of crm_vol4_2023, the 1-arc-second Coastal Relief Model;\n"
                 f"   {step} deg grid, {nwater} water nodes, each the mean of the raster within\n"
                 f"   +/-{P['LATTICE_HALF']} deg) {today}. Contours by marching squares on a {cstep:.3f} deg\n"
                 f"   smoothed grid, open-Gulf water only. COMPUTED from a model that is\n"
                 f"   multibeam in places and interpolated soundings elsewhere - navigation-grade\n"
                 f"   it is not. Built by tools/bottom/build_depth.py. */\n")
        fh.write(f"window.DEPTH_{a.name} = {{\n")
        fh.write(f"  lat0: {south:g}, lon0: {west:g}, step: {step:g}, rows: {rows}, cols: {cols},\n")
        fh.write("  d: [" + ",".join(str(v) for v in d) + "]\n};\n")
        fh.write(f"window.CONTOURS_{a.name} = " + json.dumps(contours, separators=(",", ":")) + ";\n")
    print(f"wrote {a.out} ({os.path.getsize(a.out)} bytes, {npts} contour points)")


if __name__ == "__main__":
    main()
