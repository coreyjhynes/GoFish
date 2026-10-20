"""Shared helpers for the GoFish bottom-structure tools (numpy only, no scipy).

* ``load_raster``   - load a ``.npy`` written by fetch_dem.py plus its ``.json`` grid.
* ``block_mean``    - average an integer factor down (fine -> coarse raster).
* ``box_mean``      - NaN-aware moving-window mean via an integral image.
* ``box_any`` / ``box_all`` - binary dilation / erosion with a rectangle.
* ``label``         - 8-connected component labelling (breadth-first).
* ``detect_seams``  - flag straight, grid-aligned step lines (source seams).
* ``texture``       - survey-texture index (multibeam vs interpolated model).
* ``gulf_mask``     - open-Gulf water: below sea level, not shadowed by land on
                      the S/SW/SE rays, survives a morphological opening that
                      cuts narrow passes, and connects to the box's south edge.

All rasters use row 0 = NORTH, column 0 = WEST, pixel centres on the grid.
"""
import json
import os
from collections import deque

import numpy as np

M_PER_DEG = 111320.0
FT_PER_M = 3.28084
M_PER_MI = 1609.344


def load_raster(path):
    a = np.load(path)
    with open(os.path.splitext(path)[0] + ".json", encoding="utf-8") as fh:
        meta = json.load(fh)
    return a, meta


def block_mean(a, k):
    r, c = a.shape[0] // k, a.shape[1] // k
    return a[:r * k, :c * k].reshape(r, k, c, k).mean(axis=(1, 3))


def _integral(a):
    s = np.zeros((a.shape[0] + 1, a.shape[1] + 1), np.float64)
    s[1:, 1:] = np.cumsum(np.cumsum(a, axis=0), axis=1)
    return s


def box_sum(a, ry, rx):
    """Sum over the (2ry+1) x (2rx+1) window centred on each cell (clipped at edges)."""
    s = _integral(a)
    R, C = a.shape
    r = np.arange(R)
    c = np.arange(C)
    r0 = np.clip(r - ry, 0, R)
    r1 = np.clip(r + ry + 1, 0, R)
    c0 = np.clip(c - rx, 0, C)
    c1 = np.clip(c + rx + 1, 0, C)
    return (s[r1][:, c1] - s[r0][:, c1] - s[r1][:, c0] + s[r0][:, c0])


def box_mean(a, ry, rx, valid=None):
    """Mean of the valid (non-NaN, and ``valid``) cells in the window; NaN where none."""
    ok = ~np.isnan(a)
    if valid is not None:
        ok &= valid
    num = box_sum(np.where(ok, a, 0.0), ry, rx)
    den = box_sum(ok.astype(np.float64), ry, rx)
    with np.errstate(invalid="ignore", divide="ignore"):
        return np.where(den > 0, num / np.maximum(den, 1), np.nan)


def box_any(m, ry, rx):
    return box_sum(m.astype(np.float64), ry, rx) > 0.5


def box_all(m, ry, rx):
    # cells near the edge count the outside as "true" so the opening does not eat the border
    pad = np.pad(m, ((ry, ry), (rx, rx)), constant_values=True)
    s = box_sum(pad.astype(np.float64), ry, rx)[ry:ry + m.shape[0], rx:rx + m.shape[1]]
    return s >= (2 * ry + 1) * (2 * rx + 1) - 0.5


def label(mask):
    """8-connected labels (0 = background). Returns (labels, count)."""
    R, C = mask.shape
    lab = np.zeros((R, C), np.int32)
    flat = mask.ravel()
    labf = lab.ravel()
    n = 0
    idx = np.flatnonzero(flat)
    for start in idx:
        if labf[start]:
            continue
        n += 1
        labf[start] = n
        q = deque([start])
        while q:
            p = q.popleft()
            pr, pc = divmod(p, C)
            for dr in (-1, 0, 1):
                rr = pr + dr
                if rr < 0 or rr >= R:
                    continue
                for dc in (-1, 0, 1):
                    cc = pc + dc
                    if cc < 0 or cc >= C:
                        continue
                    k = rr * C + cc
                    if flat[k] and not labf[k]:
                        labf[k] = n
                        q.append(k)
    return lab, n


