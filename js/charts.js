/* "My Charts" — overlay the user's own chart files on the map:
   - KMZ/KML GroundOverlays (StrikeLines Google Earth exports, etc.)
   - Any chart image (plotter/StrikeLines screenshot) calibrated with two corners
   - Plus a live NOAA ENC nautical chart layer (no files needed).
   Imported charts persist in IndexedDB (they're images — too big for localStorage). */
(function () {
  "use strict";

  /* ---------------- IndexedDB ---------------- */
  const DB_NAME = "gbi-charts", STORE = "charts";
  function openDb() {
    return new Promise((res, rej) => {
      const r = indexedDB.open(DB_NAME, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: "id" });
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  async function dbAll() {
    const db = await openDb();
    return new Promise((res, rej) => {
      const q = db.transaction(STORE).objectStore(STORE).getAll();
      q.onsuccess = () => res(q.result || []);
      q.onerror = () => rej(q.error);
    });
  }
  async function dbPut(rec) {
    const db = await openDb();
    return new Promise((res, rej) => {
      const t = db.transaction(STORE, "readwrite");
      t.objectStore(STORE).put(rec);
      t.oncomplete = () => res();
      t.onerror = () => rej(t.error);
    });
  }
  async function dbDel(id) {
    const db = await openDb();
    return new Promise((res, rej) => {
      const t = db.transaction(STORE, "readwrite");
      t.objectStore(STORE).delete(id);
      t.oncomplete = () => res();
      t.onerror = () => rej(t.error);
    });
  }

  /* ---------------- zip (KMZ) ---------------- */
  // Central-directory walk; returns Map of lowercased entry name -> Uint8Array.
  async function unzipAll(buf) {
    const dv = new DataView(buf), u8 = new Uint8Array(buf), td = new TextDecoder();
    let eocd = -1;
    for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 22 - 65535); i--) {
      if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error("Not a valid KMZ/zip file");
    const count = dv.getUint16(eocd + 10, true);
    let off = dv.getUint32(eocd + 16, true);
    const out = new Map();
    for (let n = 0; n < count; n++) {
      if (dv.getUint32(off, true) !== 0x02014b50) break;
      const method = dv.getUint16(off + 10, true);
      const csize = dv.getUint32(off + 20, true);
      const nameLen = dv.getUint16(off + 28, true);
      const extraLen = dv.getUint16(off + 30, true);
      const cmtLen = dv.getUint16(off + 32, true);
      const lho = dv.getUint32(off + 42, true);
      const name = td.decode(u8.subarray(off + 46, off + 46 + nameLen));
      if (!name.endsWith("/")) {
        const lnameLen = dv.getUint16(lho + 26, true);
        const lextraLen = dv.getUint16(lho + 28, true);
        const start = lho + 30 + lnameLen + lextraLen;
        const data = u8.slice(start, start + csize);
        let bytes;
        if (method === 0) bytes = data;
        else if (method === 8) {
          if (typeof DecompressionStream === "undefined") throw new Error("Browser can't unzip KMZ — use KML + images instead");
          const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
          bytes = new Uint8Array(await new Response(stream).arrayBuffer());
        } else throw new Error("Unsupported zip compression");
        out.set(name.toLowerCase().replace(/^\.\//, ""), bytes);
      }
      off += 46 + nameLen + extraLen + cmtLen;
    }
    return out;
  }

  /* ---------------- KML GroundOverlay ---------------- */
  function parseGroundOverlays(xmlText) {
    const doc = new DOMParser().parseFromString(xmlText, "text/xml");
    if (doc.getElementsByTagName("parsererror").length) throw new Error("Could not parse KML");
    const out = [];
    const gos = doc.getElementsByTagName("GroundOverlay");
    for (let i = 0; i < gos.length; i++) {
      const g = gos[i];
      const get = tag => { const e = g.getElementsByTagName(tag)[0]; return e ? e.textContent.trim() : null; };
      const href = (() => { const ic = g.getElementsByTagName("Icon")[0]; if (!ic) return null; const h = ic.getElementsByTagName("href")[0]; return h ? h.textContent.trim() : null; })();
      const north = parseFloat(get("north")), south = parseFloat(get("south"));
      const east = parseFloat(get("east")), west = parseFloat(get("west"));
      const rotation = parseFloat(get("rotation") || "0") || 0;
      if (!href || [north, south, east, west].some(isNaN)) continue;
      out.push({ name: get("name") || "Chart overlay " + (i + 1), href, north, south, east, west, rotation });
    }
    return out;
  }

  const MIME = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp" };
  function mimeFor(name) { return MIME[(name.split(".").pop() || "").toLowerCase()] || "image/png"; }

  let batchSeq = 0;
  function newId() { return "c_" + Date.now().toString(36) + "_" + (batchSeq++); }

  /* ---------------- imports ---------------- */
  // KMZ or KML file -> chart records (one per GroundOverlay)
  async function importChartFile(file) {
    const lower = file.name.toLowerCase();
    const batch = file.name + " @ " + new Date().toISOString().slice(0, 10);
    let kmlText = null, zip = null;
    if (lower.endsWith(".kmz")) {
      zip = await unzipAll(await file.arrayBuffer());
      for (const [name, bytes] of zip) {
        if (name.endsWith(".kml")) { kmlText = new TextDecoder().decode(bytes); break; }
      }
      if (!kmlText) throw new Error("No .kml inside the KMZ");
    } else if (lower.endsWith(".kml")) {
      kmlText = await file.text();
    } else {
      throw new Error("Use a .kmz or .kml here (for plain images use the calibrate option)");
    }
    const overlays = parseGroundOverlays(kmlText);
    if (!overlays.length) throw new Error("No GroundOverlay (georeferenced image) found — if this file only has placemarks, import it under My Spots instead");
    const recs = [], warnings = [];
    for (const ov of overlays) {
      let rec = {
        id: newId(), batch, name: ov.name,
        bounds: [[ov.south, ov.west], [ov.north, ov.east]],
        opacity: 0.8, added: new Date().toISOString().slice(0, 10)
      };
      if (Math.abs(ov.rotation) > 1) warnings.push(ov.name + ": has " + ov.rotation + "° rotation — shown unrotated, expect slight offset");
      if (/^(https?:|data:)/i.test(ov.href)) {
        rec.srcUrl = ov.href;
      } else if (zip) {
        const key = ov.href.toLowerCase().replace(/^\.\//, "");
        const bytes = zip.get(key) || zip.get("files/" + key);
        if (!bytes) { warnings.push(ov.name + ": image '" + ov.href + "' missing from KMZ — skipped"); continue; }
        rec.blob = new Blob([bytes], { type: mimeFor(ov.href) });
      } else {
        warnings.push(ov.name + ": KML references a local file ('" + ov.href + "') — import the KMZ version instead"); continue;
      }
      await dbPut(rec);
      recs.push(rec);
    }
    return { added: recs.length, total: overlays.length, warnings };
  }

  // Plain image + user-typed SW/NE corners
  async function importImage(file, sw, ne) {
    if (!sw || !ne) throw new Error("Both corners are required");
    if (!(ne.lat > sw.lat) || !(ne.lon > sw.lon)) throw new Error("NE corner must be north and east of the SW corner");
    const rec = {
      id: newId(), batch: file.name, name: file.name.replace(/\.[^.]+$/, ""),
      bounds: [[sw.lat, sw.lon], [ne.lat, ne.lon]],
      opacity: 0.8, blob: new Blob([await file.arrayBuffer()], { type: file.type || mimeFor(file.name) }),
      added: new Date().toISOString().slice(0, 10)
    };
    await dbPut(rec);
    return { added: 1, total: 1, warnings: [] };
  }

  /* ---------------- rendering ---------------- */
  let urls = [];   // object URLs to revoke on re-render
  let cache = [];  // current records
  let globalOpacity = parseFloat(localStorage.getItem("GBI_CHART_OPACITY") || "0.8");

  async function render(layerGroup) {
    cache = await dbAll();
    layerGroup.clearLayers();
    urls.forEach(u => URL.revokeObjectURL(u)); urls = [];
    for (const rec of cache) {
      let src = rec.srcUrl;
      if (!src && rec.blob) { src = URL.createObjectURL(rec.blob); urls.push(src); }
      if (!src) continue;
      L.imageOverlay(src, rec.bounds, { opacity: globalOpacity, interactive: false }).addTo(layerGroup);
    }
    return cache;
  }
  function setOpacity(layerGroup, v) {
    globalOpacity = v;
    try { localStorage.setItem("GBI_CHART_OPACITY", String(v)); } catch (e) { /* ignore */ }
    layerGroup.eachLayer(l => l.setOpacity && l.setOpacity(v));
  }
  function list() { return cache; }
  async function removeChart(id) { await dbDel(id); }
  async function clearAllCharts() { for (const r of await dbAll()) await dbDel(r.id); }
  function opacity() { return globalOpacity; }

  /* ---------------- NOAA ENC live chart ---------------- */
  // Dynamic ArcGIS export (the service isn't tile-cached). Re-renders on moveend.
  const ENC_BASE = "https://encdirect.noaa.gov/arcgis/rest/services/encdirect/";
  function encRefresh(map, group) {
    if (!map.hasLayer(group)) return;
    const service = map.getZoom() >= 11 ? "enc_coastal" : "enc_general";
    const b = map.getBounds();
    const sw = L.CRS.EPSG3857.project(b.getSouthWest());
    const ne = L.CRS.EPSG3857.project(b.getNorthEast());
    const size = map.getSize();
    const url = ENC_BASE + service + "/MapServer/export?bbox=" + [sw.x, sw.y, ne.x, ne.y].join(",") +
      "&bboxSR=3857&imageSR=3857&size=" + size.x + "," + size.y + "&format=png32&transparent=true&dpi=96&f=image";
    const ov = L.imageOverlay(url, b, { opacity: 0.85, interactive: false });
    ov.once("load", () => {
      if (group._encCurrent && group.hasLayer(group._encCurrent)) group.removeLayer(group._encCurrent);
      group._encCurrent = ov;
    });
    ov.once("error", () => { if (group.hasLayer(ov)) group.removeLayer(ov); });
    group.addLayer(ov);
  }

  // Depth contour lines + soundings only (ENC sublayers), inverted to white via CSS.
  // 2x render size halves the map scale so the contour group draws even zoomed out,
  // and doubles as retina sharpening.
  function contoursRefresh(map, group) {
    if (!map.hasLayer(group)) return;
    const coastal = map.getZoom() >= 11;
    const service = coastal ? "enc_coastal" : "enc_general";
    const show = coastal ? "80,60" : "63,49"; // DepthsL group, SoundingsP group
    const b = map.getBounds();
    const sw = L.CRS.EPSG3857.project(b.getSouthWest());
    const ne = L.CRS.EPSG3857.project(b.getNorthEast());
    const size = map.getSize();
    const url = ENC_BASE + service + "/MapServer/export?bbox=" + [sw.x, sw.y, ne.x, ne.y].join(",") +
      "&bboxSR=3857&imageSR=3857&size=" + (size.x * 2) + "," + (size.y * 2) +
      "&format=png32&transparent=true&dpi=96&layers=show:" + show + "&f=image";
    const ov = L.imageOverlay(url, b, { opacity: 0.85, interactive: false, className: "enc-invert" });
    ov.once("load", () => {
      if (group._cur && group.hasLayer(group._cur)) group.removeLayer(group._cur);
      group._cur = ov;
    });
    ov.once("error", () => { if (group.hasLayer(ov)) group.removeLayer(ov); });
    group.addLayer(ov);
  }

  // FWC/FWRI statewide seagrass habitat (photointerpreted beds: continuous vs patchy).
  // Dynamic export like the ENC layers; the real "where's the grass" answer for scalloping.
  const SEAGRASS_URL = "https://gis.myfwc.com/hosting/rest/services/Open_Data/Seagrass_Statewide/MapServer/export";
  function seagrassRefresh(map, group) {
    if (!map.hasLayer(group)) return;
    const b = map.getBounds();
    const sw = L.CRS.EPSG3857.project(b.getSouthWest());
    const ne = L.CRS.EPSG3857.project(b.getNorthEast());
    const size = map.getSize();
    const k = Math.min(2, 2048 / Math.max(size.x, size.y)); // stay under ArcGIS maxImageSize
    const url = SEAGRASS_URL + "?bbox=" + [sw.x, sw.y, ne.x, ne.y].join(",") +
      "&bboxSR=3857&imageSR=3857&size=" + Math.round(size.x * k) + "," + Math.round(size.y * k) +
      "&format=png32&transparent=true&layers=show:15&f=image";
    const ov = L.imageOverlay(url, b, { opacity: 0.5, interactive: false, className: "seagrass-ov" });
    ov.once("load", () => {
      if (group._cur && group.hasLayer(group._cur)) group.removeLayer(group._cur);
      group._cur = ov;
    });
    ov.once("error", () => { if (group.hasLayer(ov)) group.removeLayer(ov); });
    group.addLayer(ov);
  }

  window.Charts = { importChartFile, importImage, render, setOpacity, opacity, list, removeChart, clearAllCharts, encRefresh, contoursRefresh, seagrassRefresh };
})();
