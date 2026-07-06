/* Point structures: artificial reefs, wrecks, springs — researched 2026-06-12.
   Grades: A = official published coords (county/FWC) · B = multi-source reported · C = approximate.
   County programs warn storms shift reef material — positions are deployment centers; verify on sonar. */
window.DATA_SPOTS = [

  /* ---------- PRIME RANGE (20–45 mi out) ---------- */
  {
    id: "blackthorn", name: "USCGC Blackthorn (wreck)", lat: 27.87617, lon: -83.18800,
    depth_ft: 80, relief_ft: 20, type: "wreck", grade: "A",
    species: { mangrove_snapper: 5, gag_grouper: 4, amberjack: 4, red_snapper: 3, lane_snapper: 3, red_grouper: 2 },
    notes: "180-ft Coast Guard buoy tender, upside down in two sections on the Pinellas #2 site (~21 mi out). Goliaths live here. Big mangrove stop, gags around the edges.",
    sources: [{ name: "Pinellas County reef PDF", url: "https://pinellas.gov/wp-content/uploads/2022/04/Pinellas-2.pdf" }]
  },
  {
    id: "sheridan", name: "Sheridan Tug (wreck)", lat: 27.87630, lon: -83.18583,
    depth_ft: 80, relief_ft: 30, type: "wreck", grade: "A",
    species: { mangrove_snapper: 5, gag_grouper: 4, amberjack: 4, red_snapper: 3, lane_snapper: 3 },
    notes: "180-ft ocean tug, intact and upright ~575 ft from the Blackthorn — wheelhouse tops at ~50 ft. The high-relief AJ/mangrove magnet of the Pinellas #2 site.",
    sources: [{ name: "Pinellas County reef PDF", url: "https://pinellas.gov/wp-content/uploads/2022/04/Pinellas-2.pdf" }]
  },
  {
    id: "pinellas2", name: "Pinellas #2 Reef (site center)", lat: 27.87663, lon: -83.18607,
    depth_ft: 80, relief_ft: 10, type: "artificial_reef", grade: "A",
    species: { mangrove_snapper: 4, gag_grouper: 4, red_snapper: 3, red_grouper: 3, amberjack: 4, lane_snapper: 3 },
    notes: "Premier 80-ft public site ~21 mi off Clearwater/St. Pete: wrecks, steel barges ('Two Barges'), culverts spread around the permit area.",
    sources: [{ name: "Pinellas County reef GPS list", url: "https://pinellas.gov/artificial-reef-gps-coordinates/" }]
  },
  {
    id: "gunsmoke", name: "Gunsmoke (drug-runner wreck)", lat: 27.55918, lon: -83.08467,
    depth_ft: 80, relief_ft: 8, type: "wreck", grade: "B",
    species: { gag_grouper: 4, mangrove_snapper: 4, amberjack: 3, red_snapper: 3, red_grouper: 2 },
    notes: "65–70 ft steel shrimp trawler scuttled 1977 (~20–24 mi off John's Pass), listing, collapsed amidships. NOTE: some wreck lists show a position ~1.5 nm NW — search if she's not under you.",
    sources: [{ name: "FishingStatus record", url: "https://fishingstatus.com/fishing/details/IndexID/223411" }]
  },
  {
    id: "fin_barge", name: "Fin Barge (inverted barge)", lat: 27.49530, lon: -83.09498,
    depth_ft: 85, relief_ft: 25, type: "barge", grade: "B",
    species: { mangrove_snapper: 4, gag_grouper: 3, red_grouper: 3, red_snapper: 3, amberjack: 3 },
    notes: "~250-ft steel barge upside down with twin fin keels, ~22 mi out at the south edge of the zone. Prime mixed-bag structure.",
    sources: [{ name: "St. Pete Times 'Top 10 on the gulf bottom'", url: "https://www.tampabay.com/archive/2001/05/06/the-top-10-on-the-gulf-bottom/" }]
  },
  {
    id: "anclote_tug", name: "Anclote Tug (inverted tug)", lat: 28.24143, lon: -83.34285,
    depth_ft: 80, relief_ft: 12, type: "wreck", grade: "B",
    species: { amberjack: 4, gag_grouper: 4, mangrove_snapper: 4, red_snapper: 3, red_grouper: 2 },
    notes: "Big steel tug upside down in 80 ft, ~30 mi WNW of Anclote; the barge she was towing lies a short distance SW — fish both.",
    sources: [{ name: "St. Pete Times 'Top 10 on the gulf bottom'", url: "https://www.tampabay.com/archive/2001/05/06/the-top-10-on-the-gulf-bottom/" }]
  },
  {
    id: "misener_crane", name: "Misener Crane", lat: 28.50542, lon: -83.20478,
    depth_ft: 50, relief_ft: 23, type: "wreck", grade: "B",
    species: { gag_grouper: 4, mangrove_snapper: 4, lane_snapper: 3, amberjack: 2 },
    notes: "Marine construction crane lost off a barge — gear ring rises within ~27 ft of the surface. Gag nursery (lots of shorts, bigger fish on the edges), mangroves in the boom lattice. ~33 mi off Hernando Beach, NW of Hudson.",
    sources: [{ name: "St. Pete Times 'Top 10 on the gulf bottom'", url: "https://www.tampabay.com/archive/2001/05/06/the-top-10-on-the-gulf-bottom/" }]
  },
  {
    id: "treasure_island2", name: "Treasure Island #2 Reef (tanks & barge)", lat: 27.69412, lon: -83.29093,
    depth_ft: 100, relief_ft: 10, type: "artificial_reef", grade: "A",
    species: { red_grouper: 4, red_snapper: 4, gag_grouper: 4, mangrove_snapper: 4, scamp: 3, vermilion_snapper: 3, amberjack: 3 },
    notes: "Deepwater county site ~31 mi out: bridge concrete, 10 M-60 Army tanks (Reef-Ex '95), a 200-ft barge and reef balls in 100 ft. Proper offshore mixed bag.",
    sources: [{ name: "Pinellas County reef PDF", url: "https://pinellas.gov/wp-content/uploads/2022/04/Treasure-Island-II.pdf" }]
  },
  {
    id: "pinellas3", name: "Pinellas #3 Reef (deep site)", lat: 27.88333, lon: -83.58333,
    depth_ft: 105, relief_ft: 8, type: "artificial_reef", grade: "A",
    species: { red_grouper: 5, red_snapper: 4, vermilion_snapper: 4, mangrove_snapper: 4, scamp: 3, gag_grouper: 3 },
    notes: "Farthest county permit site (~44 mi out, charted ~100–110 ft) — red grouper / red snapper country surrounded by good natural hard bottom.",
    sources: [{ name: "Pinellas County artificial reef guide", url: "https://tampabay.wateratlas.usf.edu/upload/documents/Pinellas_artificial_reef_guide.pdf" }]
  },
  {
    id: "mexican_pride", name: "Mexican Pride (freighter wreck)", lat: 27.52378, lon: -83.40483,
    depth_ft: 130, relief_ft: 25, type: "wreck", grade: "B",
    species: { red_snapper: 5, amberjack: 5, scamp: 4, mangrove_snapper: 4, vermilion_snapper: 3, gag_grouper: 3 },
    notes: "200–250 ft steel freighter, mostly intact — the biggest, deepest local wreck (~40 mi out, 130 ft). Red snapper, scamp, big AJs, cobia, permit; expect company on weekends.",
    sources: [{ name: "St. Pete Times 'Top 10 on the gulf bottom'", url: "https://www.tampabay.com/archive/2001/05/06/the-top-10-on-the-gulf-bottom/" }]
  },

  /* ---------- NEAR EDGE (10–18 mi — weather-day options) ---------- */
  {
    id: "veterans_reef", name: "Veterans Reef (Circle of Heroes)", lat: 28.05000, lon: -83.01250,
    depth_ft: 45, relief_ft: 12, type: "artificial_reef", grade: "A",
    species: { gag_grouper: 3, mangrove_snapper: 4, lane_snapper: 3, hogfish: 4 },
    notes: "Three steel barges, culverts, reef balls and the Circle of Heroes memorial, ~10 mi W of Clearwater Pass. Cool-month gags, summer mangroves.",
    sources: [{ name: "Pinellas County — Veterans Reef", url: "https://pinellas.gov/artificial-reef-guide-veterans-reef" }]
  },
  {
    id: "rube_allyn", name: "Rube Allyn Reef", lat: 27.93207, lon: -83.02338,
    depth_ft: 45, relief_ft: 10, type: "artificial_reef", grade: "A",
    species: { gag_grouper: 3, mangrove_snapper: 4, lane_snapper: 3, hogfish: 3, red_grouper: 2 },
    notes: "Culverts, bridge material and steel ~12 mi W of Clearwater Pass. (County updated the published numbers in 2022 — older lists are ~0.5 nm off.)",
    sources: [{ name: "Pinellas County reef PDF", url: "https://pinellas.gov/wp-content/uploads/2022/04/Rube-Allyn.pdf" }]
  },
  {
    id: "indian_shores", name: "Indian Shores Reef", lat: 27.86152, lon: -83.03028,
    depth_ft: 45, relief_ft: 12, type: "artificial_reef", grade: "A",
    species: { gag_grouper: 3, mangrove_snapper: 4, hogfish: 3, lane_snapper: 3 },
    notes: "Culverts, pyramids, two WWII Navy landing ships, a 240-ft salt hopper barge and the tug Orange (27.85735, -83.03055) — ~11 mi out.",
    sources: [{ name: "Pinellas County reef PDF", url: "https://pinellas.gov/wp-content/uploads/2022/04/Indian-Shores-Reef.pdf" }]
  },
  {
    id: "pasco2_tanks", name: "Pasco Reef #2 + Army Tanks", lat: 28.29558, lon: -83.01872,
    depth_ft: 36, relief_ft: 10, type: "artificial_reef", grade: "B",
    species: { gag_grouper: 3, mangrove_snapper: 3, hogfish: 3, lane_snapper: 2 },
    notes: "Culvert site with M-60 Army tanks (Reef-Ex '94) scattered nearby (site center 28.30083, -83.01595) — ~16 mi W of Port Richey. Fall/winter gags.",
    sources: [{ name: "Fish On Club Pasco GPS list", url: "https://fishonclub.us/gps-coordinates/" }]
  },
  {
    id: "pasco3", name: "Pasco Reef #3", lat: 28.19167, lon: -83.05933,
    depth_ft: 30, relief_ft: 6, type: "artificial_reef", grade: "B",
    species: { mangrove_snapper: 3, gag_grouper: 2, hogfish: 3, lane_snapper: 2 },
    notes: "Westernmost Pasco culvert site, ~16 mi out of Anclote.",
    sources: [{ name: "Fish On Club Pasco GPS list", url: "https://fishonclub.us/gps-coordinates/" }]
  },
  {
    id: "pasco4", name: "Pasco Reef #4 (Hudson)", lat: 28.37097, lon: -82.94998,
    depth_ft: 27, relief_ft: 8, type: "artificial_reef", grade: "A",
    species: { mangrove_snapper: 3, gag_grouper: 2, hogfish: 2 },
    notes: "272 culvert pieces (317 tons, 1998) ~15 mi W of Hudson Beach — closest structure to your home ramp.",
    sources: [{ name: "FWC deployment record (FishingStatus mirror)", url: "https://fishingstatus.com/fishing/details/IndexId/180837" }]
  },
  {
    id: "bendickson", name: "Bendickson Reef (tanks + Ghost Ship)", lat: 28.52983, lon: -82.97950,
    depth_ft: 26, relief_ft: 12, type: "artificial_reef", grade: "A",
    species: { gag_grouper: 3, mangrove_snapper: 3, hogfish: 2 },
    notes: "Hernando's flagship: ten M-60 tanks (Reef-Ex '95), reef balls and the 46-ft concrete 'Ghost Ship' sailboat — ~18 mi W of Hernando Beach, NNW of Hudson.",
    sources: [{ name: "FWC deployment record (FishingStatus mirror)", url: "https://fishingstatus.com/fishing/details/IndexId/179738" }]
  },
  /* ---------- BAY SCALLOP FLATS (grade C — work the grass, coords are area centers) ---------- */
  {
    id: "sc_anclote_north", name: "North Anclote Key grass flats", lat: 28.20, lon: -82.83,
    depth_ft: [4, 8], relief_ft: 0, type: "scallop_flat", grade: "C",
    season: { start: "2026-07-10", end: "2026-08-18" },
    species: { bay_scallop: 4 },
    notes: "Primary Pasco-zone harvest area just north of the Anclote Key Lighthouse — clear water over healthy grass in 4–6 ft. Closest scallop ground to the Anclote ramp. Season Jul 10 – Aug 18.",
    sources: [{ name: "Pasco Zone guide", url: "https://koa.com/campgrounds/clearwater-lake/blog/scalloping-near-tarpon-springs-your-pasco-zone-guide_e85fdb89-c3ab-46c8-a3d0-2fe4f2ea51bb/" }]
  },
  {
    id: "sc_hudson_aripeka", name: "Hudson–Aripeka seagrass beds", lat: 28.37, lon: -82.72,
    depth_ft: [4, 8], relief_ft: 0, type: "scallop_flat", grade: "C",
    season: { start: "2026-07-10", end: "2026-08-18" },
    species: { bay_scallop: 4 },
    notes: "Lush grass between Hudson and Aripeka at the north end of the Pasco zone — minutes from your Hudson ramp. Season Jul 10 – Aug 18; watch FWC for toxin advisories in this zone.",
    sources: [{ name: "NatureCoaster", url: "https://naturecoaster.com/the-nature-coasts-secret-to-amazing-scallops-protect-the-coast-enjoy-the-tradition/" }]
  },
  {
    id: "sc_st_martins", name: "St. Martins Keys (north side)", lat: 28.73, lon: -82.73,
    depth_ft: [3, 10], relief_ft: 0, type: "scallop_flat", grade: "C",
    season: { start: "2026-07-01", end: "2026-09-24" },
    species: { bay_scallop: 5 },
    notes: "The classic Homosassa spot — fish the water NORTH of the keys; protected coast and gradual slope grow thick grass. Ideal 3–5 ft, scallops range to 10+. Access via Ozello / St. Martins River. OPEN NOW (Jul 1 – Sep 24).",
    sources: [{ name: "Flats Chance — Homosassa spots", url: "https://www.flatschance.com/post/best-homosassa-scalloping-spots" }]
  },
  {
    id: "sc_crystal_river", name: "Crystal River flats (Gomez Rocks / Mangrove Pt)", lat: 28.87, lon: -82.70,
    depth_ft: [3, 8], relief_ft: 0, type: "scallop_flat", grade: "C",
    season: { start: "2026-07-01", end: "2026-09-24" },
    species: { bay_scallop: 5 },
    notes: "Some of the state's best scalloping — launch Kings Bay or Fort Island Gulf Beach and run west to the grass. Chest-deep clear water, family-friendly. OPEN NOW (Jul 1 – Sep 24).",
    sources: [{ name: "Discover Crystal River", url: "https://www.discovercrystalriverfl.com/directory/fort-island-gulf-beach-birding-hot-spots/" }]
  },
  {
    id: "sc_chass_point", name: "Chassahowitzka Point flats", lat: 28.72, lon: -82.66,
    depth_ft: [4, 7], relief_ft: 0, type: "scallop_flat", grade: "C",
    season: { start: "2026-07-01", end: "2026-09-24" },
    species: { bay_scallop: 4 },
    notes: "Grass off the Chassahowitzka at the zone's south end — named opener access in the 2026 Chronicle report. OPEN NOW (Jul 1 – Sep 24).",
    sources: [{ name: "Citrus County Chronicle — opener", url: "https://www.chronicleonline.com/news/local/boaters-flood-nature-coast-as-scallop-season-opens/article_fe933ffc-36ad-58dc-9100-7f748d5c1c5d.html" }]
  },
  {
    id: "sc_pepperfish", name: "Pepperfish Keys", lat: 29.55, lon: -83.42,
    depth_ft: [4, 8], relief_ft: 0, type: "scallop_flat", grade: "C",
    season: { start: "2026-06-15", end: "2026-09-07" },
    species: { bay_scallop: 5 },
    notes: "2026 standout: cleanest water AND best scallop numbers in the Steinhatchee region per current reports — limits in 1–2 hrs early season. Trailer trip (~2 hr from Hudson). Jun 15 – Sep 7.",
    sources: [{ name: "Outdoor Update — Steinhatchee", url: "https://www.outdoorupdate.com/steinhatchee-fishing-scalloping-report-its-all-about-the-scallops-now/" }]
  },
  {
    id: "jewfish_spring", name: "Jewfish Spring (blue hole)", lat: 28.42933, lon: -82.70883,
    depth_ft: [100, 209], relief_ft: 0, type: "spring", grade: "B",
    species: { gag_grouper: 3, mangrove_snapper: 3 },
    notes: "Nearshore submarine spring off Aripeka dropping to ~209 ft with a hard thermocline — stacks bait and fish in cold snaps. Novelty structure, not an offshore run.",
    sources: [{ name: "ScubaBoard thread", url: "https://scubaboard.com/community/threads/off-shore-spring-south-of-hudson.306960/" }]
  },

  /* ---------- STORIED OFFSHORE SPRINGS (long runs, southern reach) ---------- */
  {
    id: "green_banana", name: "Green Banana Hole (blue hole)", lat: 26.80119, lon: -83.08198,
    depth_ft: [154, 425], relief_ft: 0, type: "spring", grade: "B",
    species: { red_snapper: 4, amberjack: 4, mangrove_snapper: 4, gag_grouper: 3, red_grouper: 3 },
    notes: "THE famous one — an hourglass blue hole: rim at 154 ft opening to ~425 ft, named when a commercial captain spotted a green banana peel floating over it. NOAA/Mote/FAU explored it 2020–21; the position is from their published record. Springs concentrate bait, AJs and stacked snapper/grouper, especially in cold snaps. Reality check on the lore: it sits ~62 mi SSW of the Tampa Bay mouth (~50 mi W of Sarasota) — south of 'due west of St. Pete.' A serious run — pick a flat day and expect the hourglass to narrow just under the rim.",
    sources: [
      { name: "Wikipedia — Green Banana Hole (position)", url: "https://en.wikipedia.org/wiki/Green_Banana_Hole" },
      { name: "Florida Sportsman offshore springs feature", url: "https://www.floridasportsman.com/editorial/features_0901_fishing_gulf_of_mexico_offshore_springs/401487" }
    ]
  },
  {
    id: "top_cap_spring", name: "Top Cap (spring)", lat: 27.19555, lon: -83.56667,
    depth_ft: [162, 162], relief_ft: 0, type: "spring", grade: "B",
    species: { red_snapper: 4, red_grouper: 4, amberjack: 3, mangrove_snapper: 3, vermilion_snapper: 3 },
    notes: "Published-GPS offshore spring from the Florida Sportsman springs feature (27°11.733' / 83°34.000'), 162 ft — southwest reach of the grounds, ~55 mi from the Tampa Bay mouth. Spring vents hold bait and stack winter fish.",
    sources: [{ name: "Florida Sportsman offshore springs feature", url: "https://www.floridasportsman.com/editorial/features_0901_fishing_gulf_of_mexico_offshore_springs/401487" }]
  },
  {
    id: "deep_undercover_spring", name: "Deep Undercover (spring)", lat: 27.13708, lon: -83.43985,
    depth_ft: [160, 160], relief_ft: 0, type: "spring", grade: "B",
    species: { red_snapper: 4, red_grouper: 4, amberjack: 3, mangrove_snapper: 3, vermilion_snapper: 3 },
    notes: "Second published-GPS spring from the same feature (27°08.225' / 83°26.391'), 160 ft — a natural pair with Top Cap ~8 mi apart on the southern grounds.",
    sources: [{ name: "Florida Sportsman offshore springs feature", url: "https://www.floridasportsman.com/editorial/features_0901_fishing_gulf_of_mexico_offshore_springs/401487" }]
  }
];