def _runs_1d_mask(cand, min_len, gap):
    """Keep True runs along axis 1 that are >= min_len long (gaps <= gap bridged)."""
    out = np.zeros_like(cand)
    R, C = cand.shape
    rows = np.flatnonzero(cand.sum(axis=1) >= min_len // 2)
    for r in rows:
        line = cand[r]
        cols = np.flatnonzero(line)
        if cols.size == 0:
            continue
        # split where the gap is too large
        brk = np.flatnonzero(np.diff(cols) > gap + 1)
        starts = np.r_[cols[0], cols[brk + 1]]
        ends = np.r_[cols[brk], cols[-1]]
        for s, e in zip(starts, ends):
            if e - s + 1 >= min_len:
                out[r, s:e + 1] = True
    return out


def detect_seams(z, min_step, min_len, gap=2):
    """Straight grid-aligned step lines in elevation raster ``z`` (metres).

    A horizontal seam (constant latitude) between rows r and r+1 is a run of
    columns where the row-to-row difference |z[r+1]-z[r]| is a local maximum
    across rows AND exceeds the differences two rows away by ``min_step``
    metres (a step, not a ramp), sustained along the SAME row for at least
    ``min_len`` pixels. Vertical seams likewise on the transpose. Natural
    ledges wander across rows; source seams and survey-patch edges do not.
    Returns a boolean mask (both sides of each step flagged).
    """
    def horiz(a):
        d = np.abs(np.diff(a, axis=0))            # (R-1, C): step between r and r+1
        d = np.nan_to_num(d, nan=0.0)
        up1 = np.vstack([d[:1] * 0, d[:-1]])
        dn1 = np.vstack([d[1:], d[:1] * 0])
        up2 = np.vstack([d[:2] * 0, d[:-2]])
        dn2 = np.vstack([d[2:], d[:2] * 0])
        cand = (d >= up1) & (d >= dn1) & (d - np.maximum(up2, dn2) >= min_step)
        keep = _runs_1d_mask(cand, min_len, gap)
        m = np.zeros(a.shape, bool)
        m[:-1] |= keep
        m[1:] |= keep
        return m
    return horiz(z) | horiz(z.T).T


def texture(fine, factor, radius):
    """Survey-texture index on the coarse grid: log10 of the median |Laplacian|
    of the fine raster in each factor x factor block, averaged over
    +/-radius coarse cells.

    Multibeam/lidar surveys carry real small-scale texture (index about -0.5);
    areas the compilation interpolated between sparse soundings are smooth
    apart from bullseyes and track lines (index about -1.5 to -2.2).
    """
    f = fine.astype(np.float32)
    lap = np.zeros_like(f)
    lap[1:-1, 1:-1] = np.abs(4 * f[1:-1, 1:-1] - f[:-2, 1:-1] - f[2:, 1:-1] - f[1:-1, :-2] - f[1:-1, 2:])
    R, C = f.shape[0] // factor, f.shape[1] // factor
    b = lap[:R * factor, :C * factor].reshape(R, factor, C, factor).transpose(0, 2, 1, 3)
    med = np.nanmedian(b.reshape(R, C, factor * factor), axis=2)
    return box_mean(np.log10(med + 1e-4), radius, radius)


def gulf_mask(z, open_r=3, south_edge=True):
    """Open-Gulf water mask for elevation raster ``z`` (metres, row 0 north).

    1. water = z < 0.
    2. ray test: a water cell is "behind land" if a ray from it running S, SW
       or SE meets land before leaving the raster. Bays and sounds sit behind
       barrier islands, so at least one of those rays is blocked; open-Gulf
       cells see open water on all three.
    3. morphological opening (erode/dilate by ``open_r`` cells) cuts the
       narrow pass channels and dredged ship channels.
    4. keep only the part connected to the southern edge of the raster.
    """
    land = ~(z < 0)
    R, C = z.shape
    blocked = np.zeros((R, C), bool)
    for dc in (0, -1, 1):          # S, SW, SE
        b = np.zeros((R, C), bool)
        b[R - 1] = land[R - 1]
        for r in range(R - 2, -1, -1):
            prev = b[r + 1]
            if dc == 0:
                sh = prev
            elif dc == -1:          # cell (r,c) looks at (r+1, c-1)
                sh = np.r_[False, prev[:-1]]
            else:                    # (r+1, c+1)
                sh = np.r_[prev[1:], False]
            b[r] = land[r] | sh
        blocked |= b & ~land
    water = (~land) & (~blocked)
    if open_r > 0:
        er = box_all(water, open_r, open_r)
        water = box_any(er, open_r, open_r) & water
    if south_edge:
        lab, n = label(water)
        keep = np.unique(lab[R - 1][lab[R - 1] > 0])
        water = np.isin(lab, keep)
    return water
