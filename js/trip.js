/* Trip planner: ordered stops, boat profile, condition-aware ETAs & fuel.
   All statute miles & mph. Speed model per leg (at the leg midpoint, ETA hour):
     - base = cruise mph
     - seas: -8% per ft of wave height above 1.5 ft (capped -35%)
     - headwind: -0.25% per mph of headwind component (capped -12%)
     - current: +/- the along-track component (mph), straight add
   Fuel: gph-at-cruise = cruise mph / MPG; leg fuel = hours x that gph
   (so chop that slows you also burns more per mile) + idle gph while fishing. */
window.Trip = (function () {
  "use strict";

  let ctx = null; // { getLaunch, getDate, layer, toast, refreshUI }

  /* ---------- persisted state ---------- */
  function loadJson(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v || fallback; } catch (e) { return fallback; }
  }
  function saveJson(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* ignore */ } }

  let stops = loadJson("GBI_TRIP", []);
  const savedBoat = loadJson("GBI_BOAT", {});
  let boat = Object.assign({
    cruiseMph: 35, mpg: 1.5, idleGph: 1.0, tankGal: 150,
    reservePct: 20, fishMin: 45, departHM: "06:00"
  }, savedBoat);
  // migrate a legacy knots/gph profile to mph/MPG
  if (savedBoat.cruiseKn != null && savedBoat.cruiseMph == null) boat.cruiseMph = Math.round(savedBoat.cruiseKn * 11.5078) / 10;
  if (savedBoat.gph != null && savedBoat.mpg == null) boat.mpg = Math.round(boat.cruiseMph / savedBoat.gph * 100) / 100;
  delete boat.cruiseKn; delete boat.gph;

  function saveAll() { saveJson("GBI_TRIP", stops); saveJson("GBI_BOAT", boat); }

  /* ---------- route math ---------- */
  function bearing(a, b) {
    const r = Math.PI / 180;
    const dLon = (b.lon - a.lon) * r;
    const y = Math.sin(dLon) * Math.cos(b.lat * r);
    const x = Math.cos(a.lat * r) * Math.sin(b.lat * r) - Math.sin(a.lat * r) * Math.cos(b.lat * r) * Math.cos(dLon);
    return (Math.atan2(y, x) / r + 360) % 360;
  }
  function hourAt(series, when) {
    if (!series || !series.length) return null;
    let best = null, bd = Infinity;
    for (const p of series) {
      const d = Math.abs(p.t - when);
      if (d < bd) { bd = d; best = p; }
    }
    return bd <= 2 * 3600e3 ? best : null; // within 2h of a forecast hour, else "no forecast"
  }

  async function computePlan() {
    const L0 = ctx.getLaunch();
    const date = ctx.getDate();
    const [hh, mm] = (boat.departHM || "06:00").split(":").map(Number);
    let t = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hh || 6, mm || 0, 0);
    const departT = t;

    const pts = [{ name: L0.name.split(" (")[0] + " (launch)", lat: L0.lat, lon: L0.lon }]
      .concat(stops)
      .concat([{ name: L0.name.split(" (")[0] + " (return)", lat: L0.lat, lon: L0.lon }]);

    const legs = [];
    let runHrs = 0, fuel = 0, maxWave = null;

    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const distMi = Scoring.haversineMi(a.lat, a.lon, b.lat, b.lon);
      const course = bearing(a, b);
      const mid = { lat: (a.lat + b.lat) / 2, lon: (a.lon + b.lon) / 2 };

      let sog = boat.cruiseMph;
      const notes = [];
      let wav = null;
      if (distMi > 0.05) {
        try {
          const [mar, wx] = await Promise.all([Conditions.marine(mid.lat, mid.lon), Conditions.weather(mid.lat, mid.lon)]);
          const mh = hourAt(mar, t), wh = hourAt(wx, t);
          const r = Math.PI / 180;
          if (mh && mh.waveFt != null) {
            wav = mh.waveFt;
            if (maxWave == null || wav > maxWave) maxWave = wav;
            if (wav > 1.5) {
              const pen = Math.min(0.35, (wav - 1.5) * 0.08);
              sog *= (1 - pen);
              notes.push(wav.toFixed(1) + " ft seas −" + Math.round(pen * 100) + "%");
            }
          }
          if (wh && wh.windMph != null) {
            const headMph = wh.windMph * Math.cos((wh.windDir - course) * r); // + = on the nose
            if (headMph > 4) { sog *= (1 - Math.min(0.12, headMph * 0.0025)); notes.push(Math.round(headMph) + " mph headwind"); }
          }
          if (mh && mh.currentMph != null && mh.currentMph > 0.12) {
            const along = mh.currentMph * Math.cos((mh.currentDir - course) * r); // current dir = flowing toward
            sog += along;
            notes.push((along >= 0 ? "+" : "") + along.toFixed(1) + " mph current");
          }
        } catch (e) { notes.push("no forecast — cruise speed used"); }
      }
      sog = Math.max(6, sog);
      const hrs = distMi / sog;
      const legFuel = hrs * (boat.cruiseMph / boat.mpg); // gph at cruise; slow legs burn more per mile
      const depart = new Date(t);
      t = new Date(+t + hrs * 3600e3);
      const leg = { from: a, to: b, distMi, course, sog, hrs, fuel: legFuel, depart, arrive: new Date(t), wav, notes };
      runHrs += hrs; fuel += legFuel;
      legs.push(leg);
      if (i < pts.length - 2) { // fish this stop, then continue
        leg.fishStart = new Date(t);
        t = new Date(+t + boat.fishMin * 60e3);
        leg.fishEnd = new Date(t);
        fuel += boat.idleGph * (boat.fishMin / 60);
      }
    }

    const fishHrs = stops.length * boat.fishMin / 60;
    const usable = boat.tankGal * (1 - boat.reservePct / 100);
    const sun = Astro.sunTimes(date, L0.lat, L0.lon);

    // tide stage at depart & return (coastal station — matters at the pass/ramp)
    let tideDepart = null, tideReturn = null;
    try {
      const tides = await Conditions.tides(L0.tideStation, date);
      tideDepart = Conditions.tideCurve(tides.all, departT);
      tideReturn = Conditions.tideCurve(tides.all, t);
    } catch (e) { /* tides optional */ }

    return {
      legs, totalMi: legs.reduce((s, l) => s + l.distMi, 0),
      runHrs, fishHrs, depart: departT, returnEta: t, fuel, usable,
      fuelOk: fuel <= usable, maxWave, sunset: sun.sunset, afterDark: sun.sunset && t > sun.sunset,
      tideDepart, tideReturn
    };
  }

  /* ---------- map plot ---------- */
  function plot() {
    if (!ctx || !ctx.layer) return;
    ctx.layer.clearLayers();
    if (!stops.length) return;
    const L0 = ctx.getLaunch();
    const pts = [[L0.lat, L0.lon]].concat(stops.map(s => [s.lat, s.lon]));
    L.polyline(pts, { color: "#ffffff", weight: 2.5, opacity: 0.85 }).addTo(ctx.layer);
    L.polyline([pts[pts.length - 1], pts[0]], { color: "#ffffff", weight: 2, opacity: 0.55, dashArray: "7 8" }).addTo(ctx.layer); // return leg
    stops.forEach((s, i) => {
      L.marker([s.lat, s.lon], {
        icon: L.divIcon({ className: "trip-badge", html: String(i + 1), iconSize: null }),
        interactive: false, keyboard: false
      }).addTo(ctx.layer);
    });
  }

  /* ---------- stop management ---------- */
  function add(name, lat, lon) {
    stops.push({ name: String(name).slice(0, 60), lat: +lat, lon: +lon });
    saveAll(); plot();
    ctx.toast("Stop " + stops.length + ": " + name);
    ctx.refreshUI();
  }
  function removeAt(i) { stops.splice(i, 1); saveAll(); plot(); ctx.refreshUI(); }
  function move(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= stops.length) return;
    [stops[i], stops[j]] = [stops[j], stops[i]];
    saveAll(); plot(); ctx.refreshUI();
  }
  function clearAll() { stops = []; saveAll(); plot(); ctx.refreshUI(); }

  /* ---------- UI ---------- */
  const elx = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const fmtT = d => d ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).replace(" ", "").toLowerCase() : "—";
  const fmtH = h => { const H = Math.floor(h), M = Math.round((h - H) * 60); return (H ? H + "h " : "") + M + "m"; };

  let renderSeq = 0;
  function renderInto(root) {
    /* boat profile */
    const bc = elx("div", "card");
    bc.append(elx("h3", null, "Boat profile"));
    const grid = elx("div", "boatGrid");
    const fields = [
      ["cruiseMph", "Cruise (mph)", 5, 80, 0.5], ["mpg", "MPG @ cruise", 0.3, 15, 0.05],
      ["idleGph", "Idle/fish (gal/hr)", 0, 10, 0.1], ["tankGal", "Tank (gal)", 10, 1000, 5],
      ["reservePct", "Reserve (%)", 0, 50, 5], ["fishMin", "Min per stop", 5, 240, 5]
    ];
    for (const [key, label, min, max, step] of fields) {
      const w = elx("label", "bf", label);
      const inp = elx("input"); inp.type = "number"; inp.min = min; inp.max = max; inp.step = step; inp.value = boat[key];
      inp.onchange = () => { boat[key] = parseFloat(inp.value) || boat[key]; saveAll(); ctx.refreshUI(); };
      w.append(inp); grid.append(w);
    }
    const dep = elx("label", "bf", "Depart");
    const depInp = elx("input"); depInp.type = "time"; depInp.value = boat.departHM;
    depInp.onchange = () => { boat.departHM = depInp.value || "06:00"; saveAll(); ctx.refreshUI(); };
    dep.append(depInp); grid.append(dep);
    bc.append(grid);
    const gphCruise = boat.cruiseMph / boat.mpg;
    const usableGal = boat.tankGal * (1 - boat.reservePct / 100);
    bc.append(elx("div", "muted small", "≈ " + gphCruise.toFixed(1) + " gal/hr at cruise · usable " + Math.round(usableGal) + " gal (" + boat.reservePct + "% reserve) ≈ " + Math.round(usableGal * boat.mpg) + " mi of range"));
    root.append(bc);

    /* stops */
    const sc = elx("div", "card");
    const head = elx("div", "flexrow");
    head.append(elx("h3", null, "Stops (" + stops.length + ")"));
    if (stops.length) {
      const clr = elx("button", null, "🗑 Clear");
      clr.onclick = () => { if (confirm("Clear all " + stops.length + " trip stops?")) clearAll(); };
      head.append(elx("div", "spacer"), clr);
    }
    sc.append(head);
    if (!stops.length) {
      sc.append(elx("div", "muted small", "No stops yet. Click any spot on the map (or right-click open water for a dropped pin) and hit <b>➕ Add to trip</b>. Stops run in order; the trip starts and ends at your launch."));
    } else {
      stops.forEach((s, i) => {
        const row = elx("div", "spotrow");
        row.innerHTML = '<div class="rank" style="width:22px;font-weight:700;color:var(--accent)">' + (i + 1) + "</div>" +
          '<div class="sname"><div class="nm">' + s.name + '</div><div class="sub">' + s.lat.toFixed(4) + ", " + s.lon.toFixed(4) + "</div></div>";
        const up = elx("button", null, "↑"), dn = elx("button", null, "↓"), rm = elx("button", null, "✕");
        up.onclick = e => { e.stopPropagation(); move(i, -1); };
        dn.onclick = e => { e.stopPropagation(); move(i, 1); };
        rm.onclick = e => { e.stopPropagation(); removeAt(i); };
        const btns = elx("div", "flexrow"); btns.style.gap = "3px"; btns.append(up, dn, rm);
        row.append(btns);
        sc.append(row);
      });
    }
    root.append(sc);

    /* computed plan */
    if (stops.length) {
      const pc = elx("div", "card");
      pc.append(elx("h3", null, "Trip plan"));
      pc.append(elx("div", "statusmsg", "Computing with forecast…"));
      root.append(pc);
      const seq = ++renderSeq;
      computePlan().then(plan => {
        if (seq !== renderSeq || !pc.isConnected) return;
        pc.innerHTML = "";
        pc.append(elx("h3", null, "Trip plan — " + ctx.getDate().toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })));

        const tbl = elx("div");
        plan.legs.forEach((l, i) => {
          const isReturn = i === plan.legs.length - 1;
          tbl.append(elx("div", "legrow",
            "<b>" + (isReturn ? "⌂ Return" : "Leg " + (i + 1)) + "</b> → " + l.to.name +
            '<div class="sub">' + l.distMi.toFixed(1) + " mi · crs " + Math.round(l.course) + "° · " +
            l.sog.toFixed(1) + " mph eff · " + fmtH(l.hrs) + " · " + l.fuel.toFixed(1) + " gal" +
            (l.notes.length ? " · " + l.notes.join(", ") : "") + "</div>" +
            '<div class="sub"><b>Arrive ' + fmtT(l.arrive) + "</b>" +
            (l.fishStart ? " · fish until " + fmtT(l.fishEnd) : "") + "</div>"));
        });
        pc.append(tbl);

        const fuelCls = plan.fuelOk ? "good" : "bad";
        const totals = elx("div", "tripTotals",
          tot(plan.totalMi.toFixed(0) + " mi", "total distance") +
          tot(fmtH(plan.runHrs), "running") +
          tot(fmtH(plan.fishHrs), "fishing") +
          tot(fmtT(plan.returnEta), "back at dock" + (plan.afterDark ? " ⚠" : "")) +
          tot('<span style="color:var(--' + fuelCls + ')">' + plan.fuel.toFixed(0) + " gal</span>", "of " + Math.round(plan.usable) + " usable"));
        pc.append(totals);

        const warn = [];
        if (!plan.fuelOk) warn.push("⛽ Over your usable fuel (" + plan.fuel.toFixed(0) + " > " + Math.round(plan.usable) + " gal incl. " + boat.reservePct + "% reserve) — trim stops or slow down.");
        if (plan.afterDark) warn.push("🌙 Return " + fmtT(plan.returnEta) + " is after sunset (" + fmtT(plan.sunset) + ") — running home in the dark.");
        if (plan.maxWave != null) warn.push("🌊 Max seas en route ~" + plan.maxWave.toFixed(1) + " ft.");
        if (plan.tideDepart) warn.push("🌗 Tide at depart: " + plan.tideDepart.ft.toFixed(1) + " ft " + plan.tideDepart.dir + (plan.tideReturn ? " · at return: " + plan.tideReturn.ft.toFixed(1) + " ft " + plan.tideReturn.dir : "") + " (" + ctx.getLaunch().tideStationName + ")");
        if (warn.length) pc.append(elx("div", "small", warn.map(w => "<div style='margin:3px 0'>" + w + "</div>").join("")));

        // Suggest a departure that puts you on stop 1 for the day's top bite window
        const wins = (window.App && App.biteWindowsFor) ? App.biteWindowsFor(ctx.getDate()) : null;
        if (wins && wins.length && plan.legs.length > 1) {
          const prime = wins[0];
          const dep = new Date(+prime.start - plan.legs[0].hrs * 3600e3);
          if (dep.getHours() >= 3 && dep.getHours() <= 18) {
            pc.append(elx("div", "small", "🎯 " + prime.label + " bite <b>" + fmtT(prime.start) + "–" + fmtT(prime.end) + "</b>" +
              (prime.reasons.length ? " (" + prime.reasons.slice(0, 3).join(" + ") + ")" : "") +
              " — to fish it at " + plan.legs[0].to.name + ", leave about <b>" + fmtT(dep) + "</b>."));
          }
        }
        const note = elx("div", "muted small", "Speeds adjust for forecast seas, headwind and along-track current at each leg's midpoint for that hour. Estimates — leave margin.");
        pc.append(note);
      }).catch(() => {
        if (pc.isConnected) pc.append(elx("div", "statusmsg", "Couldn't compute — forecast unreachable. Distances only."));
      });
    }
  }
  function tot(v, k) { return '<div class="cond"><div class="cv">' + v + '</div><div class="ck">' + k + "</div></div>"; }

  return { init: c => { ctx = c; plot(); }, add, removeAt, move, clearAll, plot, renderInto, computePlan, count: () => stops.length };
})();
