/* "My Tracks" — the user's own trails (GPX <trk>) drawn on the map.
   Plotter trails run to tens of thousands of points, so each is thinned on
   import (Douglas-Peucker, a few meters — the line looks the same) and kept in
   IndexedDB (too big for localStorage). Tracks are display-only: they never
   touch rankings, the heatmap or exports. */
(function () {
  "use strict";

  /* ---------------- IndexedDB ---------------- */
  const DB_NAME = "gbi-tracks", STORE = "tracks";
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
  async function dbPutAll(recs) {
    const db = await openDb();
    return new Promise((res, rej) => {
      const t = db.transaction(STORE, "readwrite");
      recs.forEach(r => t.objectStore(STORE).put(r));
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

  /* ---------------- thinning ---------------- */
  const TOLERANCE_M = 4;
  // Iterative Douglas-Peucker on a local flat projection (fine at track scale).
  function simplify(pts, tolM) {
    if (pts.length < 3) return pts.slice();
    const r = Math.PI / 180, R = 6371000, kx = Math.cos(pts[0][0] * r) * r * R, ky = r * R;
    const xy = pts.map(p => [p[1] * kx, p[0] * ky]);
    const keep = new Uint8Array(pts.length);
    keep[0] = keep[pts.length - 1] = 1;
    const stack = [[0, pts.length - 1]], tol2 = tolM * tolM;
    while (stack.length) {
      const [a, b] = stack.pop();
      const [ax, ay] = xy[a], [bx, by] = xy[b];
      const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy;
      let maxD = -1, idx = -1;
      for (let i = a + 1; i < b; i++) {
        const [px, py] = xy[i];
        let t = len2 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const ex = ax + t * dx - px, ey = ay + t * dy - py, d = ex * ex + ey * ey;
        if (d > maxD) { maxD = d; idx = i; }
      }
      if (maxD > tol2) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
    }
    return pts.filter((_, i) => keep[i]);
  }

  /* ---------------- GPX ---------------- */
  // Plain string scanning, not DOMParser: plotter exports run to tens of MB and
  // a full DOM of that size stalls (or kills) a phone tab.
  function attr(tag, name) {
    const m = tag.match(new RegExp("\\b" + name + "\\s*=\\s*[\"']([^\"']+)[\"']"));
    return m ? parseFloat(m[1]) : NaN;
  }
  function unescapeXml(s) {
    return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&").trim();
  }
  function parseGPX(text) {
    const out = [];
    const trkRe = /<trk\b[\s\S]*?<\/trk>/g;
    let m;
    while ((m = trkRe.exec(text))) {
      const body = m[0];
      const head = body.split(/<trkseg\b/)[0];
      const nm = head.match(/<name>([\s\S]*?)<\/name>/);
      const segs = [];
      const segRe = /<trkseg\b[\s\S]*?<\/trkseg>/g;
      let s;
      while ((s = segRe.exec(body))) {
        const pts = [];
        const ptRe = /<trkpt\b[^>]*>/g;
        let p;
        while ((p = ptRe.exec(s[0]))) {
          const lat = attr(p[0], "lat"), lon = attr(p[0], "lon");
          if (!isNaN(lat) && !isNaN(lon)) pts.push([lat, lon]);
        }
        if (pts.length > 1) segs.push(pts);
      }
      const t = body.match(/<time>([^<]+)<\/time>/);
      if (segs.length) out.push({ name: nm ? unescapeXml(nm[1]) : "", segs, time: t ? t[1] : null });
    }
    return out;
  }

  /* ---------------- public ---------------- */
  let cache = [];
  let seq = 0;
  const key = r => (r.name || "").toLowerCase() + "|" + r.rawPoints;

  async function importGPXText(text, sourceLabel) {
    const found = parseGPX(text);
    if (!found.length) return { found: 0, added: 0, dup: 0 };
    const have = new Set((await dbAll()).map(key));
    const today = new Date().toISOString().slice(0, 10);
    const recs = [];
    let dup = 0;
    found.forEach((t, i) => {
      const rawPoints = t.segs.reduce((n, s) => n + s.length, 0);
      const rec = {
        id: "t_" + Date.now().toString(36) + "_" + (seq++),
        name: (t.name || "Track " + (i + 1)).replace(/\s+/g, " ").slice(0, 80),
        time: t.time, rawPoints,
        segs: t.segs.map(s => simplify(s, TOLERANCE_M).map(p => [+p[0].toFixed(6), +p[1].toFixed(6)])),
        added: today + (sourceLabel ? " from " + sourceLabel : "")
      };
      if (have.has(key(rec))) { dup++; return; }
      have.add(key(rec));
      recs.push(rec);
    });
    if (recs.length) await dbPutAll(recs);
    return { found: found.length, added: recs.length, dup };
  }

  function bounds(rec) {
    let S = 90, N = -90, W = 180, E = -180;
    rec.segs.forEach(s => s.forEach(([la, lo]) => { S = Math.min(S, la); N = Math.max(N, la); W = Math.min(W, lo); E = Math.max(E, lo); }));
    return [[S, W], [N, E]];
  }

  let renderer = null;
  async function render(layerGroup) {
    cache = (await dbAll()).sort((a, b) => String(b.time || "").localeCompare(String(a.time || "")));
    layerGroup.clearLayers();
    renderer = renderer || L.canvas({ padding: 0.3 });
    for (const rec of cache) {
      const line = L.polyline(rec.segs, { renderer, color: "#ff9f1c", weight: 2, opacity: 0.85 });
      line.bindPopup("<b>" + rec.name.replace(/</g, "&lt;") + "</b><br><span class=\"muted small\">My track · " +
        rec.rawPoints.toLocaleString() + " points</span>");
      line.addTo(layerGroup);
    }
    return cache;
  }

  function list() { return cache; }
  async function removeTrack(id) { await dbDel(id); }
  async function clearAll() { for (const r of await dbAll()) await dbDel(r.id); }

  window.UserTracks = { importGPXText, render, list, bounds, removeTrack, clearAll, _parseGPX: parseGPX, _simplify: simplify };
})();
