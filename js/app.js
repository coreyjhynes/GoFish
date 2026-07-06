/* Gulf Bottom Intel — main app */
(function () {
  "use strict";

  /* ================= state ================= */
  const state = {
    date: new Date(),
    region: localStorage.getItem("GBI_REGION") || "tampa",
    launchId: null,
    species: "all",
    maxSeas: 3,
    tab: "today",
    forecastPoint: null,   // {lat, lon, label}
    forecast: { marine: null, weather: null, tides: null, error: null },
    spotSort: "score"
  };

  const $ = sel => document.querySelector(sel);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const fmtT = d => d ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).replace(" ", "").toLowerCase() : "—";
  const fmtD = d => d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  /* ---- regions ---- */
  function regionObj() { return DATA_CORE.regions.find(r => r.id === state.region) || DATA_CORE.regions[0]; }
  function regionLaunches() { return DATA_CORE.launches.filter(l => (l.region || "tampa") === state.region); }
  function inRegion(x) { return (x.region || "tampa") === state.region; }
  function launch() { return regionLaunches().find(l => l.id === state.launchId) || regionLaunches()[0]; }
  // Distances: fixed regional reference when defined (Tampa = Anclote River
  // entrance, Venice = South Pass); otherwise the selected launch (Keys).
  function distRef() { return regionObj().distanceRef || launch(); }

  function destPoint(lat, lon, bearingDeg, distMi) {
    const R = 3958.7613, r = Math.PI / 180;
    const br = bearingDeg * r, d = distMi / R;
    const la1 = lat * r, lo1 = lon * r;
    const la2 = Math.asin(Math.sin(la1) * Math.cos(d) + Math.cos(la1) * Math.sin(d) * Math.cos(br));
    const lo2 = lo1 + Math.atan2(Math.sin(br) * Math.sin(d) * Math.cos(la1), Math.cos(d) - Math.sin(la1) * Math.sin(la2));
    return { lat: la2 / r, lon: lo2 / r };
  }

  function defaultForecastPoint() {
    const L0 = launch(), R = regionObj();
    const p = destPoint(L0.lat, L0.lon, R.fpBearing || 262, R.fpMiles || 35);
    return { lat: p.lat, lon: p.lon, label: "~" + (R.fpMiles || 35) + " mi out of " + L0.name.split(" (")[0] };
  }

  /* ================= map ================= */
  let map, heatLayer, spotLayer, zoneLayer, ringLayer, fpMarker, chartGroup, encGroup, contourGroup, tripLayer, spotRingLayer, seagrassGroup, rigLayer, rigCanvas;

  function initMap() {
    const R0 = regionObj();
    map = L.map("map", { zoomControl: true, attributionControl: true }).setView(R0.center, R0.zoom);

    const ocean = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Esri, GEBCO, NOAA, Garmin", maxNativeZoom: 13, maxZoom: 16
    });
    const oceanRef = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}", {
      maxNativeZoom: 13, maxZoom: 16, pane: "shadowPane"
    });
    const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap", maxZoom: 19
    });
    // High-res satellite (Esri World Imagery — same Maxar-class imagery as the big consumer maps,
    // licensed for use here; Google's tiles are not). Grass beds show beautifully in the shallows.
    const sat = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Esri, Maxar, Earthstar Geographics", maxZoom: 19
    });
    const satRef = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19, pane: "shadowPane"
    });
    ocean.addTo(map); oceanRef.addTo(map);

    // Zones live in their own pane ABOVE image overlays (seagrass/contours/charts)
    // so their tint is never muted; non-interactive so clicks fall through to spots.
    map.createPane("zones").style.zIndex = 450;
    chartGroup = L.layerGroup().addTo(map);   // user-imported chart overlays (under vectors/pins)
    encGroup = L.layerGroup();                 // live NOAA ENC full chart (opt-in via layer control)
    contourGroup = L.layerGroup().addTo(map);  // depth contour lines + soundings — ON by default
    seagrassGroup = L.layerGroup();            // FWC seagrass beds — auto-on with the Scallops chip
    spotRingLayer = L.layerGroup().addTo(map); // range rings around the last-clicked spot

    // NOAA BlueTopo — national best-available bathymetry (public domain).
    // Color depth model + hillshade relief, tiled via nowCOAST WMTS.
    const btWmts = layer =>
      "https://nowcoast.noaa.gov/geoserver/gwc/service/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0" +
      "&LAYER=" + layer + "&STYLE=&TILEMATRIXSET=EPSG:3857&TILEMATRIX=EPSG:3857:{z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png8";
    const btBathy = L.tileLayer(btWmts("bluetopo:bathymetry"), { maxNativeZoom: 14, maxZoom: 16, opacity: 0.75, attribution: "NOAA BlueTopo" });
    const btHill = L.tileLayer(btWmts("bluetopo:hillshade"), { maxNativeZoom: 14, maxZoom: 16, opacity: 0.45 });
    const bathyGroup = L.layerGroup([btBathy, btHill]);
    heatLayer = L.heatLayer([], { radius: 26, blur: 20, maxZoom: 10, max: 1.0,
      gradient: { 0.2: "#10314a", 0.4: "#1b6f8a", 0.6: "#2ec4b6", 0.78: "#ffd166", 0.92: "#ef476f" } }).addTo(map);
    zoneLayer = L.layerGroup().addTo(map);
    spotLayer = L.layerGroup().addTo(map);
    ringLayer = L.layerGroup().addTo(map);
    tripLayer = L.layerGroup().addTo(map);
    rigLayer = L.layerGroup().addTo(map);      // full BOEM platform field (Venice region)

    L.control.layers(
      { "Ocean chart": L.layerGroup([ocean, oceanRef]), "Satellite": L.layerGroup([sat, satRef]), "Streets": osm },
      { "Heatmap": heatLayer, "Spots": spotLayer, "Areas": zoneLayer, "Launch range rings": ringLayer,
        "Spot range rings": spotRingLayer, "Oil platforms (BOEM)": rigLayer,
        "Depth contours": contourGroup, "Depth model (BlueTopo)": bathyGroup,
        "Seagrass beds (FWC)": seagrassGroup,
        "My charts": chartGroup, "NOAA ENC chart (full)": encGroup },
      { collapsed: true }
    ).addTo(map);

    // NOAA ENC services are dynamic exports — re-render on pan/zoom while enabled
    map.on("moveend", () => { Charts.encRefresh(map, encGroup); Charts.contoursRefresh(map, contourGroup); Charts.seagrassRefresh(map, seagrassGroup); });
    map.on("overlayadd", e => {
      if (e.layer === encGroup) Charts.encRefresh(map, encGroup);
      if (e.layer === contourGroup) Charts.contoursRefresh(map, contourGroup);
      if (e.layer === seagrassGroup) Charts.seagrassRefresh(map, seagrassGroup);
    });
    map.whenReady(() => setTimeout(() => Charts.contoursRefresh(map, contourGroup), 400));

    map.on("baselayerchange", e => { /* keep ref labels with ocean */ });

    // Range rings follow the last-clicked spot and persist (toggle off via layer control); rescale on zoom
    map.on("popupopen", e => {
      const ll = e.popup.getLatLng();
      if (ll) { showSpotRings(ll); spotRingName = pendingRingName || spotRingName; }
    });
    map.on("zoomend", renderSpotRings);

    // Heat radius is in PIXELS — scale it with zoom so hot areas keep their
    // geographic size instead of shrinking to dots; restyle zone fills too.
    map.on("zoomend", () => {
      const z = map.getZoom();
      const r = Math.round(Math.min(80, z <= 9 ? 26 : 26 * Math.pow(1.45, z - 9)));
      if (heatLayer.setOptions) heatLayer.setOptions({ radius: r, blur: Math.round(r * 0.8) });
      else refreshHeat();
      drawZones();
    });

    // Scale ruler (statute miles / feet), updates with zoom
    L.control.scale({ metric: false, imperial: true, maxWidth: 150, position: "bottomleft" }).addTo(map);

    // Right-click: zone info if inside one, else dropped pin with coords + rings
    map.on("contextmenu", e => {
      const z = zoneAt(e.latlng);
      if (z) openTargetPopup(z, true, e.latlng);
      else droppedPinPopup(e.latlng);
    });

    // Forgiving left-click: snap to the nearest spot within 14 px of the click.
    // (Direct hits on markers/dots stop propagation and never reach this.)
    map.on("click", e => {
      const p = map.latLngToContainerPoint(e.latlng);
      let best = null, bestD = 14;
      for (const s of allSpots()) {
        const sp = map.latLngToContainerPoint([s.lat, s.lon]);
        const d = Math.hypot(sp.x - p.x, sp.y - p.y);
        if (d < bestD) { bestD = d; best = s; }
      }
      if (best) openTargetPopup(best, false, L.latLng(best.lat, best.lon));
    });

    addSearchControl();
  }

  function typeLabel(t) {
    return { wreck: "Wreck", artificial_reef: "Artificial reef", barge: "Barge", tower: "Tower", rubble: "Rubble",
      ledge: "Ledge", hard_bottom: "Hard bottom", spring: "Spring", area_center: "Area", lump: "Lump",
      ledge_belt: "Ledge belt", natural_area: "Natural area", hapc: "Protected area (HAPC)", user: "My spot",
      no_take: "NO-TAKE reserve", scallop_zone: "Scallop harvest zone", scallop_flat: "Scallop flat",
      oil_rig: "Oil rig / floater", lump: "Hump / lump", deep_drop: "Deep-drop grounds", reef_light: "Reef light",
      troll_corridor: "Trolling corridor" }[t] || t;
  }
  function pinLetter(t) {
    return { wreck: "W", artificial_reef: "R", barge: "B", tower: "T", rubble: "R", ledge: "L", hard_bottom: "H", spring: "S", area_center: "A", user: "★", scallop_flat: "S", oil_rig: "O", lump: "H", deep_drop: "D", reef_light: "✦" }[t] || "•";
  }
  function allSpots() { return DATA_SPOTS.concat(window.USER_SPOTS || []); }

  /* ---- spot popups ---- */
  let pendingRingName = null; // name for the rings' anchor, set just before a popup opens
  function openTargetPopup(target, isZone, latlng) {
    const html = popupHtml(target, isZone); // built BEFORE rings move: shows distance from the previous anchor
    pendingRingName = target.name;
    L.popup({ maxWidth: 320 }).setLatLng(latlng).setContent(html).openOn(map);
  }
  function onRightClick(layer, handler) {
    layer.on("contextmenu", ev => {
      if (ev.originalEvent) { ev.originalEvent.preventDefault(); L.DomEvent.stopPropagation(ev.originalEvent); }
      handler(ev);
    });
  }
  function onLeftClick(layer, handler) {
    layer.on("click", ev => {
      if (ev.originalEvent) L.DomEvent.stopPropagation(ev.originalEvent); // keep map click from instantly closing the popup
      handler(ev);
    });
  }
  // Which zone (smallest first) contains this point? Used for map-level right-click,
  // since the user-spot canvas sits above zone SVG and eats their DOM events.
  function zoneAt(ll) {
    let best = null, bestSize = Infinity;
    for (const z of DATA_ZONES) {
      if (!inRegion(z)) continue;
      if (!Scoring.zoneContains(z, ll.lat, ll.lng)) continue;
      let size;
      if (z.radius_mi) size = z.radius_mi * z.radius_mi;
      else {
        const lats = z.polygon.map(p => p[0]), lons = z.polygon.map(p => p[1]);
        size = (Math.max(...lats) - Math.min(...lats)) * (Math.max(...lons) - Math.min(...lons)) * 3600;
      }
      if (size < bestSize) { best = z; bestSize = size; }
    }
    return best;
  }
  function droppedPinPopup(ll) {
    pendingRingName = "dropped pin";
    L.popup({ maxWidth: 300 }).setLatLng(ll).setContent(
      '<div class="pop"><h4>Dropped pin</h4><div class="coords">' + ll.lat.toFixed(5) + ", " + ll.lng.toFixed(5) + "<br>" +
      Exporter.ddm(ll.lat, true) + "&nbsp;&nbsp;" + Exporter.ddm(ll.lng, false) + "</div>" +
      '<button onclick="App.copyCoords(' + ll.lat.toFixed(6) + "," + ll.lng.toFixed(6) + ')">📋 Copy GPS</button>' +
      "<button onclick=\"App.setForecastPoint(" + ll.lat.toFixed(5) + "," + ll.lng.toFixed(5) + ",'Dropped pin')\">🌊 Forecast here</button>" +
      "<button onclick=\"App.addTripStop('Waypoint " + ll.lat.toFixed(3) + "," + ll.lng.toFixed(3) + "'," + ll.lat.toFixed(6) + "," + ll.lng.toFixed(6) + ')">➕ Add to trip</button></div>'
    ).openOn(map);
  }

  /* ---- click-a-spot range rings: persistent layer, zoom-adaptive, labeled in miles ---- */
  let spotRingCenter = null, spotRingName = null;

  function niceStep(raw) {
    const steps = [0.1, 0.25, 0.5, 1, 2, 5, 10, 20, 25, 50];
    for (const s of steps) if (raw <= s) return s;
    return 100;
  }
  function fmtMi(v) { return (v < 1 ? v.toFixed(2).replace(/0$/, "") : String(v)) + " mi"; }

  function renderSpotRings() {
    if (!spotRingLayer) return;
    spotRingLayer.clearLayers();
    if (!spotRingCenter) return;
    const b = map.getBounds();
    const widthMi = Scoring.haversineMi(b.getCenter().lat, b.getWest(), b.getCenter().lat, b.getEast());
    const step = niceStep(widthMi / 12);
    for (let i = 1; i <= 4; i++) {
      const rMi = step * i;
      L.circle(spotRingCenter, {
        radius: rMi * 1609.344, color: "#f4a259", weight: 1,
        opacity: i === 4 ? 0.3 : 0.55, fill: false, dashArray: "4 6", interactive: false
      }).addTo(spotRingLayer);
      L.marker([spotRingCenter.lat + rMi / 69.0, spotRingCenter.lng], {
        icon: L.divIcon({ className: "ring-label", html: fmtMi(rMi), iconSize: null }),
        interactive: false, keyboard: false
      }).addTo(spotRingLayer);
    }
    L.circleMarker(spotRingCenter, { radius: 3, color: "#f4a259", fillColor: "#f4a259", fillOpacity: 1, interactive: false }).addTo(spotRingLayer);
  }
  function showSpotRings(latlng) { spotRingCenter = latlng; renderSpotRings(); }

  /* ---- on-map spot search ---- */
  function mapSearch(q) {
    if (!q || q.trim().length < 2) return [];
    const out = [];
    const pt = UserSpots.parsePoint(q); // raw GPS pasted?
    if (pt) {
      out.push({ point: pt, html: '<div class="pin t-area_center">⌖</div><div><div>Go to ' + pt.lat.toFixed(5) + ", " + pt.lon.toFixed(5) +
        '</div><div class="ms-sub">fly to these coordinates</div></div>' });
    }
    const ql = q.trim().toLowerCase().replace(/\s+/g, " ");
    const cand = [];
    for (const s of allSpots()) {
      if (!s.user && !inRegion(s)) continue; // public spots: this region only; user spots always searchable
      const nm = s.name.toLowerCase().replace(/\s+/g, " ");
      if ((nm + " " + (s.notes || "").toLowerCase() + " " + s.type).includes(ql))
        cand.push({ rank: nm.startsWith(ql) ? 0 : nm.includes(ql) ? 1 : 2, target: s, isZone: false });
    }
    for (const z of DATA_ZONES) {
      if (!inRegion(z)) continue;
      if ((z.name + " " + (z.notes || "")).toLowerCase().includes(ql))
        cand.push({ rank: z.name.toLowerCase().startsWith(ql) ? 0 : z.name.toLowerCase().includes(ql) ? 1 : 2, target: z, isZone: true });
    }
    cand.sort((a, b) => a.rank - b.rank || a.target.name.length - b.target.name.length);
    for (const c of cand.slice(0, Math.max(0, 8 - out.length))) {
      const t = c.target;
      const depth = t.depth_ft == null ? "" : (Array.isArray(t.depth_ft) ? t.depth_ft.join("–") : t.depth_ft) + " ft";
      const pin = c.isZone ? '<div class="pin t-area_center">▣</div>' : '<div class="pin t-' + t.type + '">' + pinLetter(t.type) + "</div>";
      out.push({ ...c, html: pin + "<div><div>" + t.name + '</div><div class="ms-sub">' +
        [typeLabel(c.isZone ? t.kind : t.type), depth, t.user ? "MINE" : (t.grade ? "Grade " + t.grade : "")].filter(Boolean).join(" · ") + "</div></div>" });
    }
    return out;
  }

  function addSearchControl() {
    const ctl = L.control({ position: "topleft" });
    ctl.onAdd = () => {
      const div = L.DomUtil.create("div", "map-search leaflet-control");
      div.innerHTML = '<span class="ms-icon">🔍</span><input type="search" placeholder="Search spots / paste GPS…" autocomplete="off"><div class="ms-results" style="display:none"></div>';
      L.DomEvent.disableClickPropagation(div);
      L.DomEvent.disableScrollPropagation(div);
      const inp = div.querySelector("input"), box = div.querySelector(".ms-results");
      let results = [], sel = -1;
      function close() { box.style.display = "none"; box.innerHTML = ""; results = []; sel = -1; }
      function go(r) {
        close(); inp.blur(); inp.value = "";
        if (r.point) {
          map.flyTo([r.point.lat, r.point.lon], Math.max(map.getZoom(), 10), { duration: 0.8 });
          setTimeout(() => droppedPinPopup(L.latLng(r.point.lat, r.point.lon)), 850);
        } else flyTo(r.target, r.isZone);
      }
      function render() {
        if (!results.length) { close(); return; }
        box.innerHTML = ""; box.style.display = "block";
        results.forEach((r, i) => {
          const row = document.createElement("div");
          row.className = "ms-row" + (i === sel ? " sel" : "");
          row.innerHTML = r.html;
          row.onmousedown = e => { e.preventDefault(); go(r); }; // mousedown wins over input blur
          box.append(row);
        });
      }
      inp.addEventListener("input", () => { results = mapSearch(inp.value); sel = results.length ? 0 : -1; render(); });
      inp.addEventListener("keydown", e => {
        if (e.key === "Enter" && results.length) go(results[Math.max(0, sel)]);
        else if (e.key === "ArrowDown") { sel = Math.min(results.length - 1, sel + 1); render(); e.preventDefault(); }
        else if (e.key === "ArrowUp") { sel = Math.max(0, sel - 1); render(); e.preventDefault(); }
        else if (e.key === "Escape") { close(); inp.blur(); }
      });
      inp.addEventListener("blur", () => setTimeout(close, 150));
      return div;
    };
    ctl.addTo(map);
  }

  function drawRings() {
    ringLayer.clearLayers();
    const L0 = launch();
    const degPerMiLon = 1 / (69.0 * Math.cos(L0.lat * Math.PI / 180));
    [20, 40, 60, 80].forEach(mi => {
      L.circle([L0.lat, L0.lon], { radius: mi * 1609.344, color: "#3ec6d0", weight: 1, opacity: 0.45, fill: false, dashArray: "6 7" })
        .bindTooltip(mi + " mi from " + L0.name.split(" (")[0], { permanent: false }).addTo(ringLayer);
      // permanent label on the offshore (west) side of each ring
      L.marker([L0.lat, L0.lon - mi * degPerMiLon], {
        icon: L.divIcon({ className: "ring-label cyan", html: mi + " mi", iconSize: null }),
        interactive: false, keyboard: false
      }).addTo(ringLayer);
    });
    L.circleMarker([L0.lat, L0.lon], { radius: 5, color: "#3ec6d0", fillColor: "#3ec6d0", fillOpacity: 1 })
      .bindTooltip("Launch: " + L0.name).addTo(ringLayer);
  }

  function starStr(n) { return "★".repeat(n) + "☆".repeat(Math.max(0, 5 - n)); }

  function speciesBadges(target, date) {
    const entries = Object.entries(target.species || {}).filter(([, r]) => r > 0).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return entries.map(([sp, r]) => {
      let open = Scoring.isOpen(sp, date).open;
      if (target.season) { // zone-specific season (scallop zones) overrides the statewide window
        const ds = date.toISOString().slice(0, 10);
        open = ds >= target.season.start && ds <= target.season.end;
      }
      const nm = Scoring.speciesName(sp);
      return '<div>' + (open ? "🟢" : "🔴") + ' ' + nm + ' <span class="stars">' + starStr(r) + '</span></div>';
    }).join("");
  }

  function popupHtml(target, isZone) {
    const d = state.date;
    const isUser = !!target.user;
    // User spots are NEVER scored as recommendations — they get a read-only
    // "alignment with public intel" diagnostic instead.
    const sc = isUser ? null : Scoring.scoreTarget(target, d, state.species, isZone);
    const al = isUser ? Scoring.alignment(target, d, state.species) : null;
    const lat = isZone ? target.center[0] : target.lat;
    const lon = isZone ? target.center[1] : target.lon;
    const ref = distRef();
    const dist = Scoring.haversineMi(ref.lat, ref.lon, lat, lon);
    const depth = target.depth_ft == null ? "?" : Array.isArray(target.depth_ft) ? target.depth_ft.join("–") : target.depth_ft;
    const srcs = (target.sources || []).map(s => '<a href="' + s.url + '" target="_blank" rel="noopener">' + s.name + "</a>").join(" · ");
    const reps = (!isUser && sc.reports || []).slice(0, 3).map(r =>
      '<div class="small">📋 ' + r.date + " — " + (r.details || r.area || "") + (r.url ? ' <a href="' + r.url + '" target="_blank" rel="noopener">src</a>' : "") + "</div>").join("");
    const scoreLine = isUser
      ? "Public-intel alignment: <b>" + al.score + "</b> — " + al.label
      : "Today's spot score: <b>" + sc.score + "</b>";
    const reasonList = isUser ? al.reasons : sc.reasons;
    // spot-to-spot distance from the current ring anchor (the last spot clicked)
    const refDist = spotRingCenter ? Scoring.haversineMi(lat, lon, spotRingCenter.lat, spotRingCenter.lng) : null;
    const refLine = (refDist != null && refDist > 0.05 && spotRingName)
      ? '<div class="small" style="color:var(--amber)">📏 ' + (refDist < 10 ? refDist.toFixed(1) : Math.round(refDist)) + " mi from " + spotRingName + "</div>"
      : "";
    return '<div class="pop">' +
      "<h4>" + target.name + "</h4>" +
      '<span class="badge type">' + typeLabel(target.type || target.kind) + '</span> ' +
      (target.user ? '<span class="badge mine">MINE</span> ' : '<span class="badge g' + target.grade + '">Grade ' + target.grade + "</span> ") +
      '<span class="badge type">' + depth + " ft</span>" +
      '<div class="coords">' + lat.toFixed(5) + ", " + lon.toFixed(5) + "<br>" +
      Exporter.ddm(lat, true) + "&nbsp;&nbsp;" + Exporter.ddm(lon, false) + "</div>" +
      '<div class="small muted">' + dist.toFixed(0) + " mi from " + (ref.short || ref.name) + " · " + scoreLine + "</div>" +
      refLine +
      (target.season ? (() => {
        const ds = d.toISOString().slice(0, 10);
        const on = ds >= target.season.start && ds <= target.season.end;
        const f = s => new Date(s + "T12:00").toLocaleDateString([], { month: "short", day: "numeric" });
        return '<div class="small">' + (on ? '<span class="badge open">OPEN</span>' : '<span class="badge closed">CLOSED</span>') +
          " Season here: <b>" + f(target.season.start) + " – " + f(target.season.end) + "</b></div>";
      })() : "") +
      '<div style="margin:5px 0">' + speciesBadges(target, d) + "</div>" +
      (reasonList.length ? '<div class="small">' + reasonList.map(r => "• " + r).join("<br>") + "</div>" : "") +
      reps +
      (target.notes ? '<div class="small muted" style="margin-top:4px">' + target.notes + "</div>" : "") +
      (srcs ? '<div class="srcs">Sources: ' + srcs + "</div>" : "") +
      '<button onclick="App.copyCoords(' + lat.toFixed(6) + "," + lon.toFixed(6) + ')">📋 Copy GPS</button>' +
      '<button onclick="App.setForecastPoint(' + lat.toFixed(5) + "," + lon.toFixed(5) + ",'" + target.name.replace(/'/g, "\\'") + "')\">🌊 Forecast here</button>" +
      '<button onclick="App.addTripStop(\'' + target.name.replace(/'/g, "\\'") + "'," + lat.toFixed(6) + "," + lon.toFixed(6) + ')">➕ Add to trip</button>' +
      (target.user ? '<button onclick="App.removeUserSpot(\'' + target.id + '\')">🗑 Remove</button>' : "") +
      "</div>";
  }

  let userCanvas = null;
  function drawSpots() {
    spotLayer.clearLayers();
    // Public/research spots: rich divIcon pins (always a small set)
    for (const s of DATA_SPOTS) {
      if (!inRegion(s)) continue;
      const relevant = state.species === "all" || (s.species[state.species] || 0) > 0;
      const icon = L.divIcon({
        className: "",
        html: '<div class="pin t-' + s.type + " g" + s.grade + (relevant ? "" : " dim") + '">' + pinLetter(s.type) + "</div>",
        iconSize: [22, 22], iconAnchor: [11, 11]
      });
      const m = L.marker([s.lat, s.lon], { icon });
      onLeftClick(m, () => openTargetPopup(s, false, m.getLatLng()));
      onRightClick(m, () => openTargetPopup(s, false, m.getLatLng()));
      m.bindTooltip(s.name);
      m.addTo(spotLayer);
    }
    // User spots: DOM pins when few, fast canvas dots when thousands
    const us = window.USER_SPOTS || [];
    const heavy = us.length > 200;
    if (heavy && !userCanvas) userCanvas = L.canvas({ padding: 0.3, tolerance: 7 }); // forgiving hit-test on small dots
    for (const s of us) {
      const relevant = state.species === "all" || (s.species[state.species] || 0) > 0;
      let m;
      if (heavy) {
        m = L.circleMarker([s.lat, s.lon], {
          renderer: userCanvas, radius: 4.5,
          color: "#06121b", weight: 1,
          fillColor: "#ffd166", fillOpacity: relevant ? 0.95 : 0.3
        });
      } else {
        const icon = L.divIcon({
          className: "",
          html: '<div class="pin t-user' + (relevant ? "" : " dim") + '">★</div>',
          iconSize: [22, 22], iconAnchor: [11, 11]
        });
        m = L.marker([s.lat, s.lon], { icon });
        m.bindTooltip(s.name);
      }
      onLeftClick(m, ev => openTargetPopup(s, false, m.getLatLng ? m.getLatLng() : ev.latlng));
      onRightClick(m, ev => openTargetPopup(s, false, m.getLatLng ? m.getLatLng() : ev.latlng));
      m.addTo(spotLayer);
    }
  }

  function drawZones() {
    zoneLayer.clearLayers();
    for (const z of DATA_ZONES) {
      if (!inRegion(z)) continue;
      // Fill steps UP HARD with zoom: inside a big zone its edges are off-screen, so the
      // tint is the only thing telling you you're in scallop/managed water. Hot magenta
      // at close zoom so it reads over green seagrass + satellite.
      const zf = map ? map.getZoom() : 8;
      const scColor = zf >= 11 ? "#ff3d9e" : "#ff9ecb";
      const scFill = zf >= 12 ? 0.30 : zf >= 10 ? 0.18 : 0.06;
      const genFill = zf >= 11 ? 0.16 : 0.07;
      const style = z.avoid
        ? { color: "#f06262", weight: 2, opacity: 0.9, fillColor: "#f06262", fillOpacity: 0.20, dashArray: "3 5" }
        : z.kind === "scallop_zone"
          ? { color: scColor, weight: zf >= 12 ? 4 : zf >= 10 ? 3 : 2, opacity: 1, fillColor: scColor, fillOpacity: scFill, dashArray: "6 6" }
          : { color: z.kind === "hapc" ? "#b58aef" : "#2ec4b6", weight: 1.4, opacity: 0.75, fillOpacity: genFill, dashArray: "5 6" };
      const opts = { ...style, pane: "zones", interactive: false }; // info via right-click (geometry lookup), clicks pass through
      let shape;
      if (z.polygon && z.polygon.length) shape = L.polygon(z.polygon, opts);
      else if (z.center) shape = L.circle(z.center, { ...opts, radius: (z.radius_mi || 5) * 1609.344 });
      if (!shape) continue;
      shape.addTo(zoneLayer);
    }
  }

  /* Full BOEM platform field — context layer for the Venice region only.
     428 standing structures; steel canvas dots, click for GPS/trip actions. */
  function rigPopup(lat, lon, label) {
    pendingRingName = label;
    const ref = distRef();
    L.popup({ maxWidth: 300 }).setLatLng([lat, lon]).setContent(
      '<div class="pop"><h4>' + label + "</h4>" +
      '<span class="badge type">Oil platform</span> <span class="badge gA">BOEM</span>' +
      '<div class="coords">' + lat.toFixed(5) + ", " + lon.toFixed(5) + "<br>" + Exporter.ddm(lat, true) + "&nbsp;&nbsp;" + Exporter.ddm(lon, false) + "</div>" +
      '<div class="small muted">' + Scoring.haversineMi(ref.lat, ref.lon, lat, lon).toFixed(0) + " mi from " + (ref.short || ref.name) + " · every standing structure holds bait — the curated pins are the proven producers</div>" +
      '<button onclick="App.copyCoords(' + lat.toFixed(6) + "," + lon.toFixed(6) + ')">📋 Copy GPS</button>' +
      "<button onclick=\"App.setForecastPoint(" + lat.toFixed(5) + "," + lon.toFixed(5) + ",'" + label + "')\">🌊 Forecast here</button>" +
      "<button onclick=\"App.addTripStop('" + label + "'," + lat.toFixed(6) + "," + lon.toFixed(6) + ')">➕ Add to trip</button></div>'
    ).openOn(map);
  }
  function drawRigs() {
    if (!rigLayer) return;
    rigLayer.clearLayers();
    if (state.region !== "venice" || !window.RIGS_VENICE) return;
    if (!rigCanvas) rigCanvas = L.canvas({ padding: 0.3, tolerance: 6 });
    for (const r of RIGS_VENICE) {
      const la = r[0], lo = r[1], id = r[2], yr = r[3];
      const label = "BOEM platform #" + id + (yr ? " · since " + yr : "");
      const m = L.circleMarker([la, lo], {
        renderer: rigCanvas, radius: 3.5,
        color: "#22303d", weight: 1, fillColor: "#aab4c0", fillOpacity: 0.9
      });
      onLeftClick(m, () => rigPopup(la, lo, label));
      onRightClick(m, () => rigPopup(la, lo, label));
      m.addTo(rigLayer);
    }
  }

  function refreshHeat() {
    heatLayer.setLatLngs(Scoring.heatPoints(state.date, state.species));
  }

  /* ================= forecast loading ================= */
  let loadSeq = 0;
  async function loadForecast() {
    const seq = ++loadSeq;
    const fp = state.forecastPoint || defaultForecastPoint();
    const L0 = launch();
    state.forecast = { marine: null, weather: null, tides: null, error: null, loading: true };
    renderTab();
    const [marine, weather, tides] = await Promise.allSettled([
      Conditions.marine(fp.lat, fp.lon),
      Conditions.weather(fp.lat, fp.lon),
      Conditions.tides(L0.tideStation, state.date)
    ]).then(rs => rs.map(r => r.status === "fulfilled" ? r.value : null));
    if (seq !== loadSeq) return; // superseded
    state.forecast = { marine, weather, tides, loading: false,
      error: (!marine && !weather) ? "Forecast services unreachable — astronomy & tide math still work." : null };
    renderTab();
  }

  /* ================= TODAY tab ================= */
  function renderToday(root) {
    const d = state.date;
    const L0 = launch();
    const fp = state.forecastPoint || defaultForecastPoint();
    const fc = state.forecast;
    const marineDay = fc.marine ? Conditions.daySlice(fc.marine, d, 6, 20) : null;
    const weatherDay = fc.weather ? Conditions.daySlice(fc.weather, d, 5, 21) : null;
    const astroRating = Astro.dayRating(d);
    const tideRange = fc.tides ? fc.tides.range : null;
    const ds = Scoring.dayScore({ date: d, maxSeasFt: state.maxSeas, tideRange, marineDay, weatherDay, astroRating });

    /* --- score card --- */
    const card1 = el("div", "card");
    card1.append(el("h3", null, "Day outlook — " + fmtD(d)));
    const wrap = el("div", null);
    wrap.id = "scoreWrapOuter";
    const col = ds.score == null ? "var(--dim)" : ds.score >= 65 ? "var(--good)" : ds.score >= 45 ? "var(--warn)" : "var(--bad)";
    const gn = ds.gonogo === "go" ? '<span class="gonogo go">✓ GO</span>' : ds.gonogo === "caution" ? '<span class="gonogo caution">⚠ CAUTION</span>' : '<span class="gonogo nogo">✗ NO-GO</span>';
    wrap.innerHTML = '<div id="scoreWrap">' +
      '<div id="scoreRing" style="--pct:' + (ds.score || 0) + ";--col:" + col + '"><div><div id="scoreNum">' + (ds.score == null ? "—" : ds.score) + '</div><div id="scoreLabel">' + ds.label + "</div></div></div>" +
      '<div><div>' + gn + (fc.loading ? ' <span class="statusmsg">loading forecast…</span>' : "") + "</div>" +
      '<div class="muted small" style="margin-top:4px">Forecast point: ' + fp.label + "<br>Seas limit: " + state.maxSeas + " ft · Tides: " + L0.tideStationName + "</div></div></div>";
    card1.append(wrap);
    const fl = el("div", null);
    ds.factors.forEach(f => {
      const pct = f.max ? Math.round(f.pts / f.max * 100) : 0;
      fl.append(el("div", "factor",
        '<div class="fname">' + f.name + '</div><div class="bar"><div style="width:' + pct + '%"></div></div>' +
        '<div class="fpts">' + (f.max ? f.pts + "/" + f.max : "—") + '</div><div class="fdetail">' + f.detail + "</div>"));
    });
    card1.append(fl);
    if (fc.error) card1.append(el("div", "statusmsg", fc.error));
    root.append(card1);

    /* --- moon & solunar --- */
    const moon = Astro.moonInfo(d);
    const sol = Astro.solunar(d, fp.lat, fp.lon);
    const sun = Astro.sunTimes(d, fp.lat, fp.lon);
    const card2 = el("div", "card");
    card2.append(el("h3", null, "Moon & best fishing times"));
    card2.append(el("div", "flexrow",
      '<span class="bigmoon">' + moon.emoji + "</span><div><b>" + moon.name + "</b> · " + moon.illum + "% lit" +
      '<div class="muted small">' + (astroRating.days <= 4 ? Math.abs(astroRating.signedDays).toFixed(1) + " days " + (astroRating.signedDays < 0 ? "past" : "until") + " " + astroRating.nearest + " moon" : "mid-cycle") +
      " · Solunar day rating: " + "🐟".repeat(Math.round(astroRating.rating)) + "</div></div>" +
      '<div class="spacer"></div><div class="small muted">☀ ' + fmtT(sun.sunrise) + "–" + fmtT(sun.sunset) + "<br>☾ " + fmtT(sol.moonrise) + (sol.moonset ? "–" + fmtT(sol.moonset) : "") + "</div>"));
    card2.append(buildTimeline(d, sol, sun, fc.tides));
    const lg = el("div", "legend",
      '<span><i style="background:rgba(76,217,123,.5)"></i>Major (moon over/underfoot)</span>' +
      '<span><i style="background:rgba(244,162,89,.5)"></i>Minor (moonrise/set)</span>' +
      '<span><i style="background:rgba(0,0,0,.45)"></i>Night</span>');
    card2.append(lg);
    const majTxt = sol.majors.map(m => "<b>" + fmtT(m.start) + "–" + fmtT(m.end) + "</b> (" + m.label + ")").join(" · ");
    const minTxt = sol.minors.map(m => fmtT(m.start) + "–" + fmtT(m.end)).join(" · ");
    card2.append(el("div", "small", "Majors: " + (majTxt || "—") + '<br><span class="muted">Minors: ' + (minTxt || "—") + "</span>"));

    /* --- ranked bite windows: solunar + tide movement + dawn/dusk + hourly current --- */
    const marineFull = fc.marine ? Conditions.daySlice(fc.marine, d, 0, 24) : null;
    const bw = Scoring.biteWindows({ date: d, sol, sun, tides: fc.tides, marineDay: marineFull });
    state.biteWindows = { key: d.toDateString(), windows: bw.windows };
    card2.append(el("hr", "thin"));
    const strip = el("div", "bitestrip");
    const day0b = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const pctB = t => Math.max(0, Math.min(100, (t - day0b) / 864000));
    for (const st of bw.steps) {
      if (st.score < 52) continue;
      const seg = el("div");
      seg.style.left = pctB(st.t) + "%";
      seg.style.width = (15 / 1440 * 100 + 0.05) + "%";
      seg.style.background = st.score >= 66 ? "var(--good)" : "var(--warn)";
      seg.style.opacity = st.score >= 66 ? "0.9" : "0.65";
      strip.append(seg);
    }
    card2.append(el("div", "small", "🎯 <b>Best windows</b> <span class='muted'>(solunar + tide flow + light + current)</span>"));
    card2.append(strip);
    if (bw.windows.length) {
      bw.windows.forEach(w => card2.append(el("div", "bwin",
        '<span class="badge ' + (w.tier === 2 ? "open" : "gB") + '">' + w.label + "</span> <b>" + fmtT(w.start) + "–" + fmtT(w.end) + "</b> " +
        '<span class="muted small">' + (w.reasons.join(" + ") || "steady factors") + "</span>")));
    } else {
      card2.append(el("div", "muted small", "No standout windows — factors are spread thin today; fish the tide changes."));
    }
    root.append(card2);

    /* --- tides --- */
    const card3 = el("div", "card");
    card3.append(el("h3", null, "Tide — " + L0.tideStationName));
    if (fc.tides) {
      const cv = el("canvas"); cv.id = "tideChart"; card3.append(cv);
      requestAnimationFrame(() => drawTideChart(cv, fc.tides, d));
      const rows = fc.tides.today.map(p => "<b>" + (p.type === "H" ? "▲ High" : "▽ Low") + "</b> " + fmtT(p.t) + " (" + p.ft.toFixed(1) + " ft)").join(" &nbsp;·&nbsp; ");
      card3.append(el("div", "small", rows || "—"));
      if (fc.tides.range != null) card3.append(el("div", "muted small", "Range today: " + fc.tides.range.toFixed(1) + " ft. 20+ mi offshore, tidal flow fades — use the current factor above for the bottom bite; tide drives your pass/inlet timing."));
    } else card3.append(el("div", "statusmsg", fc.loading ? "Loading…" : "Tide data unavailable."));
    root.append(card3);

    /* --- offshore conditions --- */
    const card4 = el("div", "card");
    card4.append(el("h3", null, "Offshore conditions @ " + fp.label));
    if (marineDay && marineDay.length) {
      const wAvg = Conditions.avg(marineDay.map(p => p.waveFt)), wMax = Conditions.max(marineDay.map(p => p.waveFt));
      const per = Conditions.avg(marineDay.map(p => p.wavePeriodS));
      const sst = Conditions.avg(marineDay.map(p => p.sstF));
      const cur = Conditions.avg(marineDay.map(p => p.currentMph));
      const curD = marineDay[Math.floor(marineDay.length / 2)].currentDir;
      let wind = "—", gust = "", windD = null, press = "—";
      if (weatherDay && weatherDay.length) {
        wind = Math.round(Conditions.avg(weatherDay.map(p => p.windMph)));
        gust = Math.round(Conditions.max(weatherDay.map(p => p.gustMph)));
        windD = weatherDay[Math.floor(weatherDay.length / 2)].windDir;
        const ps = weatherDay.map(p => p.pressure);
        press = (ps[ps.length - 1] - ps[0]).toFixed(1);
      }
      const grid = el("div", "condGrid");
      grid.innerHTML =
        cond(wAvg.toFixed(1) + "–" + wMax.toFixed(1) + " ft", "Seas", per.toFixed(0) + "s period") +
        cond(wind + " mph", "Wind " + Conditions.compass(windD), "gusts " + gust) +
        cond(cur == null ? "—" : cur.toFixed(1) + " mph", "Current " + Conditions.dirArrow(curD), "at forecast point") +
        cond(sst == null ? "—" : sst.toFixed(0) + " °F", "Sea surface", "") +
        cond(press + " hPa", "Pressure Δ day", "") +
        cond(stormTxt(weatherDay), "Sky", "");
      card4.append(grid);
    } else card4.append(el("div", "statusmsg", fc.loading ? "Loading…" : "No marine forecast for this date (beyond ~7-day horizon). Astronomy, tides and seasons above still apply."));
    root.append(card4);

    /* --- what's open, with bag & size limits --- */
    const card5 = el("div", "card");
    card5.append(el("h3", null, "What you can keep — " + fmtD(d)));
    const shortDate = iso => new Date(iso + "T12:00").toLocaleDateString([], { month: "short", day: "numeric" });
    const closed = [];
    for (const sp of DATA_CORE.species) {
      const st = Scoring.isOpen(sp.id, d);
      const reg = (window.DATA_REGS && DATA_REGS.species[sp.id]) || null;
      if (st.open) {
        const bag = reg ? reg.bag.replace(/\s*\([^)]*\)/g, "") : "";
        const size = reg ? reg.size.replace(/\s*\([^)]*\)/g, "").replace("total length", "TL").replace("fork length", "FL") : "";
        card5.append(el("div", "small keepRow", "🟢 <b>" + sp.name + "</b> <span class=\"muted\">" +
          [bag, size].filter(Boolean).join(" · ") + "</span>"));
      } else {
        closed.push(sp.name + (st.next ? " (reopens " + shortDate(st.next) + ")" : ""));
      }
    }
    if (closed.length) card5.append(el("div", "small", "<br>🔴 <b>Closed:</b> " + closed.join(" · ")));
    card5.append(el("div", "muted small", "Aggregate rules, state-water differences & FWC links on the Seasons tab. Verify before you keep fish."));
    root.append(card5);

    /* --- top spots --- */
    const card6 = el("div", "card");
    card6.append(el("h3", null, "Top picks for " + fmtD(d) + (state.species !== "all" ? " — " + Scoring.speciesName(state.species) : "")));
    const ranked = Scoring.rankSpots(d, state.species, distRef(), 8);
    ranked.forEach((r, i) => {
      const t = r.spot || r.zone;
      const row = el("div", "topspot");
      row.innerHTML = '<div class="rank">' + (i + 1) + '</div><div><div class="tname">' + t.name + '</div>' +
        '<div class="treasons">' + r.reasons.slice(0, 3).join(" · ") + '</div></div>' +
        '<div class="tmeta"><div class="tscore">' + r.score + '</div>' + (r.distMi != null ? Math.round(r.distMi) + " mi" : "") + "</div>";
      row.onclick = () => flyTo(t, !!r.zone);
      card6.append(row);
    });
    root.append(card6);

    const pbtn = el("button", null, "🖨 Print trip sheet");
    pbtn.onclick = () => window.print();
    root.append(pbtn);
  }

  function cond(v, k, x) { return '<div class="cond"><div class="cv">' + v + '</div><div class="ck">' + k + '</div><div class="cx">' + x + "</div></div>"; }
  function stormTxt(weatherDay) {
    if (!weatherDay || !weatherDay.length) return "—";
    const codes = weatherDay.map(p => p.wmo);
    const worst = Math.max(...codes);
    return Conditions.WMO[worst] || "—";
  }

  function buildTimeline(d, sol, sun, tides) {
    const tl = el("div", "timeline");
    const day0 = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const pct = t => Math.max(0, Math.min(100, (t - day0) / 864000)) ;
    // night shading
    if (sun.sunrise) tl.append(seg("tl-night", 0, pct(sun.sunrise)));
    if (sun.sunset) tl.append(seg("tl-night", pct(sun.sunset), 100));
    sol.majors.forEach(m => tl.append(seg("tl-major", pct(m.start), pct(m.end))));
    sol.minors.forEach(m => tl.append(seg("tl-minor", pct(m.start), pct(m.end))));
    if (tides) tides.today.forEach(p => {
      const lbl = el("div", "tl-tide", (p.type === "H" ? "▲" : "▽") + fmtT(p.t));
      lbl.style.left = pct(p.t) + "%";
      tl.append(lbl);
    });
    const now = new Date();
    if (now >= day0 && now < new Date(+day0 + 86400000)) {
      const n = el("div", "tl-now"); n.style.left = pct(now) + "%"; tl.append(n);
    }
    const wrap = el("div");
    wrap.append(tl);
    wrap.append(el("div", "tl-hours", "<span>12a</span><span>6a</span><span>12p</span><span>6p</span><span>12a</span>"));
    return wrap;
  }
  function seg(cls, a, b) { const s = el("div", cls); s.style.left = a + "%"; s.style.width = Math.max(0.5, b - a) + "%"; return s; }

  function drawTideChart(cv, tides, d) {
    const ctx = cv.getContext("2d");
    const W = cv.width = cv.clientWidth * 2, H = cv.height = 180;
    const day0 = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const pts = [];
    for (let m = 0; m <= 1440; m += 15) {
      const t = new Date(+day0 + m * 60000);
      const c = Conditions.tideCurve(tides.all, t);
      if (c) pts.push({ x: m / 1440 * W, ft: c.ft });
    }
    if (!pts.length) return;
    const fts = pts.map(p => p.ft);
    const lo = Math.min(...fts) - 0.3, hi = Math.max(...fts) + 0.3;
    const y = ft => H - 14 - (ft - lo) / (hi - lo) * (H - 30);
    ctx.clearRect(0, 0, W, H);
    ctx.beginPath();
    pts.forEach((p, i) => i ? ctx.lineTo(p.x, y(p.ft)) : ctx.moveTo(p.x, y(p.ft)));
    ctx.strokeStyle = "#3ec6d0"; ctx.lineWidth = 3; ctx.stroke();
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fillStyle = "rgba(62,198,208,.12)"; ctx.fill();
    // MLLW zero line
    if (lo < 0 && hi > 0) {
      ctx.strokeStyle = "rgba(143,176,196,.4)"; ctx.lineWidth = 1; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(0, y(0)); ctx.lineTo(W, y(0)); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.fillStyle = "#8fb0c4"; ctx.font = "20px Segoe UI";
    tides.today.forEach(p => {
      const x = ((p.t - day0) / 86400000) * W;
      ctx.fillText(p.ft.toFixed(1), Math.min(W - 50, Math.max(4, x - 18)), y(p.ft) + (p.type === "H" ? -8 : 24));
    });
  }

  /* ================= SPOTS tab ================= */
  function renderImportCard(root) {
    const card = el("div", "card");
    card.append(el("h3", null, "My spots — import from Google Maps"));

    const row = el("div", "flexrow");
    const fileInp = el("input"); fileInp.type = "file"; fileInp.accept = ".kml,.kmz,.gpx,.csv,.txt"; fileInp.style.display = "none";
    const fileBtn = el("button", null, "📁 Import KML / KMZ / GPX / CSV");
    const pasteBtn = el("button", null, "📋 Paste coords");
    const count = el("span", "muted small", (window.USER_SPOTS.length ? USER_SPOTS.length + " saved" : ""));
    row.append(fileBtn, pasteBtn, el("div", "spacer"), count);
    if (window.USER_SPOTS.length) {
      const clr = el("button", null, "🗑 Clear");
      clr.onclick = () => { if (confirm("Remove all " + USER_SPOTS.length + " of your imported spots?")) { UserSpots.clearAll(); refreshAll(); toast("My spots cleared"); } };
      row.append(clr);
    }
    card.append(row, fileInp);

    const linkRow = el("div", "flexrow");
    const linkInp = el("input"); linkInp.type = "url"; linkInp.placeholder = "…or paste a Google My Maps share link"; linkInp.id = "myMapsLink";
    linkInp.style.flex = "1";
    const linkBtn = el("button", null, "⤓ Try link");
    linkRow.append(linkInp, linkBtn);
    card.append(linkRow);

    const pasteWrap = el("div"); pasteWrap.style.display = "none";
    const ta = el("textarea"); ta.id = "pasteCoords"; ta.rows = 4;
    ta.placeholder = "One spot per line — any of these work:\nMy gag ledge 85ft, 28.1234, -83.4567\n28 21.702 N, 082 42.600 W  Big mango wreck\nN28°15.480' W083°20.571'";
    const addBtn = el("button", "primary", "＋ Add these spots");
    pasteWrap.append(ta, addBtn);
    card.append(pasteWrap);

    const hint = el("div", "muted small", 'From <b>Google My Maps</b>: open your map → ⋮ menu (next to the title) → <b>Export to KML/KMZ</b> → Entire map → Download, then import the file here. Names like "AJ wreck 120ft" auto-tag species &amp; depth. Spots are saved in this browser and included in rankings, heatmap and GPX export.');
    card.append(hint);

    function handleResult(r) {
      if (!r) return;
      if (r.error === "cors") {
        toast("Google blocks reading map links directly — export the KML instead (steps below)");
        hint.innerHTML = "<b>Google wouldn't let the browser read that link.</b> Do this instead: open the map at mymaps.google.com → ⋮ menu next to the map title → <b>Export to KML/KMZ</b> → choose <i>Entire map</i> → Download → 📁 import the file here.";
        return;
      }
      if (r.error) { toast("Import failed: " + r.error); return; }
      if (!r.added && r.dup) {
        toast("Nothing new — all " + r.dup + " matching spots are already imported (search them by name)");
        return;
      }
      let msg = "Added " + r.added + " spot" + (r.added === 1 ? "" : "s");
      if (r.dup) msg += " · " + r.dup + " duplicate" + (r.dup === 1 ? "" : "s") + " skipped";
      if (r.outOfArea) msg += " · " + r.outOfArea + " outside the Gulf box";
      if (r.skippedShapes) msg += " · " + r.skippedShapes + " lines/areas ignored";
      if (r.badLines) msg += " · " + r.badLines + " lines not understood";
      toast(msg);
      if (r.added) refreshAll();
    }

    fileBtn.onclick = () => fileInp.click();
    fileInp.onchange = async () => { if (fileInp.files[0]) handleResult(await UserSpots.importFile(fileInp.files[0])); fileInp.value = ""; };
    pasteBtn.onclick = () => { pasteWrap.style.display = pasteWrap.style.display === "none" ? "block" : "none"; ta.focus(); };
    addBtn.onclick = () => { if (ta.value.trim()) { handleResult(UserSpots.importText(ta.value)); ta.value = ""; } };
    linkBtn.onclick = async () => {
      if (!linkInp.value.trim()) return;
      linkBtn.textContent = "…"; linkBtn.disabled = true;
      handleResult(await UserSpots.importMyMapsLink(linkInp.value.trim()));
      linkBtn.textContent = "⤓ Try link"; linkBtn.disabled = false;
    };
    root.append(card);
  }

  function renderMyChartsCard(root) {
    const card = el("div", "card");
    card.append(el("h3", null, "My charts — sonar/bathy overlays"));

    const row = el("div", "flexrow");
    const fileInp = el("input"); fileInp.type = "file"; fileInp.accept = ".kmz,.kml,image/*"; fileInp.style.display = "none";
    const fileBtn = el("button", null, "🗺 Import chart (KMZ / KML / image)");
    row.append(fileBtn, el("div", "spacer"));
    const charts = Charts.list();
    if (charts.length) {
      const op = el("input"); op.type = "range"; op.min = 20; op.max = 100; op.value = Math.round(Charts.opacity() * 100);
      op.title = "Chart opacity"; op.style.width = "110px";
      op.oninput = () => Charts.setOpacity(chartGroup, op.value / 100);
      row.append(el("span", "muted small", "opacity"), op);
    }
    card.append(row, fileInp);

    // Calibration inputs, revealed when a plain image is picked
    const cal = el("div"); cal.style.display = "none";
    cal.append(el("div", "muted small", "Type the chart image's two corners (any format — decimal or 28 06.000 N):"));
    const swInp = el("input"); swInp.placeholder = "SW (bottom-left), e.g. 27.90, -83.60"; swInp.style.width = "100%"; swInp.style.margin = "4px 0";
    const neInp = el("input"); neInp.placeholder = "NE (top-right), e.g. 28.20, -83.20"; neInp.style.width = "100%"; neInp.style.margin = "0 0 4px";
    const placeBtn = el("button", "primary", "📌 Place chart on map");
    cal.append(swInp, neInp, placeBtn);
    card.append(cal);

    let pendingImage = null;
    async function afterImport(r) {
      if (r.warnings && r.warnings.length) r.warnings.forEach(w => console.warn("[charts]", w));
      toast("Added " + r.added + " chart overlay" + (r.added === 1 ? "" : "s") +
        (r.warnings.length ? " · " + r.warnings.length + " warning(s) — see console" : ""));
      await Charts.render(chartGroup);
      renderTab();
    }
    fileBtn.onclick = () => fileInp.click();
    fileInp.onchange = async () => {
      const f = fileInp.files[0]; fileInp.value = "";
      if (!f) return;
      if (/\.(kmz|kml)$/i.test(f.name)) {
        try { await afterImport(await Charts.importChartFile(f)); }
        catch (e) { toast("Chart import failed: " + e.message); }
      } else {
        pendingImage = f;
        cal.style.display = "block";
        toast("Now give me the image's SW and NE corners");
      }
    };
    placeBtn.onclick = async () => {
      if (!pendingImage) { toast("Pick an image first"); return; }
      const sw = UserSpots.parsePoint(swInp.value), ne = UserSpots.parsePoint(neInp.value);
      if (!sw || !ne) { toast("Couldn't read one of the corners — try '27.90, -83.60'"); return; }
      try { await afterImport(await Charts.importImage(pendingImage, sw, ne)); pendingImage = null; }
      catch (e) { toast("Couldn't place chart: " + e.message); }
    };

    if (charts.length) {
      for (const c of charts) {
        const r = el("div", "spotrow");
        r.innerHTML = '<div class="sname"><div class="nm">🗺 ' + c.name + '</div><div class="sub">added ' + c.added + " · SW " +
          c.bounds[0][0].toFixed(3) + ", " + c.bounds[0][1].toFixed(3) + "</div></div>";
        const del = el("button", null, "✕");
        del.onclick = async (ev) => { ev.stopPropagation(); await Charts.removeChart(c.id); await Charts.render(chartGroup); renderTab(); toast("Chart removed"); };
        r.append(del);
        r.onclick = () => map.fitBounds(c.bounds, { padding: [30, 30] });
        card.append(r);
      }
    }

    card.append(el("div", "muted small",
      "Works: StrikeLines <b>Google Earth (KMZ)</b> charts, any KML GroundOverlay, or <b>any chart screenshot</b> (Garmin screen, StrikeLines preview) calibrated with two corners. " +
      "Garmin/Navionics/Quickdraw card files are proprietary — can't be read by a browser; screenshot them instead. " +
      "Also try the free <b>NOAA ENC chart</b> layer (layers control, top-right of map). Charts stay on this device."));
    root.append(card);
  }

  let alignCache = { key: "", rows: null };
  function renderMySpotsList(root) {
    if (!window.USER_SPOTS.length) return;
    const d = state.date;
    const L0 = launch();
    const card = el("div", "card");
    const head = el("div", "flexrow");
    head.append(el("h3", null, "My spots vs public intel (" + USER_SPOTS.length + ")"));
    const gpxMine = el("button", null, "⬇ My GPX");
    gpxMine.onclick = () => {
      Exporter.download("my-spots.gpx", Exporter.toGPX(window.USER_SPOTS), "application/gpx+xml");
      toast("GPX with " + USER_SPOTS.length + " of your spots downloaded");
    };
    head.append(el("div", "spacer"), gpxMine);
    card.append(head);
    card.append(el("div", "muted small",
      "Alignment = how strongly public zones, structure and recent reports agree with each of your numbers" +
      (state.species !== "all" ? " for " + Scoring.speciesName(state.species) : "") +
      ". Your spots never influence the recommendations or heatmap."));
    const cacheKey = d.toDateString() + "|" + state.species + "|" + state.launchId + "|" + window.USER_SPOTS.length;
    let all;
    if (alignCache.key === cacheKey) all = alignCache.rows;
    else {
      const ref = distRef();
      all = window.USER_SPOTS
        .map(s => ({ s, al: Scoring.alignment(s, d, state.species), dist: Scoring.haversineMi(ref.lat, ref.lon, s.lat, s.lon) }))
        .sort((a, b) => b.al.score - a.al.score);
      alignCache = { key: cacheKey, rows: all };
    }
    const rows = all.slice(0, 30);
    if (all.length > 30) card.append(el("div", "muted small", "Showing the top 30 of " + all.length + " by alignment — all are on the map."));
    for (const r of rows) {
      const cls = r.al.score >= 70 ? "open" : r.al.score >= 45 ? "gB" : "gC";
      const depth = r.s.depth_ft == null ? "" : (Array.isArray(r.s.depth_ft) ? r.s.depth_ft.join("–") : r.s.depth_ft) + " ft · ";
      const row = el("div", "spotrow");
      row.innerHTML = '<div class="pin t-user" style="flex-shrink:0">★</div>' +
        '<div class="sname"><div class="nm">' + r.s.name + ' <span class="badge ' + cls + '">' + r.al.score + " · " + r.al.label + "</span></div>" +
        '<div class="sub">' + depth + (r.al.reasons[0] || "") + "</div></div>" +
        '<div class="sdist">' + Math.round(r.dist) + " mi</div>";
      row.onclick = () => flyTo(r.s, false);
      card.append(row);
    }
    root.append(card);
  }

  function renderSpots(root) {
    renderImportCard(root);
    renderMyChartsCard(root);
    renderMySpotsList(root);
    const search = el("input"); search.id = "spotSearch"; search.placeholder = "Search public spots…"; search.type = "search";
    root.append(search);

    const bar = el("div", "flexrow");
    const sortSel = el("select", null,
      '<option value="score">Sort: today\'s score</option><option value="dist">Sort: distance</option><option value="depth">Sort: depth</option><option value="name">Sort: name</option>');
    sortSel.value = state.spotSort;
    sortSel.onchange = () => { state.spotSort = sortSel.value; renderTab(); };
    const gpxBtn = el("button", null, "⬇ GPX");
    const csvBtn = el("button", null, "⬇ CSV");
    gpxBtn.title = "Export filtered spots as GPX waypoints for your chartplotter";
    bar.append(sortSel, el("div", "spacer"), gpxBtn, csvBtn);
    root.append(bar);

    const listWrap = el("div");
    root.append(listWrap);

    function filtered() {
      const q = search.value.trim().toLowerCase();
      let rows = Scoring.rankSpots(state.date, state.species, distRef(), 0).filter(r => r.spot);
      if (state.species !== "all") rows = rows.filter(r => (r.spot.species[state.species] || 0) > 0);
      if (q) rows = rows.filter(r => (r.spot.name + " " + (r.spot.notes || "") + " " + r.spot.type).toLowerCase().includes(q));
      if (state.spotSort === "dist") rows.sort((a, b) => (a.distMi || 9e9) - (b.distMi || 9e9));
      if (state.spotSort === "depth") rows.sort((a, b) => (Scoring.avgDepth(a.spot) || 0) - (Scoring.avgDepth(b.spot) || 0));
      if (state.spotSort === "name") rows.sort((a, b) => a.spot.name.localeCompare(b.spot.name));
      return rows;
    }

    function renderList() {
      listWrap.innerHTML = "";
      const rows = filtered();
      // When searching, also surface matching MY spots so imports are findable here too
      const q = search.value.trim().toLowerCase().replace(/\s+/g, " ");
      if (q) {
        const mine = (window.USER_SPOTS || [])
          .filter(s => (s.name.toLowerCase().replace(/\s+/g, " ") + " " + (s.notes || "").toLowerCase()).includes(q))
          .slice(0, 20);
        if (mine.length) {
          listWrap.append(el("div", "muted small", "★ My spots matching “" + search.value.trim() + "” (" + mine.length + ")"));
          const L0 = distRef();
          for (const s of mine) {
            const row = el("div", "spotrow");
            const depth = s.depth_ft == null ? "" : (Array.isArray(s.depth_ft) ? s.depth_ft.join("–") : s.depth_ft) + " ft";
            row.innerHTML = '<div class="pin t-user" style="flex-shrink:0">★</div>' +
              '<div class="sname"><div class="nm">' + s.name + ' <span class="badge mine">MINE</span></div>' +
              '<div class="sub">' + [depth, s.lat.toFixed(4) + ", " + s.lon.toFixed(4)].filter(Boolean).join(" · ") + "</div></div>" +
              '<div class="sdist">' + Math.round(Scoring.haversineMi(L0.lat, L0.lon, s.lat, s.lon)) + " mi</div>";
            row.onclick = () => flyTo(s, false);
            listWrap.append(row);
          }
          listWrap.append(el("hr", "thin"));
        }
      }
      listWrap.append(el("div", "muted small", rows.length + " public spots (markers also on map)"));
      for (const r of rows) {
        const s = r.spot;
        const depth = s.depth_ft == null ? "?" : Array.isArray(s.depth_ft) ? s.depth_ft.join("–") : s.depth_ft;
        const row = el("div", "spotrow");
        row.innerHTML = '<div class="pin t-' + s.type + '" style="flex-shrink:0">' + pinLetter(s.type) + "</div>" +
          '<div class="sname"><div class="nm">' + s.name + (s.user ? ' <span class="badge mine">MINE</span>' : ' <span class="badge g' + s.grade + '">' + s.grade + "</span>") + "</div>" +
          '<div class="sub">' + typeLabel(s.type) + " · " + depth + " ft</div></div>" +
          '<div class="sdist">' + (r.distMi != null ? Math.round(r.distMi) + " mi" : "") + "<br><b>" + r.score + "</b></div>";
        row.onclick = () => flyTo(s, false);
        listWrap.append(row);
      }
    }
    search.oninput = renderList;
    gpxBtn.onclick = () => {
      const rows = filtered().map(r => r.spot);
      Exporter.download("gulf-bottom-intel.gpx", Exporter.toGPX(rows), "application/gpx+xml");
      toast("GPX with " + rows.length + " waypoints downloaded");
    };
    csvBtn.onclick = () => {
      const rows = filtered().map(r => r.spot);
      Exporter.download("gulf-bottom-intel.csv", Exporter.toCSV(rows), "text/csv");
      toast("CSV with " + rows.length + " spots downloaded");
    };
    renderList();
  }

  /* ================= SEASONS tab ================= */
  function renderSeasons(root) {
    const d = state.date;
    root.append(el("div", "muted small", "Status shown for <b>" + fmtD(d) + "</b>, private recreational angler, Gulf reef fish. Data compiled " + DATA_REGS.as_of + ". <b>Always verify before you keep fish.</b>"));
    const card = el("div", "card");
    const tbl = el("table", "regs");
    tbl.innerHTML = "<tr><th>Species</th><th>Today</th><th>2026 season</th><th>Bag / size</th></tr>";
    const ids = Object.keys(DATA_REGS.species);
    for (const id of ids) {
      const reg = DATA_REGS.species[id];
      const st = Scoring.isOpen(id, d);
      const tr = el("tr", st.open ? "" : "closedRow");
      const seasons = (reg.open && reg.open.length) ? reg.open.map(w => w.start.slice(5) + " → " + w.end.slice(5) + (w.note ? " (" + w.note + ")" : "")).join("<br>") : "Closed 2026";
      tr.innerHTML = "<td><b>" + reg.name + "</b>" + (reg.needs_verification ? ' <span class="badge gB" title="Could not fully verify for 2026">verify</span>' : "") + "</td>" +
        "<td>" + (st.open ? '<span class="badge open">OPEN</span>' : '<span class="badge closed">CLOSED</span>') + "</td>" +
        '<td class="small">' + seasons + "</td>" +
        '<td class="small">' + reg.bag + "<br>" + reg.size + (reg.agg ? '<br><span class="muted">' + reg.agg + "</span>" : "") +
        (reg.url ? '<br><a href="' + reg.url + '" target="_blank" rel="noopener">FWC/NOAA rule ↗</a>' : "") + "</td>";
      tbl.append(tr);
    }
    card.append(tbl);
    root.append(card);

    const g = el("div", "card");
    g.append(el("h3", null, "Gear & permits (federal Gulf reef fish)"));
    g.append(el("ul", "small", DATA_REGS.gear.map(x => "<li>" + x.rule + (x.url ? ' <a href="' + x.url + '" target="_blank" rel="noopener">↗</a>' : "") + "</li>").join("")));
    g.append(el("ul", "small", DATA_REGS.permits.map(x => "<li><b>" + x.name + "</b> — " + x.required_for + (x.url ? ' <a href="' + x.url + '" target="_blank" rel="noopener">↗</a>' : "") + "</li>").join("")));
    root.append(g);
  }

  /* ================= INTEL tab ================= */
  function renderIntel(root) {
    const card0 = el("div", "card");
    card0.append(el("h3", null, "How predictions work"));
    card0.append(el("div", "small",
      "Spot scores blend: <b>structure quality</b> (species ratings per spot), <b>coordinate confidence</b> " +
      '(<span class="badge gA">A</span> published numbers · <span class="badge gB">B</span> multi-source · <span class="badge gC">C</span> approximate area), ' +
      "<b>seasonal depth fit</b> for the month, <b>fresh reports</b> (3-week half-life decay), and <b>season legality</b>. " +
      "Day outlook blends seas vs your limit, wind, moon/solunar, tide swing, offshore current and pressure trend. " +
      "<b>Your imported spots are overlay-only</b> — they never feed the scores or heatmap; instead each gets an <i>alignment</i> readout showing how the public signal agrees with it."));
    root.append(card0);

    const regionReports = DATA_REPORTS.filter(r => (r.region || "tampa") === state.region);
    const card = el("div", "card");
    card.append(el("h3", null, "Recent intel feed — " + regionObj().name + " (" + regionReports.length + " reports)"));
    const sorted = [...regionReports].sort((a, b) => b.date.localeCompare(a.date));
    for (const r of sorted) {
      const div = el("div", "report");
      const speciesNames = (r.species || []).map(Scoring.speciesName).join(", ");
      div.innerHTML = '<div class="rhead"><span class="rdate">' + r.date + '</span><span class="rspecies">' + speciesNames + "</span>" +
        (r.quality ? ' <span class="badge type">' + r.quality + "</span>" : "") + "</div>" +
        '<div class="rdetail">' + [r.area, r.depth_ft ? r.depth_ft.join("–") + " ft" : null, r.port ? "out of " + r.port : null].filter(Boolean).join(" · ") + "</div>" +
        (r.details ? '<div class="rdetail">' + r.details + "</div>" : "") +
        (r.url ? '<div class="rdetail"><a href="' + r.url + '" target="_blank" rel="noopener">' + (r.source || "source") + " ↗</a></div>" : '<div class="rdetail muted">' + (r.source || "") + "</div>");
      card.append(div);
    }
    root.append(card);

    const watchList = (DATA_SCIENCE.watch || []).filter(w => (w.region || "tampa") === state.region);
    if (watchList.length) {
      const w = el("div", "card");
      w.append(el("h3", null, "Where fresh intel lives — " + regionObj().name));
      w.append(el("div", "muted small", "Charter report pages here are scrapeable — they're what Claude mines on a data refresh. The fleets' Facebook/Instagram feeds are login-walled: screenshot the good posts (depths, areas, chartplotter pics) and hand them to Claude — they become report entries."));
      for (const src of watchList) {
        w.append(el("div", "report", '<a href="' + src.url + '" target="_blank" rel="noopener"><b>' + src.name + '</b> ↗</a><div class="rdetail">' + src.what + "</div>"));
      }
      root.append(w);
    }

    const sci = el("div", "card");
    sci.append(el("h3", null, "Bite science cheat sheet"));
    for (const fct of DATA_SCIENCE.factors) {
      sci.append(el("div", "report", "<b>" + fct.title + "</b><div class='rdetail'>" + fct.detail +
        (fct.sources && fct.sources.length ? " " + fct.sources.map(s => '<a href="' + s + '" target="_blank" rel="noopener">↗</a>').join(" ") : "") + "</div>"));
    }
    root.append(sci);

    const dis = el("div", "card disclaimer",
      "<b>Read me:</b> This is a fishing **planning** tool built from public reports, published reef coordinates and free forecast models — not a navigation product and not a guarantee of fish. " +
      "Coordinates graded A are from official public lists; B/C are community-reported or approximate areas — always verify structure on your sounder before anchoring. " +
      "Forecasts (waves, current, SST) are model output (Open-Meteo) and NOAA tide predictions; conditions offshore can differ — check the NWS marine forecast and radar before departing, file a float plan, and verify seasons/limits with FWC on the day. " +
      "Data compiled: " + DATA_CORE.built + ". Ask Claude to refresh the data files to pull newer reports.");
    root.append(dis);
  }

  /* ================= shared ================= */
  function flyTo(target, isZone) {
    const lat = isZone ? target.center[0] : target.lat;
    const lon = isZone ? target.center[1] : target.lon;
    map.flyTo([lat, lon], Math.max(map.getZoom(), 10), { duration: 0.8 });
    setTimeout(() => {
      L.popup({ maxWidth: 320 }).setLatLng([lat, lon]).setContent(popupHtml(target, isZone)).openOn(map);
    }, 850);
  }

  function renderTab() {
    const root = $("#tabContent");
    root.innerHTML = "";
    if (state.tab === "today") renderToday(root);
    else if (state.tab === "trip") Trip.renderInto(root);
    else if (state.tab === "spots") renderSpots(root);
    else if (state.tab === "seasons") renderSeasons(root);
    else renderIntel(root);
    document.querySelectorAll("#tabs button").forEach(b => b.classList.toggle("on", b.dataset.tab === state.tab));
  }

  function refreshAll() {
    drawRings(); drawSpots(); drawZones(); drawRigs(); refreshHeat(); Trip.plot(); renderTab();
  }

  let toastTimer;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  function copyCoords(lat, lon) {
    const txt = lat.toFixed(6) + ", " + lon.toFixed(6) + "  (" + Exporter.ddm(lat, true) + "  " + Exporter.ddm(lon, false) + ")";
    const done = () => toast("Copied: " + lat.toFixed(5) + ", " + lon.toFixed(5));
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, () => fallbackCopy(txt, done));
    else fallbackCopy(txt, done);
  }
  function fallbackCopy(txt, done) {
    const ta = document.createElement("textarea");
    ta.value = txt; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { toast("Copy failed — long-press the coords"); }
    ta.remove();
  }

  function setForecastPoint(lat, lon, label) {
    state.forecastPoint = { lat, lon, label };
    if (fpMarker) fpMarker.remove();
    fpMarker = L.circleMarker([lat, lon], { radius: 9, color: "#f4a259", weight: 2, fill: false, dashArray: "3 4" })
      .bindTooltip("Forecast point: " + label).addTo(map);
    state.tab = "today";
    loadForecast();
    toast("Forecast point set: " + label);
  }

  /* ================= boot ================= */
  function populateLaunches() {
    const lsel = $("#launchSel");
    lsel.innerHTML = "";
    regionLaunches().forEach(l => {
      const o = document.createElement("option"); o.value = l.id; o.textContent = l.name; lsel.append(o);
    });
    const saved = localStorage.getItem("GBI_LAUNCH");
    state.launchId = regionLaunches().some(l => l.id === saved) ? saved : regionLaunches()[0].id;
    lsel.value = state.launchId;
  }

  function buildChips() {
    const chips = $("#speciesChips");
    chips.innerHTML = "";
    const mk = (id, name, color) => {
      const c = el("span", "chip" + (state.species === id ? " on" : ""), name);
      if (state.species === id) c.style.background = color || "var(--accent)";
      c.onclick = () => {
        state.species = id;
        chips.querySelectorAll(".chip").forEach(x => { x.classList.remove("on"); x.style.background = ""; });
        c.classList.add("on"); c.style.background = color || "var(--accent)";
        if (id === "bay_scallop" && !map.hasLayer(seagrassGroup)) {
          map.addLayer(seagrassGroup);
          Charts.seagrassRefresh(map, seagrassGroup);
          toast("🌿 Seagrass beds layer ON — dark green = continuous grass (toggle in layers control)");
        }
        refreshAll();
      };
      return c;
    };
    chips.append(mk("all", "All", "#3ec6d0"));
    regionObj().species.forEach(id => {
      const s = DATA_CORE.species.find(x => x.id === id);
      if (s) chips.append(mk(s.id, s.short || s.name, s.color));
    });
  }

  function switchRegion(id) {
    state.region = id;
    window.CURRENT_REGION = id;
    try { localStorage.setItem("GBI_REGION", id); } catch (e) { /* ignore */ }
    state.species = "all";
    state.forecastPoint = null; if (fpMarker) fpMarker.remove();
    alignCache = { key: "", rows: null };
    populateLaunches();
    buildChips();
    const R = regionObj();
    map.setView(R.center, R.zoom);
    refreshAll();
    loadForecast();
    toast("Region: " + R.name);
  }

  function buildHeader() {
    const rsel = $("#regionSel");
    DATA_CORE.regions.forEach(r => {
      const o = document.createElement("option"); o.value = r.id; o.textContent = r.name; rsel.append(o);
    });
    rsel.value = state.region;
    rsel.onchange = () => switchRegion(rsel.value);

    const lsel = $("#launchSel");
    populateLaunches();
    lsel.onchange = () => {
      state.launchId = lsel.value;
      try { localStorage.setItem("GBI_LAUNCH", lsel.value); } catch (e) { /* ignore */ }
      state.forecastPoint = null; if (fpMarker) fpMarker.remove();
      drawRings(); loadForecast(); renderTab();
    };

    const dinp = $("#dateInp");
    const today = new Date();
    dinp.value = today.toISOString().slice(0, 10);
    dinp.onchange = () => {
      const [y, m, dd] = dinp.value.split("-").map(Number);
      state.date = new Date(y, m - 1, dd, 12, 0, 0);
      refreshAll(); loadForecast();
    };

    const seas = $("#seasInp");
    seas.value = state.maxSeas;
    seas.onchange = () => { state.maxSeas = parseFloat(seas.value) || 3; renderTab(); };

    buildChips();

    $("#refreshBtn").onclick = () => {
      // Only the forecast cache ("gbi:https://…") — never GBI_MY_SPOTS
      Object.keys(localStorage).filter(k => k.startsWith("gbi:http")).forEach(k => localStorage.removeItem(k));
      loadForecast(); toast("Forecast cache cleared — refetching");
    };

    document.querySelectorAll("#tabs button").forEach(b => b.onclick = () => { state.tab = b.dataset.tab; renderTab(); });
  }

  function removeUserSpot(id) {
    UserSpots.remove(id);
    map.closePopup();
    refreshAll();
    toast("Spot removed");
  }

  function addTripStop(name, lat, lon) {
    Trip.add(name, lat, lon);
    state.tab = "trip";
    renderTab();
  }

  function boot() {
    // Each stage guarded: a hiccup in one (e.g. a transient storage/layout error on a cold
    // first paint) must not take down the whole UI — and must name itself in the console.
    const stage = (name, fn) => { try { fn(); } catch (e) { console.error("[boot] " + name + " failed:", e); } };
    state.date = new Date(); state.date.setHours(12, 0, 0, 0);
    window.CURRENT_REGION = state.region; // scoring reads this for region filtering
    stage("userspots", () => UserSpots.load());
    stage("map", () => initMap());
    stage("trip", () => Trip.init({
      getLaunch: launch,
      getDate: () => state.date,
      layer: tripLayer,
      toast,
      refreshUI: () => { if (state.tab === "trip") renderTab(); }
    }));
    stage("header", () => buildHeader());
    stage("render", () => refreshAll());
    stage("forecast", () => loadForecast());
    stage("charts", () => Charts.render(chartGroup).then(recs => { if (recs.length && state.tab === "spots") renderTab(); }));
    App.map = map; App.chartGroup = chartGroup; App.encGroup = encGroup;
  }

  window.App = { copyCoords, setForecastPoint, removeUserSpot, addTripStop,
    biteWindowsFor: date => (state.biteWindows && state.biteWindows.key === date.toDateString()) ? state.biteWindows.windows : null };
  document.addEventListener("DOMContentLoaded", boot);
})();
