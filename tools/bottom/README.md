# Bottom tools

These scripts build the computed bottom layers for a region from free NOAA data.
They made the Gulf Shores layers. Run them again to build another region.

You need Python 3 and numpy. Run each script with `python -I <script> --help` to see its options.
Keep downloads **outside** this repo (for example `..\bottom_work\`).

| Script | Makes | From |
|---|---|---|
| `fetch_dem.py` | A depth raster for a box, saved as `.npy` | NOAA NCEI DEM ImageServer. `--lock` picks one source (3747 = Coastal Relief Model) so tile seams don't show up as ledges |
| `build_depth.py` | `data/depth_<region>.js`: the depth lattice and contours | The raster above |
| `compute_ledges.py` | `data/ledges_<region>.js`: rises, holes and ledges | The raster above, with a 1.5-mile background and slope |
| `csb_anomalies.py` | `data/csb_<region>.js`: crowd-sonar rises and holes | NOAA DCDB crowdsourced sonar vs the DEM. Settings are at the top of the file |
| `ais_loiter.py` | `data/ais_loiter_<region>.js`: fleet spots | NOAA Marine Cadastre AIS daily files (2024: only July–December download). Shrimp trawlers are removed by length and towing-speed rules. Settings are at the top of the file |
| `bottom_common.py` | Shared helpers: masks, labelling, seam and texture checks | — |

## Example: Gulf Shores

The raster is fetched with a pad around the region box, because the ledge finder needs at least
1.5 miles of extra area on each side. The grid this run used is in `gulfshores_0004.json` next to the `.npy`.

```
python -I tools/bottom/fetch_dem.py --south 29.15 --north 30.4804 --west -88.4804 --east -86.22 --step 0.0004 --lock 3747 --cache ../bottom_work/dem/tiles --out ../bottom_work/dem/gulfshores_0004.npy
python -I tools/bottom/build_depth.py --raster ../bottom_work/dem/gulfshores_0004.npy --region 29.30,30.45,-88.45,-86.25 --name GULFSHORES --out data/depth_gulfshores.js
python -I tools/bottom/compute_ledges.py --raster ../bottom_work/dem/gulfshores_0004.npy --region 29.30,30.45,-88.45,-86.25 --name GULFSHORES --out data/ledges_gulfshores.js
python -I tools/bottom/csb_anomalies.py
python -I tools/bottom/ais_loiter.py fetch   # downloads each day, keeps a small extract, deletes the zip
python -I tools/bottom/ais_loiter.py build
```

## Adding a new region

1. Run the scripts with the new box and `--name`, and change the settings at the top of `csb_anomalies.py` and `ais_loiter.py`.
2. Add the new files to `index.html`.
3. Add the region to `depthSets()` and `bottomSets()` in `js/app.js`.

Everything these scripts make is **computed**, not checked by anyone. The app says so and tells you to check on your sounder.
