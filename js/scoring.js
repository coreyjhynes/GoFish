/* Scoring engine: day quality + per-spot ranking + heatmap weights.
   Transparent: every score returns its factor breakdown. */
(function () {
  "use strict";

  const MI = 3958.7613; // earth radius, statute miles

  // Region gate: spots/zones carry region ('tampa' when absent); the app sets
  // window.CURRENT_REGION on region switch.
  function inRegion(x) { return (x.region || "tampa") === (window.CURRENT_REGION || "tampa"); }

  function haversineMi(lat1, lon1, lat2, lon2) {
    const r = Math.PI / 180;
    const dLat = (lat2 - lat1) * r, dLon = (lon2 - lon1) * r;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dLon / 2) ** 2;
    return 2 * MI * Math.asin(Math.sqrt(a));
  }

  /* ---------- regulations ---------- */
  function isOpen(speciesId, date) {
    const reg = (window.DATA_REGS && DATA_REGS.species[speciesId]) || null;
    if (!reg) return { open: true, known: false, note: "No regulation data" };
    if (!reg.open || !reg.open.length) return { open: false, known: true, note: "Closed all of 2026", reg };
    const ds = date.toISOString().slice(0, 10);
    for (const w of reg.open) {
      if (ds >= w.start && ds <= w.end) {
        return { open: true, known: true, until: w.end, note: w.note || "", reg };
      }
    }
    const future = reg.open.filter(w => w.start > ds).sort((a, b) => a.start < b.start ? -1 : 1);
    return { open: false, known: true, next: future.length ? future[0].start : null, reg };
  }

  // Shallow-water grouper closure: Feb 1 – Mar 31 seaward of 20 fathoms (~120 ft).
  function swgClosed(speciesId, date, depthFt) {
    const reg = (window.DATA_REGS && DATA_REGS.species[speciesId]) || null;
    if (!reg || !reg.swg_closure || depthFt == null || depthFt <= 120) return false;
    const md = String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
    return md >= "02-01" && md <= "03-31";
  }

  /* ---------- seasonal depth fit ---------- */
  // Returns 0.6..1.2: how well this spot's depth matches where the species
  // should be in this month (from DATA_SCIENCE.seasonal_depth).
  function depthFit(speciesId, month, depthFt) {
    if (depthFt == null || !window.DATA_SCIENCE) return 1.0;
    const rows = DATA_SCIENCE.seasonal_depth.filter(r => r.species === speciesId &&
      monthIn(month, r.months));
    if (!rows.length) return 1.0;
    let best = 0.6;
    for (const r of rows) {
      const [lo, hi] = r.depth_ft;
      if (depthFt >= lo && depthFt <= hi) best = Math.max(best, 1.2);
      else {
        const dist = depthFt < lo ? lo - depthFt : depthFt - hi;
        if (dist <= 20) best = Math.max(best, 1.0);
        else if (dist <= 40) best = Math.max(best, 0.8);
      }
    }
    return best;
  }
  function monthIn(m, range) { // range [start,end] inclusive, wraps (e.g., [11,2])
    const [a, b] = range;
    return a <= b ? (m >= a && m <= b) : (m >= a || m <= b);
  }

  /* ---------- recent-report boost ---------- */
  // Reports tie to spots by curated spotIds/zoneIds, or by proximity when they carry coords.
  function reportBoost(target, date, isZone) {
    if (!window.DATA_REPORTS) return { boost: 0, hits: [] };
    const hits = [];
    for (const rep of DATA_REPORTS) {
      let match = false;
      if (!isZone && rep.spotIds && rep.spotIds.includes(target.id)) match = true;
      if (isZone && rep.zoneIds && rep.zoneIds.includes(target.id)) match = true;
      if (!match && rep.lat != null && !isZone &&
          haversineMi(rep.lat, rep.lon, target.lat, target.lon) <= 10) match = true;
      if (!match && rep.lat != null && isZone && target.center &&
          haversineMi(rep.lat, rep.lon, target.center[0], target.center[1]) <= (target.radius_mi || 10) + 5) match = true;
      if (match) hits.push(rep);
    }
    let boost = 0;
    for (const rep of hits) {
      const days = Math.max(0, (date - new Date(rep.date + "T12:00")) / 86400000);
      const q = rep.quality === "limits" ? 1 : rep.quality === "good" ? 0.8 : rep.quality === "fair" ? 0.5 : 0.25;
      boost += 18 * q * Math.exp(-days / 30); // ~half-life 3 weeks
    }
    return { boost: Math.min(22, boost), hits };
  }

  /* ---------- per-spot score ---------- */
  const GRADE_PTS = { A: 12, B: 6, C: 0 };

  function targetRating(target, speciesFilter, date) {
    // Returns {rating 0-5, species, legalNote} honoring season status.
    const month = date.getMonth() + 1;
    const entries = Object.entries(target.species || {});
    if (!entries.length) return { rating: 2, species: null, closedPenalty: 1 };
    const d = avgDepth(target);
    // A target with its own season window (e.g., a scallop zone) overrides the statewide species season
    const openHere = sp => {
      if (target.season) {
        const ds = date.toISOString().slice(0, 10);
        return ds >= target.season.start && ds <= target.season.end;
      }
      return isOpen(sp, date).open && !swgClosed(sp, date, d);
    };
    if (speciesFilter !== "all") {
      const r = target.species[speciesFilter] || 0;
      const open = openHere(speciesFilter);
      return { rating: r, species: speciesFilter, closedPenalty: open ? 1 : 0.5, closed: !open };
    }
    // 'all': best open species first; closed species count at 35%
    let best = { val: 0, rating: 0, species: null, closedPenalty: 1 };
    for (const [sp, r] of entries) {
      const open = openHere(sp);
      const fit = depthFit(sp, month, d);
      const val = r * (open ? 1 : 0.35) * fit;
      if (val > best.val) best = { val, rating: r, species: sp, closedPenalty: open ? 1 : 0.35, closed: !open };
    }
    return best;
  }
  function avgDepth(t) {
    if (typeof t.depth_ft === "number") return t.depth_ft;
    if (Array.isArray(t.depth_ft)) return (t.depth_ft[0] + t.depth_ft[1]) / 2;
    return null;
  }

  function scoreTarget(target, date, speciesFilter, isZone) {
    const month = date.getMonth() + 1;
    const reasons = [];
    const tr = targetRating(target, speciesFilter, date);
    const sp = tr.species;
    const fit = sp ? depthFit(sp, month, avgDepth(target)) : 1.0;
    const rb = reportBoost(target, date, isZone);

    let s = 18;                                   // base
    s += GRADE_PTS[target.grade] || 0;            // coordinate confidence
    s += tr.rating * 8 * tr.closedPenalty;        // species quality at this structure
    s = s * (0.75 + 0.35 * fit);                  // seasonal depth fit (x0.96..x1.17)
    s += rb.boost;                                // fresh intel

    // Summer full-moon mangrove bonus
    if (sp === "mangrove_snapper" && month >= 6 && month <= 8) {
      const syz = Astro.daysToSyzygy(date);
      if (syz.which === "full" && syz.days <= 3.5) { s += 8; reasons.push("Full-moon mangrove spawn window"); }
    }

    if (tr.closed && sp) reasons.push(speciesName(sp) + " CLOSED" + (sp === "bay_scallop" ? " here — season/zone" : " — catch & release"));
    else if (sp) reasons.push("Strong for " + speciesName(sp));
    if (fit >= 1.15) reasons.push("Prime depth for the season");
    if (rb.hits.length) {
      const latest = rb.hits.map(h => h.date).sort().slice(-1)[0];
      reasons.push("Recent report " + latest + " (" + rb.hits.length + " this season)");
    }
    if (target.grade === "A") reasons.push("Published coordinates");
    if (target.grade === "C") reasons.push("Approximate area — search with sonar");

    return { score: Math.round(Math.max(5, Math.min(100, s))), reasons, reports: rb.hits, species: sp, closed: !!tr.closed };
  }

  function speciesName(id) {
    const s = (window.DATA_CORE ? DATA_CORE.species : []).find(x => x.id === id);
    return s ? s.name : id;
  }

  // NOTE: recommendations and heat are built from PUBLIC research data only.
  // The user's imported spots are a visual overlay — see alignment() below.
  function rankSpots(date, speciesFilter, launch, n) {
    const out = [];
    for (const s of (window.DATA_SPOTS || [])) {
      if (!inRegion(s)) continue;
      const r = scoreTarget(s, date, speciesFilter, false);
      out.push({ spot: s, ...r, distMi: launch ? haversineMi(launch.lat, launch.lon, s.lat, s.lon) : null });
    }
    for (const z of (window.DATA_ZONES || [])) {
      if (!inRegion(z)) continue;
      if (z.avoid || z.kind === "pipeline") continue; // no-take zones & reference lines are never recommendations
      const r = scoreTarget(z, date, speciesFilter, true);
      out.push({ zone: z, ...r, distMi: launch && z.center ? haversineMi(launch.lat, launch.lon, z.center[0], z.center[1]) : null });
    }
    // Soft range penalty: beyond ~85 mi from the chosen launch is a stretch trip
    for (const r of out) {
      if (r.distMi != null && r.distMi > 85) {
        r.score = Math.round(r.score * Math.max(0.6, 1 - (r.distMi - 85) / 120));
        r.reasons.push("⚠ " + Math.round(r.distMi) + " mi run — stretch trip");
      }
    }
    out.sort((a, b) => b.score - a.score);
    return n ? out.slice(0, n) : out;
  }

  /* ---------- day score ---------- */
  function dayScore(opts) {
    // opts: {date, maxSeasFt, tideRange, marineDay[], weatherDay[], astroRating}
    const f = [];
    let total = 0, totalMax = 0;

    function factor(name, pts, maxPts, detail) {
      f.push({ name, pts: Math.round(pts * 10) / 10, max: maxPts, detail });
      total += pts; totalMax += maxPts;
    }

    // Seas (gate + 25)
    let gonogo = "go";
    if (opts.marineDay && opts.marineDay.length) {
      const wMax = Conditions.max(opts.marineDay.map(p => p.waveFt));
      const m = opts.maxSeasFt;
      let pts = 0, note = wMax.toFixed(1) + " ft max";
      if (wMax <= m * 0.6) { pts = 25; note += " — smooth"; }
      else if (wMax <= m * 0.85) { pts = 20; note += " — comfortable"; }
      else if (wMax <= m) { pts = 14; note += " — near your limit"; gonogo = "caution"; }
      else if (wMax <= m * 1.35) { pts = 5; note += " — sporty, over limit"; gonogo = "caution"; }
      else { pts = 0; note += " — stay home"; gonogo = "nogo"; }
      factor("Seas", pts, 25, note);
    } else factor("Seas", 0, 0, "no forecast yet (>7 days out)");

    // Wind (15) — mph
    if (opts.weatherDay && opts.weatherDay.length) {
      const w = Conditions.avg(opts.weatherDay.map(p => p.windMph));
      const g = Conditions.max(opts.weatherDay.map(p => p.gustMph));
      let pts = w < 9 ? 15 : w < 14 ? 11 : w < 17 ? 7 : w < 23 ? 3 : 0;
      factor("Wind", pts, 15, Math.round(w) + " mph avg, gusts " + Math.round(g));
      if (g > 29 && gonogo === "go") gonogo = "caution";
    } else factor("Wind", 0, 0, "no forecast yet");

    // Solunar (15)
    if (opts.astroRating) {
      const a = opts.astroRating;
      const pts = (a.rating / 4) * 15;
      factor("Moon/solunar", pts, 15, a.rating >= 3 ?
        ("near " + a.nearest + " moon (" + a.days.toFixed(1) + "d)") :
        ("mid-cycle, " + a.days.toFixed(1) + "d from " + a.nearest));
    }

    // Tide movement (15)
    if (opts.tideRange != null) {
      const r = opts.tideRange;
      const pts = r >= 2.8 ? 15 : r >= 2.2 ? 12 : r >= 1.6 ? 8 : 4;
      factor("Tide swing", pts, 15, r.toFixed(1) + " ft range at coast" + (r >= 2.8 ? " — strong water movement" : r < 1.6 ? " — weak movement" : ""));
    } else factor("Tide swing", 0, 0, "station unavailable");

    // Offshore current (15) — mph
    if (opts.marineDay && opts.marineDay.length) {
      const c = Conditions.avg(opts.marineDay.map(p => p.currentMph));
      let pts, note = (c == null ? "—" : c.toFixed(1)) + " mph avg at spot";
      if (c == null) { pts = 7; }
      else if (c >= 0.35 && c <= 1.15) { pts = 15; note += " — ideal for bottom fishing"; }
      else if (c > 1.15 && c <= 1.85) { pts = 9; note += " — heavy lead"; }
      else if (c >= 0.17) { pts = 8; note += " — light"; }
      else { pts = 4; note += " — dead current, tough bite"; }
      factor("Current", pts, 15, note);
    } else factor("Current", 0, 0, "no forecast yet");

    // Pressure trend (10)
    if (opts.weatherDay && opts.weatherDay.length >= 6) {
      const ps = opts.weatherDay.map(p => p.pressure).filter(x => x != null);
      const slope = ps[ps.length - 1] - ps[0];
      let pts, note;
      if (slope <= -1 && slope >= -5) { pts = 10; note = "falling " + slope.toFixed(1) + " hPa — pre-front feed"; }
      else if (Math.abs(slope) < 1) { pts = 7; note = "steady"; }
      else if (slope < -5) { pts = 5; note = "crashing — storm nearby"; }
      else { pts = 4; note = "rising " + slope.toFixed(1) + " hPa — post-front"; }
      factor("Pressure", pts, 10, note);
    } else factor("Pressure", 0, 0, "no forecast yet");

    // Storms (informational gate)
    if (opts.weatherDay && opts.weatherDay.some(p => p.wmo >= 95)) {
      if (gonogo === "go") gonogo = "caution";
      f.push({ name: "T-storms", pts: 0, max: 0, detail: "thunderstorms in forecast — watch radar" });
    }

    const score = totalMax ? Math.round((total / totalMax) * 100) : null;
    const label = score == null ? "—" : score >= 80 ? "Epic" : score >= 65 ? "Great" : score >= 50 ? "Good" : score >= 35 ? "Fair" : "Tough";
    return { score, label, gonogo, factors: f };
  }

  /* ---------- ranked bite windows ----------
     Fuses solunar majors/minors, dawn/dusk, tidal water movement and hourly
     current into a 15-min score curve, then extracts labeled time windows. */
  function biteWindows(opts) {
    // opts: { date, sol, sun, tides (Conditions.tides result|null), marineDay (hourly incl. night|null) }
    const { date, sol, sun, tides, marineDay } = opts;
    const day0 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const inSpan = (t, s) => s && t >= s.start && t <= s.end;
    const nearMin = (t, ref, min) => ref && Math.abs(t - ref) <= min * 60000;
    const steps = [];
    for (let m = 4 * 60; m <= 23 * 60; m += 15) {
      const t = new Date(+day0 + m * 60000);
      const parts = [];
      let s = 15;
      if (sol.majors.some(w => inSpan(t, w))) { s += 32; parts.push("solunar major"); }
      else if (sol.minors.some(w => inSpan(t, w))) { s += 16; parts.push("solunar minor"); }
      if (nearMin(t, sun.sunrise, 45)) { s += 14; parts.push("first light"); }
      else if (nearMin(t, sun.sunset, 45)) { s += 14; parts.push("dusk"); }
      if (tides) {
        const c = Conditions.tideCurve(tides.all, t);
        if (c) {
          s += c.movement * 22;
          if (c.movement > 0.55) parts.push(c.dir === "rising" ? "incoming tide" : "outgoing tide");
          else if (c.movement < 0.2) parts.push("slack");
        }
      }
      if (marineDay && marineDay.length) {
        let best = null, bd = Infinity;
        for (const p of marineDay) { const d = Math.abs(p.t - t); if (d < bd) { bd = d; best = p; } }
        if (best && best.currentMph != null && bd <= 90 * 60000) {
          const c = best.currentMph;
          const fit = (c >= 0.35 && c <= 1.15) ? 1 : (c >= 0.17 && c <= 1.85) ? 0.5 : 0.15;
          s += fit * 17;
          if (fit === 1) parts.push("current " + c.toFixed(1) + " mph");
        }
      }
      steps.push({ t, score: Math.min(100, Math.round(s)), parts });
    }
    // contiguous windows by tier
    const tierOf = sc => sc >= 66 ? 2 : sc >= 52 ? 1 : 0;
    const windows = [];
    let cur = null;
    for (const st of steps) {
      const tier = tierOf(st.score);
      if (tier > 0 && cur && cur.tier === tier && st.t - cur.end <= 16 * 60000) {
        cur.end = new Date(+st.t + 15 * 60000);
        cur.scores.push(st.score);
        st.parts.forEach(p => cur.counts[p] = (cur.counts[p] || 0) + 1);
        cur.n++;
      } else {
        if (cur) windows.push(cur);
        cur = tier > 0 ? { tier, start: st.t, end: new Date(+st.t + 15 * 60000), scores: [st.score], counts: {}, n: 1 } : null;
        if (cur) st.parts.forEach(p => cur.counts[p] = (cur.counts[p] || 0) + 1);
      }
    }
    if (cur) windows.push(cur);
    const out = windows
      .filter(w => (w.end - w.start) >= 30 * 60000)
      .map(w => ({
        start: w.start, end: w.end, tier: w.tier,
        label: w.tier === 2 ? "PRIME" : "GOOD",
        score: Math.round(w.scores.reduce((a, b) => a + b, 0) / w.scores.length),
        reasons: Object.entries(w.counts).filter(([p, n]) => n >= w.n / 2 && p !== "slack").map(([p]) => p)
      }))
      .sort((a, b) => b.tier - a.tier || b.score - a.score)
      .slice(0, 4);
    return { steps, windows: out };
  }

  /* ---------- heatmap ---------- */
  function heatPoints(date, speciesFilter) {
    const pts = [];
    for (const s of (window.DATA_SPOTS || [])) {
      if (!inRegion(s)) continue;
      const r = scoreTarget(s, date, speciesFilter, false);
      if (speciesFilter !== "all" && (s.species[speciesFilter] || 0) === 0) continue;
      pts.push([s.lat, s.lon, Math.pow(r.score / 100, 1.6)]);
    }
    for (const z of (window.DATA_ZONES || [])) {
      if (!inRegion(z)) continue;
      if (z.avoid) continue;
      const r = scoreTarget(z, date, speciesFilter, true);
      if (speciesFilter !== "all" && (z.species[speciesFilter] || 0) === 0) continue;
      const w = Math.pow(r.score / 100, 1.6) * 0.6;
      const samples = zoneSamples(z);
      for (const [la, lo, frac] of samples) pts.push([la, lo, w * frac]);
    }
    return pts;
  }
  function zoneSamples(z) {
    const out = [];
    if (z.polygon && z.polygon.length) {
      let cy = 0, cx = 0;
      z.polygon.forEach(p => { cy += p[0]; cx += p[1]; });
      cy /= z.polygon.length; cx /= z.polygon.length;
      out.push([cy, cx, 1]);
      z.polygon.forEach(p => {
        out.push([p[0], p[1], 0.5]);
        out.push([(p[0] + cy) / 2, (p[1] + cx) / 2, 0.75]);
      });
      // interior grid so large zones stay lit when zoomed in (corners alone are miles apart)
      const lats = z.polygon.map(p => p[0]), lons = z.polygon.map(p => p[1]);
      const la0 = Math.min(...lats), la1 = Math.max(...lats), lo0 = Math.min(...lons), lo1 = Math.max(...lons);
      const steps = 7;
      for (let i = 1; i < steps; i++) for (let j = 1; j < steps; j++) {
        const la = la0 + (la1 - la0) * i / steps, lo = lo0 + (lo1 - lo0) * j / steps;
        if (pointInPoly(la, lo, z.polygon)) out.push([la, lo, 0.55]);
      }
    } else if (z.center) {
      const rMi = z.radius_mi || 5;
      out.push([z.center[0], z.center[1], 1]);
      const dLat = rMi / 69, dLon = rMi / (69 * Math.cos(z.center[0] * Math.PI / 180));
      for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4;
        out.push([z.center[0] + 0.6 * dLat * Math.sin(a), z.center[1] + 0.6 * dLon * Math.cos(a), 0.7]);
        out.push([z.center[0] + dLat * Math.sin(a + 0.4), z.center[1] + dLon * Math.cos(a + 0.4), 0.35]);
      }
    }
    return out;
  }

  /* ---------- alignment: how well a USER spot lines up with PUBLIC intel ----------
     Read-only diagnostic. Never feeds recommendations — it answers
     "does the public signal agree with this spot of mine today?" */
  function pointInPoly(lat, lon, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const yi = poly[i][0], xi = poly[i][1], yj = poly[j][0], xj = poly[j][1];
      if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function zoneContains(z, lat, lon) {
    if (z.polygon && z.polygon.length) return pointInPoly(lat, lon, z.polygon);
    if (z.center) return haversineMi(lat, lon, z.center[0], z.center[1]) <= (z.radius_mi || 5);
    return false;
  }

  function alignment(spot, date, speciesFilter) {
    const reasons = [];
    let base = 0;

    // Inside (or on) a public zone?
    for (const z of (window.DATA_ZONES || [])) {
      if (!inRegion(z)) continue;
      if (z.avoid) {
        if (zoneContains(z, spot.lat, spot.lon))
          return { score: 0, label: "NO-TAKE", reasons: ["⛔ Inside " + z.name.replace(/^⛔\s*/, "") + " — bottom fishing prohibited"] };
        continue;
      }
      if (speciesFilter !== "all" && (z.species[speciesFilter] || 0) === 0) continue;
      if (zoneContains(z, spot.lat, spot.lon)) {
        const zs = scoreTarget(z, date, speciesFilter, true).score;
        if (zs > base) base = zs;
        reasons.push("Inside " + z.name + " (zone scoring " + zs + " today)");
      }
    }

    // Near a public spot?
    let bestNear = null;
    for (const p of (window.DATA_SPOTS || [])) {
      if (!inRegion(p)) continue;
      if (speciesFilter !== "all" && (p.species[speciesFilter] || 0) === 0) continue;
      const d = haversineMi(spot.lat, spot.lon, p.lat, p.lon);
      if (d <= 7) {
        const ps = scoreTarget(p, date, speciesFilter, false).score * (1 - d / 7) * 0.9;
        if (ps > base) base = ps;
        if (!bestNear || ps > bestNear.val) bestNear = { val: ps, name: p.name, d };
      }
    }
    if (bestNear) reasons.push(bestNear.d.toFixed(1) + " mi from " + bestNear.name);

    // Depth band matches recent reports?
    let bonus = 0;
    const myDepth = avgDepth(spot);
    if (myDepth != null) {
      const seen = new Set();
      for (const rep of (window.DATA_REPORTS || [])) {
        if (!rep.depth_ft) continue;
        const days = (date - new Date(rep.date + "T12:00")) / 86400000;
        if (days < -7 || days > 75) continue;
        if (myDepth >= rep.depth_ft[0] - 10 && myDepth <= rep.depth_ft[1] + 10) {
          const sp = (rep.species || []).filter(s => speciesFilter === "all" || s === speciesFilter);
          if (!sp.length) continue;
          const key = sp.join() + rep.depth_ft.join();
          if (seen.has(key)) continue;
          seen.add(key);
          if (bonus < 14) {
            bonus += 7;
            reasons.push("Depth (" + myDepth + " ft) matches " + sp.map(speciesName).join("/") + " reports at " + rep.depth_ft.join("–") + " ft (" + rep.date + ")");
          }
        }
      }
    }

    const score = Math.round(Math.min(100, base + bonus));
    const label = score >= 70 ? "Strong" : score >= 45 ? "Moderate" : score >= 20 ? "Weak" : "No public signal";
    if (!reasons.length) reasons.push("No nearby public structure, hot zones or matching reports" + (speciesFilter !== "all" ? " for " + speciesName(speciesFilter) : ""));
    return { score, label, reasons: reasons.slice(0, 4) };
  }

  window.Scoring = { haversineMi, isOpen, depthFit, scoreTarget, rankSpots, dayScore, heatPoints, speciesName, avgDepth, alignment, zoneContains, biteWindows };
})();
