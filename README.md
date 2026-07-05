# 🎣 Gulf Bottom Intel — Tampa Bay → Hudson Offshore

A browser-based planning tool for snapper & grouper fishing in the Gulf, from the mouth of
Tampa Bay north to Hudson, 20–80 miles offshore. Built from public reef coordinates,
2026 charter reports, NOAA tide predictions, marine forecast models, and moon/solunar math.

## Run it

- **Local:** double-click `index.html` (works from `file://`), or serve the folder
  (`python -m http.server --directory tampa-offshore-fishing 8741`).
- **GitHub Pages:** push this folder and point Pages at it — no build step, no keys.

Internet is needed for map tiles and live forecasts; astronomy/solunar math works offline.

## What it does

| Piece | How |
|---|---|
| **Day outlook (0–100)** | Seas vs your limit, wind, moon/solunar rating, tide swing, offshore current, pressure trend + thunderstorm flag. Every factor shows its points and reasoning. |
| **Heatmap & spots** | Public artificial reefs/wrecks (grade **A** = official coords), multi-source spots (**B**), and report-derived areas (**C** = search with sonar). Scores blend structure quality, seasonal depth fit, fresh-report boosts (3-week half-life), and legality. |
| **Best times** | Solunar majors (moon overhead/underfoot) & minors (rise/set), dawn/dusk, tide events on a 24h timeline. |
| **Live conditions** | NOAA CO-OPS tides (Hudson, Anclote, Clearwater, John's Pass, Skyway stations) + Open-Meteo marine (waves, period, SST, **ocean current**) + wind/gusts/pressure, 7-day horizon. |
| **Seasons** | Full 2026 Gulf reef-fish calendar (private rec) with open/closed-today per species, bag/size, source links — including the Feb–Mar >20-fathom grouper closure and the Steamboat Lumps no-take zone on the map. |
| **Export** | GPX waypoints (chartplotter-ready) and CSV from the Spots tab. Print trip sheet from Today's Plan. |
| **Bay scallops** | Full scallop mode: the **Scallops** chip lights up FWC's real **seagrass bed mapping**, the three harvest zones (Pasco · Levy/Citrus/Hernando · Fenholloway–Suwannee) drawn to their legal landmark boundaries with **zone-specific 2026 seasons** (each zone shows OPEN/CLOSED for the selected date), named flats (St. Martins Keys, Crystal River, Pepperfish…), opener reports, bag/gear/flag rules, and the Pasco toxin-closure warning. |
| **My Spots** | Import your own waypoints on the Spots tab: Google My Maps **KML/KMZ** export, **GPX**, **CSV**, or pasted coordinates (decimal, DDM like `28 21.702 N 082 42.600 W`, or DMS). Names like "AJ wreck 120ft" auto-tag species & depth. Saved in your browser (per device) and shown as gold ★ pins **layered over the public heatmap — they never influence the recommendations**. Instead, each gets a public-intel **alignment** score (inside which hot zone, near which structure, depth matching which recent reports) so you can see which of your numbers the public signal agrees with, and a separate "My GPX" export. |

## Trip planner

The **Trip** tab turns selected spots into a full float plan:

- Add stops from any popup (**➕ Add to trip**) — public spots, your spots, zones, or right-click dropped pins. Reorder/remove in the list; the route plots on the map (numbered badges, dashed return leg).
- **Boat profile** (saved): cruise mph, **MPG at cruise**, idle gal/hr, tank, reserve %, minutes per stop, departure time. Everything is statute miles & mph.
- Per-leg ETAs use **condition-adjusted speed**: forecast seas slow you (−8%/ft over 1.5 ft), headwind component drags, and along-track **current** adds or subtracts — sampled at each leg's midpoint for that hour. Slowed legs also burn more per mile.
- Totals: distance (mi), run vs fish time, back-at-dock ETA (⚠ if after sunset), fuel vs usable (tank minus reserve), max seas en route, and tide stage at the ramp for departure and return.

## Chart overlays (My Charts)

The Spots tab can layer your own charts on the map, stored on-device (IndexedDB):

- **StrikeLines Google Earth (KMZ)** charts and any KML `GroundOverlay` — imported as-is, multi-panel supported.
- **Any chart screenshot** (Garmin/Simrad screen, StrikeLines preview image) — pick the image, type its SW and NE corners (any coordinate format), done.
- **NOAA ENC nautical chart** — free live layer in the map's layer control (official soundings/contours, no files needed).
- **Depth model (BlueTopo)** — NOAA's national best-available bathymetry (public domain): color depth shading + hillshade relief that shows ledges, channels and hard-bottom texture. Toggle in the layer control. (Garmin/Navionics SonarChart web tiles are proprietary and are not scraped — BlueTopo is the legal equivalent, largely built from the same federal survey data.)
- Garmin/Navionics/Quickdraw **card files are proprietary** and can't be read by any browser — use the screenshot route for those.

## Data refresh

Spot/report/season data lives in `data/*.js` with a compile date shown on the Intel tab.
Ask Claude to *"refresh the fishing data"* — it re-scrapes reports/regs and rewrites those files.
Forecasts are live on every page load (45-min cache; ↻ Refresh to force).

## Honesty notes

- Grade **A** coordinates come from official public lists. **B/C** are community-reported or
  derived areas — verify structure on your sounder before anchoring.
- This is a planning tool, not navigation. Check the NWS marine forecast and radar before
  running, file a float plan, and verify regs with FWC on the day (rules change by executive order).
