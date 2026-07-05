/* Astronomy + solunar engine. Depends on libs/suncalc.js (SunCalc). */
(function () {
  "use strict";

  const SYNODIC = 29.530588853; // days

  // SunCalc phase: 0 = new, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter
  function phaseName(p) {
    if (p < 0.0167 || p > 0.9833) return "New Moon";
    if (p < 0.2333) return "Waxing Crescent";
    if (p < 0.2667) return "First Quarter";
    if (p < 0.4833) return "Waxing Gibbous";
    if (p < 0.5167) return "Full Moon";
    if (p < 0.7333) return "Waning Gibbous";
    if (p < 0.7667) return "Last Quarter";
    return "Waning Crescent";
  }
  function phaseEmoji(p) {
    const icons = ["\u{1F311}", "\u{1F312}", "\u{1F313}", "\u{1F314}", "\u{1F315}", "\u{1F316}", "\u{1F317}", "\u{1F318}"];
    return icons[Math.round(p * 8) % 8];
  }

  // Days until the nearest new or full moon (negative = it just passed).
  function daysToSyzygy(date) {
    const p = SunCalc.getMoonIllumination(date).phase; // 0..1
    const dNew = Math.min(p, 1 - p) * SYNODIC;             // distance to new
    const dFull = Math.abs(p - 0.5) * SYNODIC;             // distance to full
    if (dNew <= dFull) {
      return { which: "new", days: dNew, signedDays: p <= 0.5 ? -dNew : dNew };
    }
    return { which: "full", days: dFull, signedDays: p <= 0.5 ? dFull : -dFull };
  }

  // Sample the moon's altitude through the local day to find upper transit
  // (altitude max) and lower transit / "moon underfoot" (altitude min).
  function lunarTransits(date, lat, lon) {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    const stepMin = 4;
    let samples = [];
    for (let m = 0; m <= 1440; m += stepMin) {
      const t = new Date(start.getTime() + m * 60000);
      samples.push({ t, alt: SunCalc.getMoonPosition(t, lat, lon).altitude });
    }
    let upper = null, lower = null;
    for (let i = 1; i < samples.length - 1; i++) {
      const a = samples[i - 1].alt, b = samples[i].alt, c = samples[i + 1].alt;
      if (b > a && b >= c) { if (!upper || b > upper.alt) upper = samples[i]; }
      if (b < a && b <= c) { if (!lower || b < lower.alt) lower = samples[i]; }
    }
    return {
      upper: upper ? upper.t : null,  // moon overhead -> solunar major
      lower: lower ? lower.t : null   // moon underfoot -> solunar major
    };
  }

  // Solunar periods for a local day: majors around transits, minors around rise/set.
  function solunar(date, lat, lon) {
    const transits = lunarTransits(date, lat, lon);
    const mt = SunCalc.getMoonTimes(date, lat, lon);
    const majors = [], minors = [];
    const HOUR = 3600000;
    if (transits.upper) majors.push({ start: new Date(transits.upper - HOUR), end: new Date(+transits.upper + HOUR), label: "Moon overhead" });
    if (transits.lower) majors.push({ start: new Date(transits.lower - HOUR), end: new Date(+transits.lower + HOUR), label: "Moon underfoot" });
    if (mt.rise) minors.push({ start: new Date(+mt.rise - 0.75 * HOUR), end: new Date(+mt.rise + 0.75 * HOUR), label: "Moonrise" });
    if (mt.set) minors.push({ start: new Date(+mt.set - 0.75 * HOUR), end: new Date(+mt.set + 0.75 * HOUR), label: "Moonset" });
    majors.sort((a, b) => a.start - b.start);
    minors.sort((a, b) => a.start - b.start);
    return { majors, minors, moonrise: mt.rise || null, moonset: mt.set || null };
  }

  // 0..4 solunar day rating: peaks at new/full, modest at quarters.
  function dayRating(date) {
    const s = daysToSyzygy(date);
    const d = s.days;
    let r;
    if (d <= 0.75) r = 4;
    else if (d <= 1.75) r = 3.5;
    else if (d <= 3) r = 3;
    else if (d <= 5) r = 2.25;
    else r = 1.75; // near quarter moons
    return { rating: r, nearest: s.which, days: d, signedDays: s.signedDays };
  }

  function moonInfo(date) {
    const ill = SunCalc.getMoonIllumination(date);
    return {
      phase: ill.phase,
      illum: Math.round(ill.fraction * 100),
      name: phaseName(ill.phase),
      emoji: phaseEmoji(ill.phase)
    };
  }

  function sunTimes(date, lat, lon) {
    const t = SunCalc.getTimes(date, lat, lon);
    return { sunrise: t.sunrise, sunset: t.sunset, dawn: t.dawn, dusk: t.dusk };
  }

  window.Astro = { moonInfo, solunar, dayRating, sunTimes, daysToSyzygy, lunarTransits };
})();
