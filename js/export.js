/* Waypoint export: GPX (chartplotter-ready) and CSV. */
(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function toGPX(spots) {
    const wpts = spots.map(s => {
      const depth = s.depth_ft != null ? (Array.isArray(s.depth_ft) ? s.depth_ft.join("-") : s.depth_ft) + " ft" : "";
      const desc = [s.type, depth, s.notes].filter(Boolean).join(" | ");
      const sym = s.sym || (s.type === "wreck" ? "Shipwreck" : s.type === "user" ? "Flag" : "Reef");
      return '  <wpt lat="' + s.lat.toFixed(6) + '" lon="' + s.lon.toFixed(6) + '">\n' +
        "    <name>" + esc(s.name) + "</name>\n" +
        "    <desc>" + esc(desc) + "</desc>\n" +
        "    <sym>" + esc(sym) + "</sym>\n" +
        "  </wpt>";
    }).join("\n");
    return '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<gpx version="1.1" creator="Gulf Bottom Intel" xmlns="http://www.topografix.com/GPX/1/1">\n' +
      "  <metadata><name>Gulf Bottom Intel waypoints</name></metadata>\n" +
      wpts + "\n</gpx>\n";
  }

  function toCSV(spots) {
    const rows = [["name", "lat", "lon", "lat_ddm", "lon_ddm", "depth_ft", "type", "grade", "notes"]];
    for (const s of spots) {
      rows.push([s.name, s.lat.toFixed(6), s.lon.toFixed(6), ddm(s.lat, true), ddm(s.lon, false),
        Array.isArray(s.depth_ft) ? s.depth_ft.join("-") : (s.depth_ft == null ? "" : s.depth_ft),
        s.type, s.grade, (s.notes || "").replace(/"/g, "'")]);
    }
    return rows.map(r => r.map(c => '"' + String(c) + '"').join(",")).join("\r\n");
  }

  // Degrees + decimal minutes, the format chartplotters speak: N 28° 21.702'
  function ddm(dec, isLat) {
    const hemi = isLat ? (dec >= 0 ? "N" : "S") : (dec >= 0 ? "E" : "W");
    const a = Math.abs(dec);
    const deg = Math.floor(a);
    const min = (a - deg) * 60;
    return hemi + " " + String(deg).padStart(isLat ? 2 : 3, "0") + "° " + min.toFixed(3) + "'";
  }

  function download(filename, text, mime) {
    const blob = new Blob([text], { type: mime || "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  }

  window.Exporter = { toGPX, toCSV, ddm, download };
})();
