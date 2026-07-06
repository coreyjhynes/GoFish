/* Florida Keys — humps, wrecks, sword grounds, trolling corridors. Researched 2026-07-05.
   HOME PORT: Marathon. Coordinates from published sources (fishmasters, NOAA FKNMS
   shipwreck trail, SWS) — sources vary by ~0.05'; treat as arrival waypoints, find it on sonar. */
(function () {
  "use strict";
  const R = "keys";

  window.DATA_SPOTS = (window.DATA_SPOTS || []).concat([
    /* ---------- MARATHON (home water) ---------- */
    {
      id: "marathon_hump", name: "Marathon Hump (West Hump)", region: R, lat: 24.42547, lon: -80.75547,
      depth_ft: [480, 1100], relief_ft: 620, type: "lump", grade: "A",
      species: { blackfin_tuna: 5, amberjack: 4, mahi: 3, wahoo: 3, swordfish: 2 },
      notes: "THE home-water seamount: crest ~480–516 ft rising from ~1,100, 26 mi SE of Marathon on the Gulf Stream edge. Blackfin year-round (biggest in summer), skipjack all summer, blue marlin shot late May–Jun on live football tuna. FISH THE UP-CURRENT (S/SW) EDGE — run ¼–½ mi up-current and drift back over the crest. First light beats the fleet; summer sharks ('the taxman') will tax chum-line fish — move or switch to jigs. Queen snapper/snowy/tilefish on the deep flanks.",
      sources: [{ name: "Marathon Hump GPS (published)", url: "https://fishmasters.com/marathon-hump-gps-coordinates/" }, { name: "SWS — It's Hump Day", url: "https://www.saltwatersportsman.com/species/fish-species/it-s-hump-day/" }]
    },
    {
      id: "carlsons_humps", name: "Carlson's Two Humps", region: R, lat: 24.41850, lon: -81.06108,
      depth_ft: [600, 900], relief_ft: 100, type: "deep_drop", grade: "A",
      species: { amberjack: 3, blackfin_tuna: 2, tilefish: 4 },
      notes: "~600 ft rises 20 mi S of Marathon — the deep-drop stop (queen snapper, groupers, tiles) on the way to/from the Hump or sword grounds.",
      sources: [{ name: "Keys humps GPS list", url: "https://www.florida-keys-vacation.com/Florida-Keys-Humps.html" }]
    },
    {
      id: "thunderbolt", name: "Thunderbolt (wreck)", region: R, lat: 24.66105, lon: -80.96307,
      depth_ft: [75, 120], relief_ft: 45, type: "wreck", grade: "A",
      species: { amberjack: 4, blackfin_tuna: 2, mangrove_snapper: 3 },
      notes: "188-ft cable layer upright in ~120 ft, 5 mi SE of Marathon — the famous permit wreck; AJs on the structure. Buoyed FKNMS dive site: no anchoring on the wreck, expect dive boats midday.",
      sources: [{ name: "NOAA Shipwreck Trail", url: "https://floridakeys.noaa.gov/shipwrecktrail/thunderbolt.html" }]
    },
    {
      id: "sombrero_light", name: "Sombrero Key Light (reef edge)", region: R, lat: 24.62341, lon: -81.10696,
      depth_ft: [6, 120], relief_ft: 0, type: "reef_light", grade: "A",
      species: { mahi: 2, wahoo: 3, yellowtail_snapper: 4, mangrove_snapper: 3, hogfish: 3 },
      notes: "Marathon's reef-edge landmark en route to the Hump — winter sails/kings, cero, yellowtail on the edge. Sombrero SPA is NO-TAKE inside the yellow buoys; troll the outside edge/color change.",
      sources: [{ name: "Sombrero Key Light", url: "https://en.wikipedia.org/wiki/Sombrero_Key_Light" }]
    },
    {
      id: "hump_409", name: "409 Hump", region: R, lat: 24.59167, lon: -80.59167,
      depth_ft: [409, 800], relief_ft: 390, type: "lump", grade: "A",
      species: { amberjack: 5, blackfin_tuna: 4, mahi: 3, wahoo: 2 },
      notes: "Crest 409 ft from ~800 (hence the name; '408' in some 2026 reports) — 15 mi SE of Long Key, ~30 mi from Marathon. THE standout summer amberjack hump; blackfin excellent May–Jul. NOT the same seamount as the Islamorada Hump.",
      sources: [{ name: "409 Hump GPS (published)", url: "https://fishmasters.com/409-hump-gps-coordinates/" }]
    },
    /* ---------- ISLAMORADA / UPPER KEYS ---------- */
    {
      id: "islamorada_hump", name: "Islamorada Hump", region: R, lat: 24.80292, lon: -80.44457,
      depth_ft: [290, 700], relief_ft: 300, type: "lump", grade: "A",
      species: { blackfin_tuna: 5, amberjack: 4, mahi: 3, wahoo: 2 },
      notes: "Crest ~290 ft from 500–700, 13 mi SE of Islamorada (45-min run from Bud n Mary's). Blackfin year-round, best Feb–Jun & Sep–Oct; live-pilchard chum beats trolling; vertical jigs when marks sit 100–300 ft down. Early Jul 2026: crest carpeted in sargassum — trolling fouled, chum/jig the answer. Heavy weekend fleet.",
      sources: [{ name: "Islamorada Hump GPS (published)", url: "https://fishmasters.com/islamorada-hump-gps-coordinates/" }]
    },
    {
      id: "eagle_wreck", name: "Eagle (wreck)", region: R, lat: 24.86967, lon: -80.57017,
      depth_ft: [70, 110], relief_ft: 40, type: "wreck", grade: "A",
      species: { amberjack: 4, mangrove_snapper: 3, yellowtail_snapper: 3 },
      notes: "287-ft freighter in 110 ft, 6 mi off Lower Matecumbe, ~3 mi NE of Alligator Light — natural first stop heading offshore. Cubera and kings too.",
      sources: [{ name: "Eagle wreck", url: "https://www.florida-keys-vacation.com/Eagle-Wreck.html" }]
    },
    {
      id: "alligator_light", name: "Alligator Reef Light (reef edge)", region: R, lat: 24.85179, lon: -80.61885,
      depth_ft: [8, 150], relief_ft: 0, type: "reef_light", grade: "A",
      species: { mahi: 2, wahoo: 3, yellowtail_snapper: 4, mangrove_snapper: 3, hogfish: 3 },
      notes: "Primary Islamorada trolling landmark — reef drops fast SE of the light; Jun 2026 weedlines held just north of it. Alligator SPA = no-take inside the buoys; work the outside edge.",
      sources: [{ name: "Alligator Reef Light", url: "https://en.wikipedia.org/wiki/Alligator_Reef_Light" }]
    },
    {
      id: "duane", name: "USCGC Duane (wreck)", region: R, lat: 24.98967, lon: -80.38200,
      depth_ft: [70, 120], relief_ft: 50, type: "wreck", grade: "A",
      species: { amberjack: 4, yellowtail_snapper: 3, mangrove_snapper: 3 },
      notes: "327-ft cutter upright in 120 ft, 1 mi S of Molasses Reef (Key Largo). Sister ship Bibb lies on her side in ~130 ft just NE (24.99517, -80.37950) — deeper, fewer divers. Both buoyed FKNMS dive sites.",
      sources: [{ name: "NOAA Shipwreck Trail", url: "https://floridakeys.noaa.gov/shipwrecktrail/duane.html" }]
    },
    {
      id: "key_largo_hump", name: "Key Largo Hump", region: R, lat: 25.01102, lon: -80.28000,
      depth_ft: [280, 330], relief_ft: 50, type: "lump", grade: "A",
      species: { blackfin_tuna: 3, amberjack: 3, mahi: 3 },
      notes: "S-curve rise ~12 mi off Key Largo near French Reef; the least-famous hump — decent blackfin/AJ with far less pressure.",
      sources: [{ name: "Keys humps GPS list", url: "https://www.florida-keys-vacation.com/Florida-Keys-Humps.html" }]
    },
    /* ---------- LOWER KEYS / KEY WEST ---------- */
    {
      id: "adolphus_busch", name: "Adolphus Busch Sr (wreck)", region: R, lat: 24.53068, lon: -81.46147,
      depth_ft: [40, 110], relief_ft: 70, type: "wreck", grade: "A",
      species: { amberjack: 4, mangrove_snapper: 3, gag_grouper: 3 },
      notes: "210-ft freighter upright in ~110 ft, 5.5 mi SW of Big Pine, 3 mi W of Looe Key. Looe Key SPA is NO-TAKE — stay outside the buoys.",
      sources: [{ name: "Adolphus Busch", url: "https://www.florida-keys-vacation.com/Adolphus-Busch-Sr.html" }]
    },
    {
      id: "american_shoal", name: "American Shoal Light (reef edge)", region: R, lat: 24.52174, lon: -81.51831,
      depth_ft: [6, 120], relief_ft: 0, type: "reef_light", grade: "A",
      species: { wahoo: 3, mahi: 2, yellowtail_snapper: 4, mangrove_snapper: 3 },
      notes: "Lower-Keys reef-edge landmark — classic winter sail/wahoo edge, jump-off to the deeper lower-Keys ledges.",
      sources: [{ name: "American Shoal Light", url: "https://lighthousefriends.com/light.asp?ID=700" }]
    },
    {
      id: "vandenberg", name: "USNS Vandenberg (wreck)", region: R, lat: 24.45273, lon: -81.72657,
      depth_ft: [45, 165], relief_ft: 100, type: "wreck", grade: "A",
      species: { amberjack: 4, blackfin_tuna: 3, mangrove_snapper: 3 },
      notes: "524-ft missile tracker, 7 mi S of Key West — superstructure ~45–50 ft, hull to ~165 post-Irma. Permit, bonito, cudas thick. Constant dive traffic on the buoys: fish dawn or the perimeter.",
      sources: [{ name: "Vandenberg", url: "https://keywest.com/vandenberg/about/" }]
    },
    {
      id: "uss_curb", name: "USS Curb (deep wreck)", region: R, lat: 24.43687, lon: -81.76878,
      depth_ft: [130, 185], relief_ft: 50, type: "wreck", grade: "A",
      species: { amberjack: 5, mangrove_snapper: 3, gag_grouper: 3 },
      notes: "183-ft salvage tug in 185 ft just S of the Cayman Salvager (24.45350, -81.76633, 90 ft) — below sport-dive depth so it fishes bigger: AJs, big muttons, grouper.",
      sources: [{ name: "KW wrecks GPS table", url: "https://key-west-fishing.link/florida-keys-wrecks-gps.htm" }]
    },
    {
      id: "wilkes_barre", name: "USS Wilkes-Barre (deep wreck)", region: R, lat: 24.47443, lon: -81.55000,
      depth_ft: [140, 250], relief_ft: 100, type: "wreck", grade: "A",
      species: { amberjack: 5, blackfin_tuna: 4, wahoo: 3, gag_grouper: 3 },
      notes: "608-ft WWII cruiser in two pieces, 140–250 ft, ~17 mi ESE of Key West. Tech-dive only, so pressure is low — AJs/blackfin/wahoo stack in the column above her.",
      sources: [{ name: "Wilkes-Barre", url: "https://www.florida-keys-vacation.com/Wilkes-Barre.html" }]
    },
    {
      id: "sand_key_light", name: "Sand Key Light (reef edge)", region: R, lat: 24.45233, lon: -81.87316,
      depth_ft: [6, 120], relief_ft: 0, type: "reef_light", grade: "A",
      species: { wahoo: 4, mahi: 3, yellowtail_snapper: 4 },
      notes: "6–7 nm SW of Key West — the classic start of the KW offshore troll; the outer bar runs ~20 mi W to Cosgrove Shoal ('End of the Bar'). Sand Key SPA no-take inside buoys; dolphin water starts just outside in 400 ft+.",
      sources: [{ name: "Sand Key Light", url: "https://en.wikipedia.org/wiki/Sand_Key_Light" }]
    }
  ]);

  window.DATA_ZONES = (window.DATA_ZONES || []).concat([
    {
      id: "marathon_sword", name: "Marathon daytime sword grounds", region: R, kind: "deep_drop",
      center: [24.35, -80.70], radius_mi: 10, depth_ft: [1200, 2000], grade: "C",
      species: { swordfish: 5, tilefish: 3 },
      notes: "A few miles outside the Marathon Humps — day drops in 1,200–2,000 ft, fish 100–700 lb. ~30 mi SE of Marathon the bottom passes 1,800 ft. Expect 2–4 kn of Stream: 8–12 lb leads, one bait down. Center approximate (public sources describe corridors, not numbers).",
      sources: [{ name: "Main Attraction — daytime swords", url: "https://mainattraction.org/florida-keys-daytime-swordfish-charters/" }, { name: "Keys Weekly", url: "https://keysweekly.com/42/the-action-is-at-the-humps-in-the-middle-keys/" }]
    },
    {
      id: "marathon_mahi", name: "Marathon mahi corridor", region: R, kind: "troll_corridor",
      center: [24.50, -80.90], radius_mi: 15, depth_ft: [600, 2000], grade: "C",
      species: { mahi: 5, blackfin_tuna: 3, wahoo: 2 },
      notes: "SE of Sombrero toward and past the 409/West Humps — weedlines, birds, color change in 600–2,000 ft. May–Jul 2026: mahi stacked on the weeds with blackfin mixed at the humps. Summer: leave at first light, run-and-gun to frigates.",
      sources: [{ name: "Captain Hook's Marathon conditions", url: "https://captainhooks.com/daily-fishing-conditions-marathon-fl/" }]
    },
    {
      id: "islamorada_sword", name: "Islamorada daytime sword grounds", region: R, kind: "deep_drop",
      center: [24.62, -80.34], radius_mi: 12, depth_ft: [1400, 1900], grade: "C",
      species: { swordfish: 5, tilefish: 3 },
      notes: "Birthplace of US daytime swordfishing (Stanczyk/Bud n Mary's, 2003): ledges along the 1,500-ft contour 20–45 mi SE ('Rat Hole' drops 1,500–1,700). Early-Jul 2026 day bite stayed consistent through the full moon. Night version runs closer: 1,200–1,800 ft, drift lighted squid 100–800 ft down, dark moons best (May–Nov).",
      sources: [{ name: "Bud n Mary's daytime swordfishing", url: "https://www.budnmarys.com/specialty-fishing/daytime-swordfishing/" }]
    },
    {
      id: "islamorada_mahi", name: "Islamorada mahi corridor", region: R, kind: "troll_corridor",
      center: [24.72, -80.47], radius_mi: 15, depth_ft: [600, 2000], grade: "C",
      species: { mahi: 5, wahoo: 2, blackfin_tuna: 2 },
      notes: "Clear the reef at Alligator Light, start looking 150–300 ft, work 600–2,000 ft. July 2026 reality: scattered weed ~800 ft, action 900–950, the REAL clean-edge weedline at 1,200 ft ~25 mi out (bulls taken 7/1).",
      sources: [{ name: "DirtyBoat reports", url: "https://www.dirtyboat.com/reports/" }]
    },
    {
      id: "kw_corridor", name: "Key West corridor (Sand Key → End of the Bar)", region: R, kind: "troll_corridor",
      center: [24.32, -81.90], radius_mi: 18, depth_ft: [300, 2000], grade: "C",
      species: { mahi: 5, wahoo: 4, blackfin_tuna: 3 },
      notes: "From Sand Key the outer bar runs ~20 mi W to Cosgrove Shoal (24°27.5'N 82°11.2'W) — troll the bar edge, then work S into 400–2,000 ft. Winter (Nov–Feb) is wahoo time, best ±4 days of full/new moons at 12–16 kt.",
      sources: [{ name: "ROFFS — KW winter wahoo", url: "https://roffs.com/2021/02/winter-wahoo-fishing-in-key-west/" }]
    },
    {
      id: "woods_wall", name: "Woods Wall", region: R, kind: "ledge_belt",
      center: [24.22, -81.58], radius_mi: 10, depth_ft: [450, 3000], grade: "C",
      species: { mahi: 4, wahoo: 4, blackfin_tuna: 4, swordfish: 3 },
      notes: "The wall ~20 nm S of the Lower Keys, dropping 400 → 1,000–3,000 ft (published point: 'east crack' 24°13.15'N 81°29.75'W). KW's marlin/wahoo/big-mahi wall and the lower-Keys sword jump-off.",
      sources: [{ name: "Woods Wall (published point)", url: "https://fishingstatus.com/fishing/details/IndexID/1231937" }]
    },
    {
      id: "western_dry_rocks", name: "⛔ Western Dry Rocks — CLOSED Apr 1–Jul 31", region: R, kind: "no_take", avoid: true,
      center: [24.4450, -81.9260], radius_mi: 0.6, depth_ft: [10, 120], grade: "A",
      species: {},
      notes: "ALL fishing prohibited inside the marked ~1-sq-mi boundary April 1 – July 31 every year (multi-species spawning protection) — ACTIVE for July trips. Transit with stowed gear allowed. Also remember: FKNMS Sanctuary Preservation Areas (Alligator, Sombrero, Sand Key, Looe Key…) are no-fishing inside the yellow buoys year-round.",
      sources: [{ name: "FWC — Western Dry Rocks", url: "https://myfwc.com/fishing/saltwater/recreational/wdr/" }]
    }
  ]);

  window.DATA_REPORTS = (window.DATA_REPORTS || []).concat([
    {
      date: "2026-07-05", species: ["mahi", "swordfish", "blackfin_tuna"], region: R,
      quality: "good", depth_ft: [900, 1400], port: "Islamorada",
      area: "The 1,200-ft clean-edge weedline ~25 mi out; humps carpeted in sargassum",
      details: "Bull mahi in 1,200 ft on 'the real weedline — clean edge, deep blue outside'; scattered weed ~800 ft with action 900–950. Islamorada Hump top covered in weed (troll fouled — chum/jig instead). Day-sword bite consistent through the full moon. Vaca Key water 90.7°F — dawn is everything.",
      zoneIds: ["islamorada_mahi", "islamorada_sword", "marathon_mahi"], spotIds: ["islamorada_hump"],
      source: "DirtyBoat charter reports (Jul 1–5)", url: "https://www.dirtyboat.com/reports/"
    },
    {
      date: "2026-06-30", species: ["mahi", "wahoo", "blackfin_tuna"], region: R,
      quality: "good", depth_ft: [300, 2000], port: "Key West",
      area: "KW offshore — variety day",
      details: "Mahi plus a mix of wahoo, blackfin arriving, sails on the prowl; kings/cudas/bonita in the mix on the edge.",
      zoneIds: ["kw_corridor", "woods_wall"],
      source: "Saltwater Angler KW report", url: "https://saltwaterangler.com/key-west-fishing-report/"
    },
    {
      date: "2026-05-24", species: ["mahi", "blackfin_tuna", "wahoo"], region: R,
      quality: "good", depth_ft: [400, 1100], port: "Marathon",
      area: "408/409 and West Hump — moderate Stream flow",
      details: "Hump trips boxing dolphin + blackfin ('hitting just about anything, decent sizes'); moderate Gulf Stream flow called ideal. Offshore bite building toward the summer peak.",
      zoneIds: ["marathon_mahi"], spotIds: ["marathon_hump", "hump_409"],
      source: "Captain Hook's Marathon", url: "https://captainhooks.com/daily-fishing-conditions-marathon-fl/"
    },
    {
      date: "2026-05-06", species: ["mahi", "blackfin_tuna", "wahoo", "yellowtail_snapper"], region: R,
      quality: "good", depth_ft: [90, 2000], port: "Keys-wide",
      area: "First big mahi push; KW fish to 35 lb",
      details: "First substantial mahi push upper Keys; large mahi at Marathon; KW mahi to 35 lb off weed piles + wahoo to 40 lb; humps giving smaller blackfin + skipjack; yellowtail strong in 90+ ft.",
      zoneIds: ["marathon_mahi", "islamorada_mahi", "kw_corridor"], spotIds: ["marathon_hump"],
      source: "fishingfloridakeys.com roundup", url: "https://www.fishingfloridakeys.com/florida-keys-fishing-report-may-2026/"
    },
    {
      date: "2026-03-27", species: ["wahoo", "mahi"], region: R,
      quality: "good", depth_ft: [120, 600], port: "Islamorada",
      area: "Reef edge — Stream only 15 mi off Alligator Light",
      details: "'Offshore action electric': wahoo on high-speed past the edge; sails steady Alligator–Tennessee; early mahi on the weedlines. 'When the Stream is that close, the bite gets stupid good.'",
      zoneIds: ["islamorada_mahi"], spotIds: ["alligator_light"],
      source: "Keys Weekly column", url: "https://keysweekly.com/42/florida-keys-fishing-report-the-offshore-action-is-electric/"
    }
  ]);

  /* seasonal depth + science + watch additions */
  if (window.DATA_SCIENCE) {
    DATA_SCIENCE.seasonal_depth.push(
      { species: "blackfin_tuna", months: [1, 12], depth_ft: [280, 1150], note: "The humps — crest to base; dawn bite, up-current edge" },
      { species: "swordfish", months: [1, 12], depth_ft: [1200, 2000], note: "Daytime deep-drop ledges along the 1,500-ft contour" },
      { species: "tilefish", months: [1, 12], depth_ft: [550, 900], note: "Deep-drop mud/rock (Carlson's Humps)" }
    );
    DATA_SCIENCE.factors.push(
      { title: "Humps: fish the up-current edge", detail: "Each seamount works like a boulder in a river — the Gulf Stream deflects upward on the leading (usually S/SW) edge, upwelling nutrients that pin bait. Mark the peak, run ¼–½ mi up-current, drift jigs/livies back over the crest. Big surface rips = strong current day: vertical jigs. Soft current = live-chum day.", sources: ["https://www.saltwatersportsman.com/species/fish-species/it-s-hump-day/"] },
      { title: "Gulf Stream = 2–4 kn on the Keys humps", detail: "Plan every drift around a 2.5–3.5 kn NE set: 250–400 g jigs, 8–12 lb sword leads, and real fuel burned re-setting drifts. The app's current forecast at the hump is the day's most important number.", sources: ["https://www.nauticalcharts.noaa.gov/publications/coast-pilot/files/cp5/CPB5_C03_WEB.pdf"] },
      { title: "Keys moon rules of thumb", detail: "Swords: day bite fishes ANY phase (strong through the Jul 2026 full moon); dark moons favor the night drift. Wahoo: winter bite concentrates ±4 days of full/new — high-speed at 12–16 kt around full moons. Mahi: moon matters less than finding the clean weed edge.", sources: ["https://macgregoryachts.com/new-to-daytime-swordfishing-where-when-how-and-why-they-bite/", "https://fishingkeywest.com/full-moon-wahoo-key-west/"] },
      { title: "The shark tax", detail: "Summer chum lines at the Marathon/Islamorada humps feed the taxman — after a couple of eaten tuna, MOVE (or switch to jigs away from the slick) rather than donate the school.", sources: ["https://mainattraction.org/marathon-hump-tuna-fishing/"] }
    );
    if (DATA_SCIENCE.watch) DATA_SCIENCE.watch.push(
      { region: "keys", name: "Captain Hook's Marathon daily conditions", url: "https://captainhooks.com/daily-fishing-conditions-marathon-fl/", what: "Marathon offshore conditions + hump reports — the home-port daily read. Scrapeable" },
      { region: "keys", name: "Two Conchs (Marathon) reports", url: "https://www.twoconchs.com/", what: "Big Marathon fleet — hump/mahi/sword posts; their Facebook is prolific: screenshot for Claude" },
      { region: "keys", name: "DirtyBoat Islamorada reports", url: "https://www.dirtyboat.com/reports/", what: "Detailed weedline depths/distances for the mahi run" },
      { region: "keys", name: "Bud n Mary's (Islamorada) blog", url: "https://www.budnmarys.com/blog/", what: "The daytime-sword originators — sword & hump intel" },
      { region: "keys", name: "Keys Weekly fishing column", url: "https://keysweekly.com/", what: "Middle Keys weekly — humps, sword, edge bite" },
      { region: "keys", name: "Saltwater Angler Key West report", url: "https://saltwaterangler.com/key-west-fishing-report/", what: "Lower Keys weekly roundup" }
    );
  }
})();
