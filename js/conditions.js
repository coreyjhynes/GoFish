/* Live conditions: NOAA CO-OPS tide predictions + Open-Meteo marine & weather.
   All endpoints are free, keyless, and CORS-enabled (verified 2026-06-12). */
(function () {
  "use strict";

  const mem = new Map();
  const TTL_MS = 45 * 60 * 1000;

  async function cachedJson(url) {
    const now = Date.now();
    const hit = mem.get(url);
    if (hit && now - hit.t < TTL_MS) return hit.v;
    try {
      const ls = localStorage.getItem("gbi:" + url);
      if (ls) {
        const o = JSON.parse(ls);
        if (now - o.t < TTL_MS) { mem.set(url, o); return o.v; }
      }
    } catch (e) { /* localStorage unavailable (private mode) — ignore */ }
    const resp = await fetch(url);
    if (!resp.ok) throw new Error("HTTP " + resp.status + " for " + url);
    const v = await resp.json();
    mem.set(url, { t: now, v });
    try { localStorage.setItem("gbi:" + url, JSON.stringify({ t: now, v })); } catch (e) { /* quota — ignore */ }
    return v;
  }

  function ymd(d) {
    return d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
  }
  function parseLocal(s) { // "2026-06-12 04:40" or "2026-06-12T04:40" -> local Date
    return new Date(s.replace(" ", "T"));
  }

  /* ---- NOAA tide predictions (hi/lo) for the day, station-local time ---- */
  async function tides(stationId, date) {
    const d0 = new Date(date); d0.setDate(d0.getDate() - 1);
    const d1 = new Date(date); d1.setDate(d1.getDate() + 1);
    const url = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions" +
      "&application=gulf-bottom-intel&begin_date=" + ymd(d0) + "&end_date=" + ymd(d1) +
      "&datum=MLLW&station=" + stationId + "&time_zone=lst_ldt&units=english&interval=hilo&format=json";
    const j = await cachedJson(url);
    if (!j.predictions) throw new Error("No tide predictions for station " + stationId);
    const all = j.predictions.map(p => ({ t: parseLocal(p.t), ft: parseFloat(p.v), type: p.type }));
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(+dayStart + 86400000);
    const today = all.filter(p => p.t >= dayStart && p.t < dayEnd);
    const highs = today.filter(p => p.type === "H").map(p => p.ft);
    const lows = today.filter(p => p.type === "L").map(p => p.ft);
    const range = (highs.length && lows.length) ? Math.max(...highs) - Math.min(...lows) : null;
    return { all, today, range };
  }

  // Cosine interpolation between consecutive hi/lo points -> smooth curve + phase lookup.
  function tideCurve(allHilo, when) {
    let before = null, after = null;
    for (const p of allHilo) {
      if (p.t <= when) before = p;
      else { after = p; break; }
    }
    if (!before || !after) return null;
    const frac = (when - before.t) / (after.t - before.t);
    const ft = before.ft + (after.ft - before.ft) * (1 - Math.cos(Math.PI * frac)) / 2;
    const dir = after.ft > before.ft ? "rising" : "falling";
    // Movement strength peaks mid-way between hi & lo
    const movement = Math.sin(Math.PI * frac);
    return { ft, dir, movement, next: after };
  }

  /* ---- Open-Meteo marine forecast at an offshore point ---- */
  async function marine(lat, lon) {
    const url = "https://marine-api.open-meteo.com/v1/marine?latitude=" + lat.toFixed(3) +
      "&longitude=" + lon.toFixed(3) +
      "&hourly=wave_height,wave_period,wave_direction,sea_surface_temperature,ocean_current_velocity,ocean_current_direction" +
      "&length_unit=imperial&timezone=America%2FNew_York&past_days=1&forecast_days=7";
    const j = await cachedJson(url);
    const h = j.hourly;
    return h.time.map((t, i) => ({
      t: parseLocal(t),
      waveFt: h.wave_height[i],
      wavePeriodS: h.wave_period[i],
      waveDir: h.wave_direction[i],
      sstF: h.sea_surface_temperature[i] == null ? null : h.sea_surface_temperature[i] * 9 / 5 + 32,
      currentMph: h.ocean_current_velocity[i] == null ? null : h.ocean_current_velocity[i] / 1.609344,
      currentDir: h.ocean_current_direction[i]
    }));
  }

  /* ---- Open-Meteo weather (wind, gusts, pressure) at the same point ---- */
  async function weather(lat, lon) {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat.toFixed(3) +
      "&longitude=" + lon.toFixed(3) +
      "&hourly=wind_speed_10m,wind_gusts_10m,wind_direction_10m,surface_pressure,weather_code,precipitation_probability" +
      "&wind_speed_unit=mph&timezone=America%2FNew_York&past_days=1&forecast_days=7";
    const j = await cachedJson(url);
    const h = j.hourly;
    return h.time.map((t, i) => ({
      t: parseLocal(t),
      windMph: h.wind_speed_10m[i],
      gustMph: h.wind_gusts_10m[i],
      windDir: h.wind_direction_10m[i],
      pressure: h.surface_pressure[i],
      wmo: h.weather_code[i],
      precipPct: h.precipitation_probability ? h.precipitation_probability[i] : null
    }));
  }

  // Slice an hourly series to one local calendar day (optionally daylight-ish hours).
  function daySlice(series, date, fromHour, toHour) {
    const a = fromHour == null ? 0 : fromHour, b = toHour == null ? 24 : toHour;
    return series.filter(p =>
      p.t.getFullYear() === date.getFullYear() &&
      p.t.getMonth() === date.getMonth() &&
      p.t.getDate() === date.getDate() &&
      p.t.getHours() >= a && p.t.getHours() < b);
  }
  function avg(arr) { const v = arr.filter(x => x != null && !isNaN(x)); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null; }
  function max(arr) { const v = arr.filter(x => x != null && !isNaN(x)); return v.length ? Math.max(...v) : null; }

  function dirArrow(deg) {
    if (deg == null) return "";
    const arrows = ["↓", "↙", "←", "↖", "↑", "↗", "→", "↘"]; // wind FROM deg -> arrow points where it goes
    return arrows[Math.round(((deg + 180) % 360) / 45) % 8];
  }
  function compass(deg) {
    if (deg == null) return "—";
    const pts = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
    return pts[Math.round(deg / 22.5) % 16];
  }

  const WMO = {
    0: "Clear", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Fog", 51: "Drizzle", 53: "Drizzle", 55: "Drizzle",
    61: "Light rain", 63: "Rain", 65: "Heavy rain", 80: "Showers", 81: "Showers",
    82: "Heavy showers", 95: "Thunderstorms", 96: "T-storms w/ hail", 99: "T-storms w/ hail"
  };

  window.Conditions = { tides, tideCurve, marine, weather, daySlice, avg, max, dirArrow, compass, WMO };
})();
