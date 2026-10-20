"""Download an elevation raster from the NOAA NCEI DEM mosaic ImageServer.

Method
------
The box is cut into tiles (default 1000 x 1000 px). Each tile is fetched with
``exportImage`` (format=tiff, pixelType=F32, bboxSR/imageSR=4326, explicit size)
and cached as ``<cache>/<prefix>_<r0>_<c0>.tif`` so a rerun only downloads what
is missing. Failed requests are retried with back-off. The tiles are stitched
into one float32 array of elevations in METRES (negative = below sea level),
NaN where the service returned no data, and saved as ``.npy`` with a ``.json``
sidecar describing the grid.

Grid convention (same as the GoFish ledge files): pixel centres are at
``lat = north - r*step`` and ``lon = west + c*step`` for r in [0, rows) and
c in [0, cols); rows = round((north-south)/step)+1. Row 0 is the NORTH edge.

By default the mosaic is LOCKED to one source raster (``--lock 3747`` =
``crm_vol4_2023``, NOAA's 1-arc-second Coastal Relief Model for the central
Gulf, which carries the multibeam surveys of the outer shelf). Locking to one
compilation avoids the source seams the default mosaic shows where the 1/9 and
1/3 arc-second coastal tiles meet ETOPO-15s offshore. Pass ``--lock 0`` to use
the service's default mosaic.

Usage
-----
    python -I fetch_dem.py --south 29.15 --north 30.48 --west -88.48 --east -86.22 \
        --step 0.0004 --cache <dir> --out <dir>/gulfshores_0004.npy

Find source raster ids with the ImageServer ``query`` endpoint (OBJECTID).
"""
import argparse
import json
import os
import sys
import time
import urllib.parse
import urllib.request

import numpy as np
from PIL import Image

SERVICE = "https://gis.ngdc.noaa.gov/arcgis/rest/services/DEM_mosaics/DEM_all/ImageServer"
NODATA = -99999.0


def grid_shape(south, north, west, east, step):
    rows = int(round((north - south) / step)) + 1
    cols = int(round((east - west) / step)) + 1
    return rows, cols


def fetch_tile(path, north, west, step, r0, c0, nr, nc, lock, retries=8):
    if os.path.exists(path) and os.path.getsize(path) > 1000:
        try:
            a = np.array(Image.open(path)).astype(np.float32)
            if a.shape == (nr, nc):
                return a
        except Exception:
            pass
    # bbox edges = pixel centres +/- half a pixel
    xmin = west + c0 * step - step / 2
    xmax = west + (c0 + nc - 1) * step + step / 2
    ymax = north - r0 * step + step / 2
    ymin = north - (r0 + nr - 1) * step - step / 2
    params = {
        "bbox": f"{xmin:.8f},{ymin:.8f},{xmax:.8f},{ymax:.8f}",
        "bboxSR": "4326", "imageSR": "4326",
        "size": f"{nc},{nr}",
        "format": "tiff", "pixelType": "F32", "noData": str(NODATA),
        "interpolation": "RSP_BilinearInterpolation",
        "f": "image",
    }
    if lock:
        params["mosaicRule"] = json.dumps({"mosaicMethod": "esriMosaicLockRaster",
                                           "lockRasterIds": [lock]})
    url = SERVICE + "/exportImage?" + urllib.parse.urlencode(params)
    delay = 5
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(url, timeout=300) as resp:
                data = resp.read()
            if data[:2] not in (b"II", b"MM"):
                raise RuntimeError("not a TIFF: " + data[:200].decode("latin1"))
            tmp = path + ".part"
            with open(tmp, "wb") as fh:
                fh.write(data)
            a = np.array(Image.open(tmp)).astype(np.float32)
            if a.shape != (nr, nc):
                raise RuntimeError(f"shape {a.shape} != {(nr, nc)}")
            os.replace(tmp, path)
            return a
        except Exception as exc:  # flaky service: retry
            print(f"  tile {r0},{c0} attempt {attempt + 1} failed: {exc}", file=sys.stderr)
            time.sleep(delay)
            delay = min(delay * 2, 120)
    raise SystemExit(f"tile {r0},{c0} failed after {retries} attempts")


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--south", type=float, required=True)
    ap.add_argument("--north", type=float, required=True)
    ap.add_argument("--west", type=float, required=True)
    ap.add_argument("--east", type=float, required=True)
    ap.add_argument("--step", type=float, required=True, help="pixel size in degrees")
    ap.add_argument("--tile", type=int, default=1000)
    ap.add_argument("--lock", type=int, default=3747, help="source raster id, 0 = default mosaic")
    ap.add_argument("--cache", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    os.makedirs(a.cache, exist_ok=True)
    rows, cols = grid_shape(a.south, a.north, a.west, a.east, a.step)
    print(f"grid {rows} x {cols} at {a.step} deg")
    out = np.full((rows, cols), np.nan, np.float32)
    prefix = f"dem_{a.lock}_{a.step:g}_{a.north:g}_{a.west:g}"
    for r0 in range(0, rows, a.tile):
        for c0 in range(0, cols, a.tile):
            nr, nc = min(a.tile, rows - r0), min(a.tile, cols - c0)
            path = os.path.join(a.cache, f"{prefix}_{r0}_{c0}.tif")
            t = fetch_tile(path, a.north, a.west, a.step, r0, c0, nr, nc, a.lock)
            t[t <= NODATA + 1] = np.nan
            out[r0:r0 + nr, c0:c0 + nc] = t
            print(f"  tile {r0},{c0} ok  min {np.nanmin(t):.1f} max {np.nanmax(t):.1f}")
    np.save(a.out, out)
    meta = {"north": a.north, "south": a.south, "west": a.west, "east": a.east,
            "step": a.step, "rows": rows, "cols": cols, "lock": a.lock,
            "units": "m, negative below sea level, row 0 = north"}
    with open(os.path.splitext(a.out)[0] + ".json", "w", newline="\n", encoding="utf-8") as fh:
        json.dump(meta, fh, indent=1)
    print("nan cells:", int(np.isnan(out).sum()))


if __name__ == "__main__":
    main()
