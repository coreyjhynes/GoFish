/* Area-scale structure: natural bottom belts, HAPCs, no-take zones.
   Grades: A = official published boundary · B = multi-source · C = derived/approximate.
   avoid:true zones are NEVER recommended — rendered red as warnings. */
window.DATA_ZONES = [
  {
    id: "middle_grounds",
    name: "Florida Middle Grounds (HAPC)",
    kind: "hapc",
    polygon: [[28.7083, -84.4133], [28.7083, -84.2717], [28.1833, -84.0000], [28.1833, -84.1167], [28.4433, -84.4133]],
    center: [28.44, -84.23],
    depth_ft: [80, 160],
    grade: "A",
    species: { red_snapper: 5, vermilion_snapper: 5, mangrove_snapper: 5, gag_grouper: 4, scamp: 4, red_grouper: 4, lane_snapper: 3, amberjack: 4, gray_triggerfish: 4 },
    notes: "THE premier natural bottom on this coast: twin limestone ridges with 20–40+ ft relief, tops ~80 ft, valleys to 150 ft. ~85–95 mi from Hudson / ~80 mi WNW of Clearwater — a stretch beyond the 80-mi ring but the payoff trip. Hook-and-line legal; bottom longlines/traps banned (HAPC). Boundary shown is the official 50 CFR 622.74 polygon.",
    sources: [
      { name: "50 CFR 622.74 (boundary)", url: "https://www.ecfr.gov/current/title-50/chapter-VI/part-622/subpart-D/section-622.74" },
      { name: "NOAA HAPC map", url: "https://www.fisheries.noaa.gov/resource/map/florida-middle-grounds-hapc-fishery-management-area-map-gis-data" }
    ]
  },
  {
    id: "the_elbow",
    name: "The Elbow (shelf-bend ledges)",
    kind: "ledge_belt",
    center: [27.80, -84.28],
    radius_mi: 9,
    depth_ft: [150, 250],
    grade: "B",
    species: { red_snapper: 5, scamp: 5, vermilion_snapper: 4, amberjack: 4, gag_grouper: 3, mangrove_snapper: 3 },
    notes: "~20-mile ridge system at the bend in the shelf contours (USF C-SCAMP mapped), rock ledges to ~25 ft relief in 150–250 ft. Big red snapper, scamp and AJ water, ~85 mi out — pick a flat day. Exact numbers are sold by chart vendors; center is approximate, work the depth break.",
    sources: [
      { name: "USF 'Fishing the Elbow'", url: "https://www.marine.usf.edu/scamp/outreach/fishing-the-elbow/" }
    ]
  },
  {
    id: "steamboat_lumps",
    name: "⛔ Steamboat Lumps Marine Reserve — NO-TAKE",
    kind: "no_take",
    avoid: true,
    polygon: [[28.2333, -84.80], [28.2333, -84.6167], [28.05, -84.6167], [28.05, -84.80]],
    center: [28.14, -84.71],
    depth_ft: [180, 240],
    grade: "A",
    species: {},
    notes: "ALL reef fish fishing & possession PROHIBITED year-round (50 CFR 622.34). Sits just west of the 80-mi ring on the run toward the western grounds — do not bottom fish inside. Trolling for HMS (tuna/billfish) only.",
    sources: [
      { name: "50 CFR 622.34", url: "https://www.law.cornell.edu/cfr/text/50/622.34" },
      { name: "NOAA West FL MPAs", url: "https://www.fisheries.noaa.gov/southeast/sustainable-fisheries/west-florida-marine-protected-areas" }
    ]
  },
  {
    id: "swiss_cheese_belt",
    name: "Pasco–Hernando hard-bottom belt ('swiss cheese')",
    kind: "hard_bottom",
    polygon: [[28.45, -83.70], [28.45, -83.25], [28.00, -83.05], [28.00, -83.45]],
    center: [28.23, -83.36],
    depth_ft: [60, 130],
    grade: "C",
    species: { red_grouper: 5, gag_grouper: 3, mangrove_snapper: 3, lane_snapper: 4, red_snapper: 2, hogfish: 3 },
    notes: "Broad belt of flat potholed limestone running parallel to shore, 25–55 mi out of Hudson/Anclote. Red grouper live in the solution holes — it barely shows on sonar. Drift with baits down to find fish, then anchor. Keepers best 80–130 ft. Boundary is approximate (derived from depth contours + charter reports).",
    sources: [
      { name: "Florida Sportfishing — red grouper tactics", url: "https://www.floridasportfishing.com/inshore/red-grouper-tactics/article_df4bb91c-13b4-11ef-881f-d37d62033f27.html" }
    ]
  },
  {
    id: "anclote_ledges",
    name: "Anclote / Tarpon Springs ledge belt",
    kind: "ledge_belt",
    center: [28.16, -82.95],
    radius_mi: 7,
    depth_ft: [36, 80],
    grade: "C",
    species: { gag_grouper: 4, red_grouper: 3, mangrove_snapper: 3, hogfish: 3, lane_snapper: 3 },
    notes: "N–S limestone ledges with 1–12 ft relief in 36–60 ft, hard bottom out to ~80 ft. Inside the 20-mi ring (10–15 mi out) — the close option when weather pins you down, and the classic cool-season gag staging ground (season permitting).",
    sources: [
      { name: "Spearfishing the ledges of Tarpon Springs", url: "https://www.onshoreoffshore.com/spearfishing-the-ledges-of-tarpon-springs/" }
    ]
  },
  {
    id: "fathom21",
    name: "21-Fathom Ledge area",
    kind: "ledge_belt",
    center: [27.75, -83.55],
    radius_mi: 8,
    depth_ft: [100, 135],
    grade: "C",
    species: { red_snapper: 5, red_grouper: 5, gag_grouper: 4, amberjack: 4, vermilion_snapper: 4, mangrove_snapper: 4, scamp: 3 },
    notes: "Limestone shelf edge ~50–60 mi W of St. Pete where the bottom steps from ~100 to 130+ ft — a named 2026 hotspot that concentrates red snapper, grouper and AJ. Heavily reported by Madeira/John's Pass boats all spring 2026 (red grouper 'huge numbers' on the potholes/ledges 120–140 ft). Center approximate — run the depth break and watch the machine.",
    sources: [
      { name: "SaltwaterPros St. Pete offshore", url: "https://saltwaterpros.com/florida/st-petersburg/charters/offshore" },
      { name: "Hubbard's Marina weekly reports", url: "https://www.hubbardsmarina.com/fishing-reports/" }
    ]
  },
  {
    id: "clearwater_90_105",
    name: "Clearwater 90–105 ft hard bottom (June '26 hot)",
    kind: "hard_bottom",
    center: [27.95, -83.32],
    radius_mi: 7,
    depth_ft: [90, 105],
    grade: "C",
    species: { red_snapper: 5, red_grouper: 4, gag_grouper: 3, mangrove_snapper: 3, lane_snapper: 3 },
    notes: "June 2026: charters report 'large groups of red snapper and grouper holding in 90–105 ft' W of Clearwater/Indian Rocks — 6-hour boats limiting out fast on live pinfish and grass grunts. ~28–34 mi out. Area approximate from depth band.",
    sources: [
      { name: "Clearwater Beach Fishing Charter reports", url: "https://clearwaterbeachfishingcharter.com/fishing-reports/" }
    ]
  },
  {
    id: "gulfstream_pipeline",
    name: "Gulfstream gas pipeline (36\") — reference line",
    kind: "pipeline",
    line: [[28.975, -85.664], [28.275, -84.719], [28.239, -84.612], [28.153, -84.543], [27.577, -83.095], [27.580, -82.856], [27.560, -82.777], [27.609, -82.646], [27.643, -82.597], [27.636, -82.575]],
    center: [27.90, -83.80],
    grade: "A",
    species: {},
    notes: "The Gulfstream Natural Gas System 36\" line (BOEM segment G21459, active) — Mobile Bay to Port Manatee. Route from BOEM's official pipeline layer. Charted reference: 'north of the pipeline' = the Hudson pothole/swiss-cheese corridor. The buried line itself is not structure — but it's the landmark the fleet navigates by.",
    sources: [{ name: "BOEM OCS pipelines layer", url: "https://gis.boem.gov/arcgis/rest/services/BOEM_BSEE/GOA_Layers/MapServer/2" }]
  },
  {
    id: "hudson_potholes",
    name: "Hudson pothole grounds (95–120 ft, computed)",
    kind: "hard_bottom",
    // Band footprint traced from NOAA DEM sampling (0.02° grid, 2026-07-05):
    // the 95–120 ft corridor west of Hudson — keeper red grouper pothole water.
    polygon: [[28.20, -84.06], [28.24, -84.14], [28.28, -84.10], [28.32, -84.16], [28.36, -84.16], [28.40, -84.22], [28.44, -84.28], [28.48, -84.30], [28.50, -84.24], [28.50, -83.72], [28.44, -83.70], [28.36, -83.72], [28.28, -83.70], [28.20, -83.70]],
    center: [28.36, -83.95],
    depth_ft: [95, 120],
    grade: "C",
    species: { red_grouper: 5, red_snapper: 4, lane_snapper: 3, mangrove_snapper: 3, vermilion_snapper: 2 },
    notes: "'The potholes' aren't one waypoint — they're the solution holes red grouper excavate in the flat swiss-cheese limestone, and this is where that bottom sits in keeper depth W of Hudson: ~62–86 mi out (checkpoint: 80 mi due west = ~121 ft). Individual potholes are yards wide — invisible to any chart, including this one — so run the band and DRIFT-AND-MARK: baits down while covering ground, waypoint every bite, then anchor the marks. Hubbard's reports hammer this pattern ('huge numbers of red grouper on the potholes'). Western/deep edge brushes 120 ft — mind the Feb 1–Mar 31 >20-fathom grouper closure there.",
    sources: [
      { name: "NOAA NCEI DEM (band computed)", url: "https://gis.ngdc.noaa.gov/arcgis/rest/services/DEM_mosaics/DEM_all/ImageServer" },
      { name: "Hubbard's Marina pothole reports", url: "https://www.hubbardsmarina.com/hubbards-marina-fishing-reports/" }
    ]
  },

  /* ---------- BAY SCALLOP HARVEST ZONES (2026 seasons — official FWC dates, boundaries landmark-based/approximate) ---------- */
  {
    id: "scallop_pasco",
    name: "Pasco Scallop Zone (Anclote → Aripeka)",
    kind: "scallop_zone",
    // Legal shape: due-west line at Anclote Key Lighthouse (28.1667°N), due-west line at the
    // Hernando–Pasco county line (28.4330°N), coastline inside, ~9-nm state-waters limit outside.
    polygon: [
      [28.1667, -83.02], [28.25, -82.99], [28.33, -82.94], [28.4330, -82.84],  // seaward edge S→N
      [28.4330, -82.665],                                                        // county line in to the coast
      [28.39, -82.695], [28.36, -82.703], [28.30, -82.735], [28.25, -82.755], [28.21, -82.775], [28.1667, -82.79] // coast N→S
    ],
    center: [28.30, -82.83],
    depth_ft: [3, 8],
    grade: "B",
    season: { start: "2026-07-10", end: "2026-08-18" },
    species: { bay_scallop: 4 },
    notes: "HOME ZONE — all state waters from Anclote Key Lighthouse north to the Hernando–Pasco line (incl. the Anclote River). 2026 season Jul 10 – Aug 18. 2 gal whole/person (1 pt meat), 10 gal/vessel; hand or dip net; divers-down flag required. Quieter than Citrus. ⚠ TOXIN HISTORY: FWC closed this zone mid-season 2025 (Pyrodinium/saxitoxin, Aug 6) and reopened with a muscle-only advisory — check FWC for closures before every Pasco trip.",
    sources: [
      { name: "FWC Bay Scallops (2026 seasons & rules)", url: "https://myfwc.com/fishing/saltwater/recreational/bay-scallops/" },
      { name: "FWC 2025 Pasco toxin closure", url: "https://myfwc.com/news/all-news/pasco-scallop-825/" }
    ]
  },
  {
    id: "scallop_citrus",
    name: "Levy–Citrus–Hernando Scallop Zone (Aripeka → Suwannee)",
    kind: "scallop_zone",
    // County line (28.4330°N) north to Alligator Pass daybeacon #4 at the Suwannee (≈29.276°N);
    // real coast inside (Bayport, Chass, Homosassa, Crystal, Withlacoochee, Cedar Key), ~9-nm limit outside.
    polygon: [
      [28.4330, -82.84], [28.55, -82.85], [28.70, -82.87], [28.90, -82.91], [29.05, -83.00], [29.13, -83.22], [29.276, -83.27], // seaward S→N
      [29.276, -83.10],                                                                                                          // Alligator Pass line to the sound
      [29.13, -83.03], [29.05, -82.83], [29.00, -82.76], [28.92, -82.70], [28.83, -82.68], [28.77, -82.665], [28.69, -82.64], [28.56, -82.648], [28.4330, -82.665] // coast N→S
    ],
    center: [28.80, -82.78],
    depth_ft: [3, 10],
    grade: "B",
    season: { start: "2026-07-01", end: "2026-09-24" },
    species: { bay_scallop: 5 },
    notes: "OPEN NOW (Jul 1 – Sep 24, 2026). Hernando–Pasco line north to Alligator Pass daybeacon #4 at the Suwannee — includes Bayport/Pine Island (yes, HERNANDO IS OPEN — folded into this zone), Chassahowitzka, Homosassa, Crystal River and Cedar Key. Healthy seagrass and solid numbers reported into the 2026 opener. Standard 2 gal/person, 10 gal/vessel limits.",
    sources: [
      { name: "FWC Bay Scallops (2026 seasons & rules)", url: "https://myfwc.com/fishing/saltwater/recreational/bay-scallops/" },
      { name: "Citrus County Chronicle — 2026 opener", url: "https://www.chronicleonline.com/news/local/boaters-flood-nature-coast-as-scallop-season-opens/article_fe933ffc-36ad-58dc-9100-7f748d5c1c5d.html" }
    ]
  },
  {
    id: "scallop_steinhatchee",
    name: "Fenholloway–Suwannee Scallop Zone (Steinhatchee)",
    kind: "scallop_zone",
    // Alligator Pass daybeacon #4 (≈29.276°N) north to Rock Island at the Fenholloway (≈29.973°N);
    // coast inside (Horseshoe, Pepperfish, Steinhatchee, Keaton), ~9-nm limit outside.
    polygon: [
      [29.276, -83.27], [29.44, -83.46], [29.55, -83.55], [29.67, -83.57], [29.82, -83.75], [29.973, -83.83], // seaward S→N
      [29.973, -83.655],                                                                                        // Rock Island line to the coast
      [29.82, -83.58], [29.67, -83.39], [29.55, -83.38], [29.44, -83.29], [29.276, -83.10]                     // coast N→S
    ],
    center: [29.62, -83.47],
    depth_ft: [3, 8],
    grade: "B",
    season: { start: "2026-06-15", end: "2026-09-07" },
    species: { bay_scallop: 5 },
    notes: "The most consistently productive scallop region in recent years — Steinhatchee, Keaton Beach, Pepperfish Keys. 2026: Jun 15 – Sep 7 (Labor Day); REDUCED bag Jun 15–30 (1 gal/person, 5 gal/vessel), standard limits from Jul 1. A road trip from Hudson (~2 hr trailer), not a boat run. Heavy rain crashes clarity here — fish between rain events.",
    sources: [
      { name: "FWC Bay Scallops (2026 seasons & rules)", url: "https://myfwc.com/fishing/saltwater/recreational/bay-scallops/" },
      { name: "Steinhatchee 2026 reports", url: "https://www.outdoorupdate.com/steinhatchee-fishing-scalloping-report-its-all-about-the-scallops-now/" }
    ]
  },
  {
    id: "red_snapper_band",
    name: "Outer-shelf red snapper band (110–160 ft)",
    kind: "ledge_belt",
    polygon: [[27.70, -83.50], [27.70, -84.15], [28.45, -84.50], [28.45, -84.00]],
    center: [28.08, -84.05],
    depth_ft: [110, 160],
    grade: "C",
    species: { red_snapper: 5, vermilion_snapper: 4, scamp: 3, mangrove_snapper: 3, red_grouper: 3, lane_snapper: 2 },
    notes: "The depth corridor where summer red snapper stack off this coast — scattered ledges, rockpiles and swiss cheese between the 110 and 160 ft contours, ~55–85 mi out. Derived from depth profiles + 2026 charter reports; work bottom marks, not blind drops.",
    sources: [
      { name: "USF C-SCAMP shelf mapping", url: "https://www.marine.usf.edu/scamp/" }
    ]
  }
];
