/* Venice, Louisiana — Mississippi Delta offshore data. Researched 2026-07-05.
   Rig coordinates cross-verified against CFR safety zones / NDBC / Wikipedia where marked A;
   B = single-source industry/AIS positions — verify on plotter before navigating.
   Distances shown in-app measure from the South Pass mouth (region distanceRef). */
(function () {
  "use strict";
  const R = "venice";

  window.DATA_SPOTS = (window.DATA_SPOTS || []).concat([
    /* ---------- THE LUMP & SHELF ---------- */
    {
      id: "midnight_lump", name: "Midnight Lump (Sackett Bank)", region: R, lat: 28.6354, lon: -89.5541,
      depth_ft: [206, 400], relief_ft: 200, type: "lump", grade: "A",
      species: { yellowfin_tuna: 5, wahoo: 5, blackfin_tuna: 4, mahi: 2, swordfish: 2 },
      notes: "The legend: a 2.9-sq-mi salt dome cresting ~206 ft from 400+, ~20 mi off SW Pass. Dec–Mar chum/chunk fishery for 150–250-lb yellowfin + big wahoo (7 of LA's top-10 yellowfin). Recent winters the giants often follow pogie schools 5–15 mi off the river instead — the Jan 2026 pending record was NOT on the Lump. Summer: sword/tilefish drops off its slopes.",
      sources: [{ name: "Louisiana Sportsman — the Midnight Lump", url: "https://www.louisianasportsman.com/fishing/inshore-fishing/finding-and-fishing-the-midnight-lump/" }]
    },
    {
      id: "wd143", name: "West Delta 143 (Shell complex)", region: R, lat: 28.6617, lon: -89.5514,
      depth_ft: [250, 400], relief_ft: 0, type: "oil_rig", grade: "A",
      species: { mangrove_snapper: 4, blackfin_tuna: 4, yellowfin_tuna: 3, wahoo: 3 },
      notes: "Shelf-edge platform 1.5 nm NE of the Midnight Lump (position from the USCG safety zone). One of the '12-mile rigs' (with SP62, WD93, WD152) — summer mangrove snapper circuit when the river cleans up (chum them up from 30 ft, freeline pogie chunks); winter blackfin/wahoo staging on the Lump run.",
      sources: [{ name: "33 CFR 147.807 (safety zone)", url: "https://www.ecfr.gov/current/title-33/chapter-I/subchapter-N/part-147/section-147.807" }]
    },
    {
      id: "lena_reef", name: "Lena Reef (toppled tower, MC280)", region: R, lat: 28.6627, lon: -89.1578,
      depth_ft: [1000, 1000], relief_ft: 300, type: "deep_drop", grade: "B",
      species: { swordfish: 4, blackfin_tuna: 4, yellowfin_tuna: 3, tilefish: 3 },
      notes: "ExxonMobil's 1,000-ft guyed tower, toppled in place 2020 — the Gulf's tallest deepwater artificial reef (no surface structure). Sits on the 1,000-ft contour SE of South Pass at the edge of the sword grounds. Verify position against LDWF reef list before navigating.",
      sources: [{ name: "Lena reefed in place", url: "https://www.offshore-mag.com/regional-reports/us-gulf-of-mexico/article/14185029/exxonmobils-lena-platform-jacket-reefed-in-the-gulf-of-mexico" }]
    },
    /* ---------- THE FLOATERS (summer yellowfin fleet) ---------- */
    {
      id: "medusa", name: "Medusa Spar (MC582)", region: R, lat: 28.3935, lon: -89.4665,
      depth_ft: [2223, 2223], relief_ft: 0, type: "oil_rig", grade: "B",
      species: { yellowfin_tuna: 5, blackfin_tuna: 4, mahi: 3, wahoo: 3, swordfish: 3 },
      notes: "Closest true floater to SW Pass (~35 mi) — the fleet's first stop. Live threadfin/pogies freelined at first light; chunk & jig in the light halo after dark.",
      sources: [{ name: "Medusa (industry listing)", url: "https://www.gem.wiki/Medusa_(MC582)" }]
    },
    {
      id: "mars", name: "Mars TLP (MC807)", region: R, lat: 28.1695, lon: -89.2229,
      depth_ft: [2940, 2940], relief_ft: 0, type: "oil_rig", grade: "A",
      species: { yellowfin_tuna: 5, blackfin_tuna: 4, mahi: 3, wahoo: 3, swordfish: 3 },
      notes: "Corner one of the Mars–Olympus–Ursa triangle (~52 mi from South Pass) — the core of the Venice summer yellowfin fishery. Fish the up-current side; hunt temp breaks/birds/rips BETWEEN the rigs rather than parking on one.",
      sources: [{ name: "Mars platform", url: "https://en.wikipedia.org/wiki/Mars_(oil_platform)" }]
    },
    {
      id: "olympus", name: "Olympus TLP (Mars B)", region: R, lat: 28.1599, lon: -89.2391,
      depth_ft: [3100, 3100], relief_ft: 0, type: "oil_rig", grade: "A",
      species: { yellowfin_tuna: 5, blackfin_tuna: 4, mahi: 3, wahoo: 3, swordfish: 3 },
      notes: "Shell's Mars B TLP ~1 nm SW of Mars — second big lit structure in the same drift.",
      sources: [{ name: "Olympus TLP", url: "https://en.wikipedia.org/wiki/Olympus_tension_leg_platform" }]
    },
    {
      id: "ursa", name: "Ursa TLP (MC809)", region: R, lat: 28.1539, lon: -89.1036,
      depth_ft: [3800, 3800], relief_ft: 0, type: "oil_rig", grade: "A",
      species: { yellowfin_tuna: 5, blackfin_tuna: 4, mahi: 3, wahoo: 3, swordfish: 3 },
      notes: "Third corner of the triangle, ~7 nm E of Mars (weather buoy 42365 on structure) — classic overnight anchor-up/chunk platform.",
      sources: [{ name: "Ursa TLP", url: "https://en.wikipedia.org/wiki/Ursa_tension_leg_platform" }]
    },
    {
      id: "who_dat", name: "Who Dat FPS (MC547)", region: R, lat: 28.4154, lon: -89.0162,
      depth_ft: [3200, 3200], relief_ft: 0, type: "oil_rig", grade: "B",
      species: { yellowfin_tuna: 5, blackfin_tuna: 4, mahi: 3, wahoo: 3, swordfish: 3 },
      notes: "LLOG semi ~40 mi from South Pass — one of the closest floaters on the EAST side and heavily fished. (Delta House FPS sits farther SE in MC254 — pull exact coords from BOEM before running.)",
      sources: [{ name: "Who Dat FPU", url: "https://www.offshore-mag.com/business-briefs/company-news/article/16755156/llog-deploys-novel-semisubmersible-fpu-for-who-dat-field" }]
    },
    {
      id: "devils_tower", name: "Devils Tower Spar (MC773)", region: R, lat: 28.2089, lon: -88.7375,
      depth_ft: [5610, 5610], relief_ft: 0, type: "oil_rig", grade: "A",
      species: { yellowfin_tuna: 5, blackfin_tuna: 4, mahi: 3, wahoo: 3, swordfish: 3 },
      notes: "Truss spar between Who Dat and Thunder Horse on the eastern floater run — long-time Venice yellowfin producer (~59 mi).",
      sources: [{ name: "Devils Tower spar", url: "https://en.wikipedia.org/wiki/Devil's_Tower_(oil_platform)" }]
    },
    {
      id: "thunder_horse", name: "Thunder Horse PDQ (MC778)", region: R, lat: 28.1908, lon: -88.4956,
      depth_ft: [6050, 6050], relief_ft: 0, type: "oil_rig", grade: "A",
      species: { yellowfin_tuna: 5, blackfin_tuna: 4, mahi: 3, wahoo: 3, swordfish: 3 },
      notes: "BP's giant — the largest semi in the Gulf, ~68 mi out. Marquee overnight tuna/marlin structure. (Research caught a transposed-digit position in one public source; this one is verified against the block description.)",
      sources: [{ name: "Louisiana Sportsman platform guide", url: "https://www.louisianasportsman.com/fishing/offshore-fishing/venice-offshore-platform-fishing/" }]
    },
    {
      id: "na_kika", name: "Na Kika FPS (MC474)", region: R, lat: 28.5210, lon: -88.2890,
      depth_ft: [6340, 6340], relief_ft: 0, type: "oil_rig", grade: "A",
      species: { yellowfin_tuna: 5, blackfin_tuna: 4, mahi: 3, wahoo: 3, swordfish: 3 },
      notes: "BP/Shell semi on the far eastern run (weather station KIKT on platform) — big yellowfin and blue marlin water on multi-day trips (~61 mi).",
      sources: [{ name: "Na Kika", url: "https://www.offshore-technology.com/projects/na_kika/" }]
    },
    {
      id: "blind_faith", name: "Blind Faith Semi (MC650)", region: R, lat: 28.3415, lon: -88.2657,
      depth_ft: [6500, 6500], relief_ft: 0, type: "oil_rig", grade: "B",
      species: { yellowfin_tuna: 4, blackfin_tuna: 4, mahi: 3, wahoo: 3, swordfish: 3 },
      notes: "Chevron deep-draft semi ~69 mi out on the eastern loop. (Cognac MC194 — the classic 1,025-ft fixed platform on the winter bait corridor — needs BOEM coords; a bad public listing duplicated Blind Faith's position for it.)",
      sources: [{ name: "LA Sportsman yellowfin hotspots", url: "https://www.louisianasportsman.com/fishing/yellowfin-hotspots/" }]
    },
    {
      id: "appomattox", name: "Appomattox Semi (MC392)", region: R, lat: 28.5734, lon: -87.9338,
      depth_ft: [7400, 7400], relief_ft: 0, type: "oil_rig", grade: "B",
      species: { yellowfin_tuna: 4, blackfin_tuna: 3, mahi: 3, wahoo: 3, swordfish: 3 },
      notes: "Shell's largest Gulf floater (2019), ~79 mi from South Pass — the practical range edge for a 35-mph day trip. Position from installation AIS; verify via BOEM.",
      sources: [{ name: "Appomattox", url: "https://www.offshore-technology.com/projects/appomattox-deepwater-development-gulf-of-mexico/" }]
    },
    {
      id: "horn_mountain", name: "Horn Mountain Spar (MC127)", region: R, lat: 28.8660, lon: -88.0562,
      depth_ft: [5400, 5400], relief_ft: 0, type: "oil_rig", grade: "A",
      species: { yellowfin_tuna: 4, blackfin_tuna: 4, mahi: 3, wahoo: 3 },
      notes: "Northeastern spar (USCG safety-zone position) — night jigging/chunking yellowfin; fished on the 'east side' loop with Ram Powell/Petronius/Marlin.",
      sources: [{ name: "USCG safety zone (position)", url: "https://www.federalregister.gov/documents/2023/04/11/2023-07594/safety-zone-horn-mountain-spar" }]
    },
    {
      id: "ram_powell", name: "Ram Powell TLP (VK956)", region: R, lat: 29.0600, lon: -88.0900,
      depth_ft: [3214, 3214], relief_ft: 0, type: "oil_rig", grade: "B",
      species: { yellowfin_tuna: 4, blackfin_tuna: 4, mahi: 3, wahoo: 3 },
      notes: "Viosca Knoll TLP ~64 mi out — 200-lb-class yellowfin, blue marlin and wahoo within casting distance of the structure. Position from the weather buoy mounted on it.",
      sources: [{ name: "Ram Powell", url: "https://www.offshore-technology.com/projects/rampowell/" }]
    },
    {
      id: "petronius", name: "Petronius Tower (VK786)", region: R, lat: 29.1083, lon: -87.9417,
      depth_ft: [1754, 1754], relief_ft: 0, type: "oil_rig", grade: "A",
      species: { blackfin_tuna: 5, yellowfin_tuna: 4, mahi: 3, wahoo: 3, mangrove_snapper: 2 },
      notes: "Compliant tower in 1,754 ft — shelf-edge depth makes it a BLACKFIN machine plus yellowfin/wahoo; morning jig bite. (The old 'Beer Can'/Neptune spar fished nearby was removed in 2023 — gone.)",
      sources: [{ name: "Petronius", url: "https://en.wikipedia.org/wiki/Petronius_(oil_platform)" }]
    }
  ]);

  window.DATA_ZONES = (window.DATA_ZONES || []).concat([
    {
      id: "ms_canyon_sword", name: "Mississippi Canyon daytime sword grounds", region: R, kind: "deep_drop",
      center: [28.6627, -89.1578], radius_mi: 12, depth_ft: [1000, 1800], grade: "C",
      species: { swordfish: 5, yellowfin_tuna: 3, blackfin_tuna: 3, tilefish: 3 },
      notes: "Canyon-edge trenches SE of South Pass — 1,000+ ft within ~15 mi of the passes (closest daytime sword grounds to any US marina). Drift one bait (squid/eel/bonito belly, lights) held ~100 ft off bottom in 1,200–1,800 ft; 8–10 lb leads; electrics standard. A 240-lb daytime fish came from ~1,500 ft in late May 2026. Band along the contour — center is the Lena reef.",
      sources: [{ name: "Venice daytime swords", url: "https://www.venicefishing.com/daytime-swordfish-charters-venice-la/" }]
    },
    {
      id: "tilefish_mud", name: "Tilefish mud (600–1,000 ft band)", region: R, kind: "deep_drop",
      center: [28.70, -89.20], radius_mi: 8, depth_ft: [600, 1000], grade: "C",
      species: { tilefish: 5, swordfish: 2 },
      notes: "Golden tilefish colonies in the soft mud 600–900 ft (yellowedge 600–750, snowy 750–900 mixed in); 10–20-lb midday feeders. Inshore of the sword grounds — same trip, shallower drops.",
      sources: [{ name: "MGFC tilefish", url: "https://www.mgfishing.com/fishing-venice-la/tilefish/" }]
    },
    {
      id: "floater_triangle", name: "Mars–Olympus–Ursa floater triangle", region: R, kind: "troll_corridor",
      center: [28.1695, -89.2229], radius_mi: 10, depth_ft: [2900, 3800], grade: "B",
      species: { yellowfin_tuna: 5, blackfin_tuna: 4, mahi: 3, wahoo: 3, swordfish: 3 },
      notes: "The core of the Venice summer yellowfin fishery: three giant lit TLPs inside a 10-mi circle, ~52–56 mi out. Live bait at first light, chunk/jig after dark, hunt the rips and temp breaks BETWEEN structures. Sword drops on the way home.",
      sources: [{ name: "LA Sportsman — Venice variety", url: "https://www.louisianasportsman.com/fishing/offshore-fishing/venice-offers-great-offshore-variety-this-month/" }]
    },
    {
      id: "pogie_corridor", name: "Winter pogie-school corridor (river mouth arc)", region: R, kind: "troll_corridor",
      center: [28.85, -89.25], radius_mi: 18, depth_ft: [150, 600], grade: "C",
      species: { yellowfin_tuna: 5, blackfin_tuna: 4, wahoo: 3 },
      notes: "Mid-Oct–Mar: giant yellowfin push to within 5–15 mi of the passes chasing menhaden — 'south of the river to just north of Cognac, all the way to the East Lump.' The pending 256-lb LA record (Jan 16, 2026) came from 300 ft ~12 mi off Venice ON A TOPWATER POPPER in this corridor. Fish the bait, not a waypoint.",
      sources: [{ name: "Pending record story", url: "https://www.louisianasportsman.com/fishing/offshore-fishing/tuna/angler-lands-new-pending-yellowfin-tuna-record/" }]
    }
  ]);

  window.DATA_REPORTS = (window.DATA_REPORTS || []).concat([
    {
      date: "2026-07-02", species: ["yellowfin_tuna", "mangrove_snapper", "mahi", "wahoo", "swordfish"], region: R,
      quality: "good", depth_ft: [60, 1800], port: "Venice",
      area: "Floaters & lumps (tuna) · nearshore rigs (mangroves) · shelf edge (swords)",
      details: "Peak-summer flat spell: seas under 1 ft, no tropics. Yellowfin at the floaters/lumps; mangrove snapper 'a reliable July producer' at nearshore rigs; mahi the bright spot for two months with weedlines/rips firing in slick water; daytime sword drifting viable all week. SST upper-80s; river low & clean (~2 ft).",
      zoneIds: ["floater_triangle", "ms_canyon_sword"], spotIds: ["medusa", "mars", "who_dat"],
      source: "Venice Fishing Report (weekly)", url: "https://www.venicefishingreport.com/p/five-snapper-for-the-fourth"
    },
    {
      date: "2026-06-11", species: ["yellowfin_tuna", "mahi", "wahoo", "swordfish"], region: R,
      quality: "good", depth_ft: [150, 1800], port: "Venice",
      area: "Floaters; morning mahi troll; shelf-edge sword drifts",
      details: "180-lb yellowfin June 1 (Paradise Outfitters); 8 mahi on a morning troll — 'best I've seen the mahi fishing in the last few years'; 55-lb wahoo; day-sword drifts resuming. River down to 1.5 ft, 83°F at the SW Pass buoy.",
      zoneIds: ["floater_triangle", "ms_canyon_sword"],
      source: "Venice Fishing Report (weekly)", url: "https://www.venicefishingreport.com/p/a-180-pound-yellowfin-and-the-door-back-open"
    },
    {
      date: "2026-05-28", species: ["yellowfin_tuna", "swordfish", "mangrove_snapper"], region: R,
      quality: "good", depth_ft: [60, 1500], port: "Venice",
      area: "Floaters + a 240-lb daytime sword from ~1,500 ft",
      details: "MGFC: 'nice tunas, a really solid sword' — 240-lb daytime broadbill on squid/eel with lights; snapper limits at nearshore rigs; river falling into the full moon.",
      zoneIds: ["ms_canyon_sword", "floater_triangle"],
      source: "Venice Fishing Report (weekly)", url: "https://www.venicefishingreport.com/p/five-fish-on-memorial-day-four-again-on-tuesday"
    },
    {
      date: "2026-07-01", species: ["yellowfin_tuna", "blackfin_tuna", "mahi", "wahoo"], region: R,
      quality: "good", depth_ft: [2200, 6500], port: "Venice",
      area: "Floating rigs 30–80 mi — overnight trips",
      details: "Overnight trips producing 25–50-lb-class yellowfin at the floaters (best early morning on live bait; watch temp breaks/birds/rips); mahi in numbers while running; some wahoo, a few blue marlin. Afternoon bite slow in the heat — go morning/night.",
      zoneIds: ["floater_triangle"], spotIds: ["thunder_horse", "devils_tower"],
      source: "FishingBooker Venice dailies", url: "https://fishingbooker.com/reports/destination/us/LA/venice"
    },
    {
      date: "2026-01-16", species: ["yellowfin_tuna"], region: R,
      quality: "limits", depth_ft: [300, 300], port: "Venice",
      area: "Pogie schools ~12 mi off the passes",
      details: "PENDING LA RECORD: 256-lb yellowfin (beats the 251-lb 2012 record) on a 7\" topwater popper — 200-lb-class fish smashing menhaden on the surface, 300 ft of water. The winter inshore-giant pattern in one story.",
      zoneIds: ["pogie_corridor"],
      source: "Louisiana Sportsman", url: "https://www.louisianasportsman.com/fishing/offshore-fishing/tuna/angler-lands-new-pending-yellowfin-tuna-record/"
    }
  ]);

  if (window.DATA_SCIENCE) {
    DATA_SCIENCE.seasonal_depth.push(
      { species: "yellowfin_tuna", months: [1, 12], depth_ft: [150, 7400], note: "Winter: lump/pogie corridor 150–600 ft; summer: floaters 2,200–7,400 ft" },
      { species: "blackfin_tuna", months: [1, 12], depth_ft: [150, 1800], note: "Shelf rigs & shelf-edge towers (Petronius) — Venice side" },
      { species: "wahoo", months: [12, 3], depth_ft: [150, 600], note: "Winter lump/shelf-edge high-speed; secondary June bump" }
    );
    DATA_SCIENCE.factors.push(
      { title: "Venice: fish the river line", detail: "The Mississippi plume builds a hard green-to-blue rip usually 20–30 mi out (closer when the river is low). Tuna/mahi/wahoo stack on the color change and the grass it collects; blackfin will even eat under a 2-ft muddy surface layer. High spring river = run farther/east for clean water; falling fall river = clean water AND giants within 5–15 mi of the passes.", sources: ["https://www.louisianasportsman.com/fishing/offshore-fishing/rip-lines-provide-lots-of-options-out-of-venice/"] },
      { title: "Full moon = soft daytime tuna bite (Venice)", detail: "Gulf yellowfin feed all night under a bright moon, so the dawn chunk bite goes quiet — around the full, grind midday, fish topwater/jigs at night, or book the overnight. New-moon weeks concentrate the daytime feed.", sources: ["https://www.360tuna.com/threads/moon-phases-and-tuna-fishing.9859/"] },
      { title: "Lump vs floaters decision", detail: "Dec–Mar: giants on the Midnight Lump and the pogie schools off the river (short runs). Apr–Nov: fleet scatters to the floaters 35–80 mi (Medusa closest). Recent winters the Lump has been hit-or-miss — follow the bait schools, not tradition.", sources: ["https://www.saltwatersportsman.com/travel/wintertime-tuna-fishing-off-venice-louisiana/"] },
      { title: "Why Venice holds tuna year-round", detail: "The delta dumps nutrients over a shelf that collapses into the Mississippi Canyon — 1,000+ ft within ~15 mi — and the rig field is a permanent lit FAD network from 60 to 7,400 ft. Bait meets deep water in one tide; that's the whole secret.", sources: ["https://lafishmag.com/louisiana-fishing/deep-sea-tuna-fishing-venice-louisiana-premier-gulf-coast/"] }
    );
    if (DATA_SCIENCE.watch) DATA_SCIENCE.watch.push(
      { region: "venice", name: "Venice Fishing Report (weekly, Thursdays)", url: "https://www.venicefishingreport.com/", what: "THE Venice pulse since Apr 2026 — river stage, seas windows, what the fleet caught. Scrapeable — auto-included in refreshes" },
      { region: "venice", name: "Mexican Gulf Fishing Co. — reports", url: "https://www.mgfishing.com/reports/", what: "The biggest Venice charter fleet's own report blog — tuna/sword/rig detail. Their Facebook posts daily catches: screenshot the good ones for Claude" },
      { region: "venice", name: "Paradise Outfitters reports", url: "https://www.paradise-outfitters.com/reports/", what: "Second big Venice fleet — yellowfin and mahi reports with sizes/areas" },
      { region: "venice", name: "Louisiana Sportsman — offshore", url: "https://www.louisianasportsman.com/fishing/offshore-fishing/", what: "Rig-by-rig features, records, seasonal patterns" },
      { region: "venice", name: "FishingBooker Venice dailies", url: "https://fishingbooker.com/reports/destination/us/LA/venice", what: "Aggregated multi-charter daily reports — volume play" }
    );
  }
})();
