/* Bathymetry-refined zones & computed drop targets.
   Generated 2026-07-05 from NOAA NCEI DEM_all getSamples (grid step 0.01 deg).
   Zone polygons = actual depth-band footprint; spots = steepest wall cells.
   COMPUTED STRUCTURE, NOT CATCH DATA - verify on the sounder. */
(function () {
  "use strict";
  const patches = [{"zid": "ms_canyon_sword", "polygon": [[28.43, -89.23], [28.45, -89.38], [28.47, -89.4], [28.49, -89.4], [28.51, -89.4], [28.53, -89.26], [28.55, -89.21], [28.57, -89.19], [28.59, -89.19], [28.61, -89.14], [28.63, -89.12], [28.65, -89.12], [28.67, -89.12], [28.69, -89.12], [28.71, -89.13], [28.73, -89.14], [28.75, -89.13], [28.77, -89.05], [28.79, -89.03], [28.79, -88.93], [28.77, -88.98], [28.75, -88.98], [28.73, -89.03], [28.71, -89.08], [28.69, -89.09], [28.67, -89.09], [28.65, -89.08], [28.63, -89.07], [28.61, -89.05], [28.59, -89.07], [28.57, -89.08], [28.55, -89.13], [28.53, -89.15], [28.51, -89.14], [28.49, -89.16], [28.47, -89.17], [28.45, -89.21], [28.43, -89.23]], "center": [28.61, -89.1442]}, {"zid": "tilefish_mud", "polygon": [[28.53, -89.37], [28.54, -89.4], [28.55, -89.4], [28.56, -89.4], [28.57, -89.39], [28.58, -89.39], [28.59, -89.35], [28.6, -89.34], [28.61, -89.33], [28.62, -89.31], [28.63, -89.3], [28.64, -89.28], [28.65, -89.28], [28.66, -89.27], [28.67, -89.27], [28.68, -89.26], [28.69, -89.25], [28.7, -89.24], [28.71, -89.24], [28.72, -89.23], [28.73, -89.22], [28.74, -89.22], [28.75, -89.21], [28.76, -89.21], [28.77, -89.21], [28.78, -89.2], [28.79, -89.2], [28.79, -89.07], [28.78, -89.14], [28.77, -89.15], [28.76, -89.16], [28.75, -89.17], [28.74, -89.17], [28.73, -89.17], [28.72, -89.16], [28.71, -89.17], [28.7, -89.16], [28.69, -89.15], [28.68, -89.15], [28.67, -89.16], [28.66, -89.16], [28.65, -89.17], [28.64, -89.18], [28.63, -89.18], [28.62, -89.2], [28.61, -89.2], [28.6, -89.21], [28.59, -89.21], [28.58, -89.23], [28.57, -89.24], [28.56, -89.26], [28.55, -89.3], [28.54, -89.35], [28.53, -89.37]], "center": [28.66, -89.2409]}, {"zid": "islamorada_sword", "polygon": [[24.45, -80.52], [24.47, -80.49], [24.49, -80.47], [24.51, -80.45], [24.53, -80.42], [24.55, -80.39], [24.57, -80.37], [24.59, -80.34], [24.61, -80.32], [24.63, -80.3], [24.65, -80.28], [24.67, -80.27], [24.69, -80.25], [24.71, -80.24], [24.73, -80.22], [24.75, -80.21], [24.77, -80.19], [24.79, -80.18], [24.79, -80.14], [24.77, -80.16], [24.75, -80.18], [24.73, -80.2], [24.71, -80.22], [24.69, -80.24], [24.67, -80.26], [24.65, -80.28], [24.63, -80.29], [24.61, -80.31], [24.59, -80.33], [24.57, -80.34], [24.55, -80.36], [24.53, -80.38], [24.51, -80.39], [24.49, -80.41], [24.47, -80.43], [24.45, -80.45]], "center": [24.62, -80.3133]}, {"zid": "marathon_sword", "polygon": [[24.23, -80.95], [24.24, -80.95], [24.25, -80.95], [24.26, -80.95], [24.27, -80.95], [24.28, -80.94], [24.29, -80.91], [24.3, -80.89], [24.31, -80.87], [24.32, -80.86], [24.33, -80.83], [24.34, -80.82], [24.35, -80.8], [24.36, -80.79], [24.37, -80.78], [24.38, -80.76], [24.39, -80.74], [24.4, -80.72], [24.41, -80.71], [24.42, -80.69], [24.43, -80.59], [24.44, -80.58], [24.45, -80.54], [24.46, -80.54], [24.47, -80.52], [24.48, -80.5], [24.48, -80.5], [24.47, -80.5], [24.46, -80.5], [24.45, -80.5], [24.44, -80.5], [24.43, -80.5], [24.42, -80.5], [24.41, -80.5], [24.4, -80.5], [24.39, -80.53], [24.38, -80.53], [24.37, -80.56], [24.36, -80.58], [24.35, -80.6], [24.34, -80.62], [24.33, -80.63], [24.32, -80.65], [24.31, -80.66], [24.3, -80.68], [24.29, -80.7], [24.28, -80.72], [24.27, -80.84], [24.26, -80.86], [24.25, -80.87], [24.24, -80.88], [24.23, -80.94]], "center": [24.355, -80.7015]}];
  for (const p of patches) {
    const z = (window.DATA_ZONES || []).find(x => x.id === p.zid);
    if (z) { z.polygon = p.polygon; z.center = p.center; delete z.radius_mi;
      z.notes = (z.notes || '') + ' [Zone footprint computed from NOAA bathymetry along the target depth band.]'; }
  }
  window.DATA_SPOTS = (window.DATA_SPOTS || []).concat([
    { id: "bathy_ms_canyon_sword_1", region: "venice", name: "MS Canyon wall #1 — 1510 ft wall", lat: 28.67, lon: -89.1, depth_ft: 1510, relief_ft: null,
      type: "deep_drop", grade: "C", species: { swordfish: 4, tilefish: 2 },
      notes: "Computed drop target: steepest wall cell in the band (~327 ft/mi gradient) from NOAA DEM sampling. Structure math, not a catch report - work the ledge on the sounder.",
      sources: [{ name: "NOAA NCEI DEM (computed)", url: "https://gis.ngdc.noaa.gov/arcgis/rest/services/DEM_mosaics/DEM_all/ImageServer" }] },
    { id: "bathy_ms_canyon_sword_2", region: "venice", name: "MS Canyon wall #2 — 1690 ft wall", lat: 28.72, lon: -89.07, depth_ft: 1690, relief_ft: null,
      type: "deep_drop", grade: "C", species: { swordfish: 4, tilefish: 2 },
      notes: "Computed drop target: steepest wall cell in the band (~265 ft/mi gradient) from NOAA DEM sampling. Structure math, not a catch report - work the ledge on the sounder.",
      sources: [{ name: "NOAA NCEI DEM (computed)", url: "https://gis.ngdc.noaa.gov/arcgis/rest/services/DEM_mosaics/DEM_all/ImageServer" }] },
    { id: "bathy_ms_canyon_sword_3", region: "venice", name: "MS Canyon wall #3 — 1600 ft wall", lat: 28.63, lon: -89.09, depth_ft: 1600, relief_ft: null,
      type: "deep_drop", grade: "C", species: { swordfish: 4, tilefish: 2 },
      notes: "Computed drop target: steepest wall cell in the band (~254 ft/mi gradient) from NOAA DEM sampling. Structure math, not a catch report - work the ledge on the sounder.",
      sources: [{ name: "NOAA NCEI DEM (computed)", url: "https://gis.ngdc.noaa.gov/arcgis/rest/services/DEM_mosaics/DEM_all/ImageServer" }] },
    { id: "bathy_ms_canyon_sword_4", region: "venice", name: "MS Canyon wall #4 — 1720 ft wall", lat: 28.55, lon: -89.13, depth_ft: 1720, relief_ft: null,
      type: "deep_drop", grade: "C", species: { swordfish: 4, tilefish: 2 },
      notes: "Computed drop target: steepest wall cell in the band (~245 ft/mi gradient) from NOAA DEM sampling. Structure math, not a catch report - work the ledge on the sounder.",
      sources: [{ name: "NOAA NCEI DEM (computed)", url: "https://gis.ngdc.noaa.gov/arcgis/rest/services/DEM_mosaics/DEM_all/ImageServer" }] },
    { id: "bathy_tilefish_mud_1", region: "venice", name: "Tilefish edge #1 — 970 ft wall", lat: 28.54, lon: -89.35, depth_ft: 970, relief_ft: null,
      type: "deep_drop", grade: "C", species: { tilefish: 4, swordfish: 2 },
      notes: "Computed drop target: steepest wall cell in the band (~232 ft/mi gradient) from NOAA DEM sampling. Structure math, not a catch report - work the ledge on the sounder.",
      sources: [{ name: "NOAA NCEI DEM (computed)", url: "https://gis.ngdc.noaa.gov/arcgis/rest/services/DEM_mosaics/DEM_all/ImageServer" }] },
    { id: "bathy_tilefish_mud_2", region: "venice", name: "Tilefish edge #2 — 920 ft wall", lat: 28.73, lon: -89.17, depth_ft: 920, relief_ft: null,
      type: "deep_drop", grade: "C", species: { tilefish: 4, swordfish: 2 },
      notes: "Computed drop target: steepest wall cell in the band (~199 ft/mi gradient) from NOAA DEM sampling. Structure math, not a catch report - work the ledge on the sounder.",
      sources: [{ name: "NOAA NCEI DEM (computed)", url: "https://gis.ngdc.noaa.gov/arcgis/rest/services/DEM_mosaics/DEM_all/ImageServer" }] },
    { id: "bathy_islamorada_sword_1", region: "keys", name: "Islamorada sword ledge #1 — 1850 ft wall", lat: 24.63, lon: -80.29, depth_ft: 1850, relief_ft: null,
      type: "deep_drop", grade: "C", species: { swordfish: 4, tilefish: 2 },
      notes: "Computed drop target: steepest wall cell in the band (~761 ft/mi gradient) from NOAA DEM sampling. Structure math, not a catch report - work the ledge on the sounder.",
      sources: [{ name: "NOAA NCEI DEM (computed)", url: "https://gis.ngdc.noaa.gov/arcgis/rest/services/DEM_mosaics/DEM_all/ImageServer" }] },
    { id: "bathy_islamorada_sword_2", region: "keys", name: "Islamorada sword ledge #2 — 1760 ft wall", lat: 24.67, lon: -80.26, depth_ft: 1760, relief_ft: null,
      type: "deep_drop", grade: "C", species: { swordfish: 4, tilefish: 2 },
      notes: "Computed drop target: steepest wall cell in the band (~574 ft/mi gradient) from NOAA DEM sampling. Structure math, not a catch report - work the ledge on the sounder.",
      sources: [{ name: "NOAA NCEI DEM (computed)", url: "https://gis.ngdc.noaa.gov/arcgis/rest/services/DEM_mosaics/DEM_all/ImageServer" }] },
    { id: "bathy_islamorada_sword_3", region: "keys", name: "Islamorada sword ledge #3 — 1830 ft wall", lat: 24.58, lon: -80.33, depth_ft: 1830, relief_ft: null,
      type: "deep_drop", grade: "C", species: { swordfish: 4, tilefish: 2 },
      notes: "Computed drop target: steepest wall cell in the band (~544 ft/mi gradient) from NOAA DEM sampling. Structure math, not a catch report - work the ledge on the sounder.",
      sources: [{ name: "NOAA NCEI DEM (computed)", url: "https://gis.ngdc.noaa.gov/arcgis/rest/services/DEM_mosaics/DEM_all/ImageServer" }] },
    { id: "bathy_marathon_sword_1", region: "keys", name: "Marathon sword ledge #1 — 1990 ft wall", lat: 24.23, lon: -80.95, depth_ft: 1990, relief_ft: null,
      type: "deep_drop", grade: "C", species: { swordfish: 4, tilefish: 2 },
      notes: "Computed drop target: steepest wall cell in the band (~680 ft/mi gradient) from NOAA DEM sampling. Structure math, not a catch report - work the ledge on the sounder.",
      sources: [{ name: "NOAA NCEI DEM (computed)", url: "https://gis.ngdc.noaa.gov/arcgis/rest/services/DEM_mosaics/DEM_all/ImageServer" }] },
    { id: "bathy_marathon_sword_2", region: "keys", name: "Marathon sword ledge #2 — 1860 ft wall", lat: 24.3, lon: -80.68, depth_ft: 1860, relief_ft: null,
      type: "deep_drop", grade: "C", species: { swordfish: 4, tilefish: 2 },
      notes: "Computed drop target: steepest wall cell in the band (~524 ft/mi gradient) from NOAA DEM sampling. Structure math, not a catch report - work the ledge on the sounder.",
      sources: [{ name: "NOAA NCEI DEM (computed)", url: "https://gis.ngdc.noaa.gov/arcgis/rest/services/DEM_mosaics/DEM_all/ImageServer" }] },
    { id: "bathy_marathon_sword_3", region: "keys", name: "Marathon sword ledge #3 — 1370 ft wall", lat: 24.39, lon: -80.74, depth_ft: 1370, relief_ft: null,
      type: "deep_drop", grade: "C", species: { swordfish: 4, tilefish: 2 },
      notes: "Computed drop target: steepest wall cell in the band (~414 ft/mi gradient) from NOAA DEM sampling. Structure math, not a catch report - work the ledge on the sounder.",
      sources: [{ name: "NOAA NCEI DEM (computed)", url: "https://gis.ngdc.noaa.gov/arcgis/rest/services/DEM_mosaics/DEM_all/ImageServer" }] },
  ]);
})();
