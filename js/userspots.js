/* "My Spots" — import the user's own waypoints from Google My Maps (KML/KMZ),
   GPX, CSV, or pasted coordinate text. Stored in localStorage, layered into
   the map, rankings, heatmap and exports. */
(function () {
  "use strict";

  const LS_KEY = "GBI_MY_SPOTS"; // deliberately NOT under "gbi:" (that prefix is forecast cache)
  window.USER_SPOTS = [];

  /* ---------------- storage ---------------- */
  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      window.USER_SPOTS = raw ? JSON.parse(raw) : [];
    } catch (e) { window.USER_SPOTS = []; }
    return window.USER_SPOTS;
  }
  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(window.USER_SPOTS)); } catch (e) { /* quota/private mode */ }
  }
  function clearAll() { window.USER_SPOTS = []; save(); }
  function remove(id) {
    window.USER_SPOTS = window.USER_SPOTS.filter(s => s.id !== id);
    save();
  }

  /* ---------------- normalization ---------------- */
  const GULF = { latMin: 24, latMax: 31.5, lonMin: -88.5, lonMax: -80 };

  function inGulf(lat, lon) {
    return lat >= GULF.latMin && lat <= GULF.latMax && lon >= GULF.lonMin && lon <= GULF.lonMax;
  }

  // Pull depth + species hints out of the pin's name/description.
  function inferMeta(name, desc) {
    const text = (name + " " + (desc || "")).toLowerCase();
    let depth = null;
    const dm = text.match(/(\d{2,3})\s*(?:ft|feet|')(?![a-z0-9])/);
    if (dm) { const d = parseInt(dm[1], 10); if (d >= 15 && d <= 400) depth = d; }
    const species = {};
    const k = (re, id, r) => { if (re.test(text)) species[id] = Math.max(species[id] || 0, r); };
    k(/red\s*snapper|\bars\b/, "red_snapper", 4);
    k(/mangrove|mango|gray snapper|grey snapper/, "mangrove_snapper", 4);
    k(/\bgag/, "gag_grouper", 4);
    k(/red\s*grouper/, "red_grouper", 4);
    k(/scamp/, "scamp", 4);
    k(/\blane\b/, "lane_snapper", 4);
    k(/vermilion|beeliner|bee liner/, "vermilion_snapper", 4);
    k(/amberjack|\baj\b/, "amberjack", 4);
    k(/hogfish|\bhog\b/, "hogfish", 4);
    k(/trigger/, "gray_triggerfish", 3);
    if (!Object.keys(species).length && /grouper/.test(text)) { species.red_grouper = 3; species.gag_grouper = 3; }
    if (!Object.keys(species).length && /snapper/.test(text)) { species.mangrove_snapper = 3; species.lane_snapper = 3; }
    return { depth, species };
  }

  let seq = 0;
  function makeSpot(name, lat, lon, desc, sourceLabel) {
    const meta = inferMeta(name || "", desc || "");
    const cleanDesc = (desc || "").replace(/\s+/g, " ").trim().slice(0, 280);
    return {
      id: "u_" + Math.abs(Math.round(lat * 1e5)) + "_" + Math.abs(Math.round(lon * 1e5)) + "_" + (seq++),
      name: (name || "My spot").replace(/\s+/g, " ").trim().slice(0, 80),
      lat: +lat.toFixed(6), lon: +lon.toFixed(6),
      depth_ft: meta.depth, relief_ft: null,
      type: "user", grade: "B", user: true,
      species: meta.species,
      notes: (cleanDesc ? cleanDesc + " — " : "") + "Imported " + new Date().toISOString().slice(0, 10) + (sourceLabel ? " from " + sourceLabel : ""),
      sources: []
    };
  }

  // Merge new spots in. A duplicate = SAME NAME within ~0.8 mi (re-import protection).
  // Distinct names are always kept, even feet apart — numbered spots cluster on real structure.
  function merge(newSpots) {
    let added = 0, dup = 0, outOfArea = 0;
    const nameKey = s => s.name.toLowerCase().replace(/\s+/g, " ").trim();
    const byName = new Map();
    for (const e of window.USER_SPOTS) {
      const k = nameKey(e);
      if (!byName.has(k)) byName.set(k, []);
      byName.get(k).push(e);
    }
    for (const s of newSpots) {
      if (!inGulf(s.lat, s.lon)) { outOfArea++; continue; }
      const k = nameKey(s);
      const sameName = byName.get(k);
      if (sameName && sameName.some(e => Math.abs(e.lat - s.lat) < 0.012 && Math.abs(e.lon - s.lon) < 0.012)) { dup++; continue; }
      window.USER_SPOTS.push(s);
      if (!byName.has(k)) byName.set(k, []);
      byName.get(k).push(s);
      added++;
    }
    if (added) save();
    return { added, dup, outOfArea };
  }

  /* ---------------- KML / KMZ ---------------- */
  function parseKML(xmlText, sourceLabel) {
    const doc = new DOMParser().parseFromString(xmlText, "text/xml");
    if (doc.getElementsByTagName("parsererror").length) throw new Error("Could not parse the KML file");
    const out = [];
    let skippedShapes = 0;
    const pms = doc.getElementsByTagName("Placemark");
    for (let i = 0; i < pms.length; i++) {
      const pm = pms[i];
      const nameEl = pm.getElementsByTagName("name")[0];
      const descEl = pm.getElementsByTagName("description")[0];
      const point = pm.getElementsByTagName("Point")[0];
      if (!point) { skippedShapes++; continue; } // lines/polygons aren't waypoints
      const coordEl = point.getElementsByTagName("coordinates")[0];
      if (!coordEl) continue;
      const parts = coordEl.textContent.trim().split(",");
      const lon = parseFloat(parts[0]), lat = parseFloat(parts[1]);
      if (isNaN(lat) || isNaN(lon)) continue;
      const desc = descEl ? descEl.textContent.replace(/<[^>]+>/g, " ") : "";
      out.push(makeSpot(nameEl ? nameEl.textContent : "", lat, lon, desc, sourceLabel));
    }
    return { spots: out, skippedShapes };
  }

  // KMZ = zip; read the central directory, inflate the first .kml entry.
  async function unzipKml(arrayBuffer) {
    const dv = new DataView(arrayBuffer);
    const u8 = new Uint8Array(arrayBuffer);
    const td = new TextDecoder();
    let eocd = -1;
    const stop = Math.max(0, arrayBuffer.byteLength - 22 - 65535);
    for (let i = arrayBuffer.byteLength - 22; i >= stop; i--) {
      if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error("Not a valid KMZ/zip file");
    const count = dv.getUint16(eocd + 10, true);
    let off = dv.getUint32(eocd + 16, true);
    for (let n = 0; n < count; n++) {
      if (dv.getUint32(off, true) !== 0x02014b50) break;
      const method = dv.getUint16(off + 10, true);
      const csize = dv.getUint32(off + 20, true);
      const nameLen = dv.getUint16(off + 28, true);
      const extraLen = dv.getUint16(off + 30, true);
      const cmtLen = dv.getUint16(off + 32, true);
      const lho = dv.getUint32(off + 42, true);
      const name = td.decode(u8.subarray(off + 46, off + 46 + nameLen));
      if (/\.kml$/i.test(name)) {
        const lnameLen = dv.getUint16(lho + 26, true);
        const lextraLen = dv.getUint16(lho + 28, true);
        const dataStart = lho + 30 + lnameLen + lextraLen;
        const data = u8.slice(dataStart, dataStart + csize);
        if (method === 0) return td.decode(data);
        if (method === 8) {
          if (typeof DecompressionStream === "undefined") throw new Error("This browser can't unzip KMZ — export as KML instead");
          const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
          return await new Response(stream).text();
        }
        throw new Error("Unsupported KMZ compression — export as KML instead");
      }
      off += 46 + nameLen + extraLen + cmtLen;
    }
    throw new Error("No .kml found inside the KMZ");
  }

  /* ---------------- GPX ---------------- */
  function parseGPX(xmlText, sourceLabel) {
    const doc = new DOMParser().parseFromString(xmlText, "text/xml");
    if (doc.getElementsByTagName("parsererror").length) throw new Error("Could not parse the GPX file");
    const out = [];
    const wpts = doc.getElementsByTagName("wpt");
    for (let i = 0; i < wpts.length; i++) {
      const w = wpts[i];
      const lat = parseFloat(w.getAttribute("lat")), lon = parseFloat(w.getAttribute("lon"));
      if (isNaN(lat) || isNaN(lon)) continue;
      const nameEl = w.getElementsByTagName("name")[0];
      const descEl = w.getElementsByTagName("desc")[0] || w.getElementsByTagName("cmt")[0];
      out.push(makeSpot(nameEl ? nameEl.textContent : "", lat, lon, descEl ? descEl.textContent : "", sourceLabel));
    }
    return { spots: out, skippedShapes: 0 };
  }

  /* ---------------- pasted text / CSV ---------------- */
  // Accepts per line: "Name, 28.12345, -83.2345" · "28 21.702N 82 42.600W Name" ·
  // "N28°21.702' W082°42.600'" · DMS "28 21 42.1 N, 82 42 36 W" · plain decimals.
  function parseLooseLine(line, idx) {
    const t = line.trim();
    if (!t || /^[#/]/.test(t)) return null;

    // DDM / DMS with optional hemisphere letters before or after each group
    const ddm = /([NSns])?\s*(\d{1,2})[°\s:]+(\d{1,2}(?:\.\d+)?)(?:[\s:'"]+(\d{1,2}(?:\.\d+)?))?\s*['"]?\s*([NSns])?[,;\s\/]+([WEwe])?\s*0?(\d{1,3})[°\s:]+(\d{1,2}(?:\.\d+)?)(?:[\s:'"]+(\d{1,2}(?:\.\d+)?))?\s*['"]?\s*([WEwe])?/;
    let m = t.match(ddm);
    if (m) {
      const latDeg = +m[2], latMin = +m[3], latSec = m[4] ? +m[4] : 0;
      const lonDeg = +m[7], lonMin = +m[8], lonSec = m[9] ? +m[9] : 0;
      // If the "minutes" group has decimals it's DDM; a third group means DMS
      let lat = latDeg + latMin / 60 + latSec / 3600;
      let lon = lonDeg + lonMin / 60 + lonSec / 3600;
      const latHemi = (m[1] || m[5] || "N").toUpperCase();
      const lonHemi = (m[6] || m[10] || "W").toUpperCase();
      if (latHemi === "S") lat = -lat;
      if (lonHemi === "W") lon = -lon;
      const name = t.slice(0, m.index).replace(/[,;|-]\s*$/, "").trim() || t.slice(m.index + m[0].length).replace(/^[,;|-]\s*/, "").trim();
      return makeSpot(name || "Pasted spot " + (idx + 1), lat, lon, "", "pasted text");
    }

    // Decimal degrees (1+ decimals; Gulf bounds checks reject junk matches)
    const dec = /(-?\d{1,2}\.\d{1,})[,;\s\/]+(-?\d{1,3}\.\d{1,})/;
    m = t.match(dec);
    if (m) {
      let a = parseFloat(m[1]), b = parseFloat(m[2]);
      let lat = a, lon = b;
      if (Math.abs(a) > 31.5 && Math.abs(b) <= 31.5) { lat = b; lon = a; } // swapped
      if (lon > 0 && lon >= 80 && lon <= 88.5) lon = -lon; // west longitude typed positive
      const name = t.slice(0, m.index).replace(/[,;|-]\s*$/, "").trim() || t.slice(m.index + m[0].length).replace(/^[,;|-]\s*/, "").trim();
      return makeSpot(name || "Pasted spot " + (idx + 1), lat, lon, "", "pasted text");
    }
    return null;
  }

  function parseText(text) {
    const out = [];
    let bad = 0;
    text.split(/\r?\n/).forEach((line, i) => {
      const s = parseLooseLine(line, i);
      if (s) out.push(s);
      else if (line.trim() && !/^(name|lat|lon|title)/i.test(line.trim())) bad++;
    });
    return { spots: out, badLines: bad };
  }

  /* ---------------- entry points ---------------- */
  async function importFile(file) {
    const name = file.name.toLowerCase();
    try {
      let parsed;
      if (name.endsWith(".kmz")) parsed = parseKML(await unzipKml(await file.arrayBuffer()), file.name);
      else if (name.endsWith(".kml")) parsed = parseKML(await file.text(), file.name);
      else if (name.endsWith(".gpx")) parsed = parseGPX(await file.text(), file.name);
      else parsed = parseText(await file.text()); // csv / txt
      const res = merge(parsed.spots);
      return { ...res, found: parsed.spots.length, skippedShapes: parsed.skippedShapes || 0 };
    } catch (e) {
      return { error: e.message || String(e) };
    }
  }

  function importText(text) {
    const parsed = (/^\s*</.test(text)) ? parseKML(text, "pasted KML") : parseText(text);
    const res = merge(parsed.spots);
    return { ...res, found: parsed.spots.length, badLines: parsed.badLines || 0 };
  }

  // Google My Maps share link → KML endpoint. Usually blocked by CORS in the
  // browser, but worth one try; on failure the UI shows the export steps.
  async function importMyMapsLink(url) {
    const m = String(url).match(/[?&]mid=([\w-]+)/);
    if (!m) return { error: "That link has no map id (mid=...). Use the My Maps share link." };
    const kmlUrl = "https://www.google.com/maps/d/kml?mid=" + m[1] + "&forcekml=1";
    try {
      const resp = await fetch(kmlUrl);
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const text = await resp.text();
      const parsed = parseKML(text, "Google My Maps");
      const res = merge(parsed.spots);
      return { ...res, found: parsed.spots.length, skippedShapes: parsed.skippedShapes };
    } catch (e) {
      return { error: "cors" }; // expected: Google blocks cross-site reads
    }
  }

  // Parse a single coordinate string ("28 06.000 N, 083 30.000 W", decimals, DMS…) -> {lat, lon} | null
  function parsePoint(line) {
    const s = parseLooseLine(line, 0);
    return s ? { lat: s.lat, lon: s.lon } : null;
  }

  window.UserSpots = { load, save, clearAll, remove, importFile, importText, importMyMapsLink, parseKML, parseText, parsePoint };
})();
