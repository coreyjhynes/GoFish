/* Gulf Shores / Orange Beach, AL — Argosy VI (sunk Jul 2026, not yet in the 2025 reef list), the three
   federal coral HAPCs on the Pinnacles trend, and recent public fishing reports. Researched 2026-10-19. */
(function () {
  "use strict";
  window.DATA_SPOTS = (window.DATA_SPOTS || []).concat([
 {
  "id": "al_argosy_vi",
  "name": "Argosy VI (408-ft ship)",
  "region": "gulfshores",
  "lat": 29.8701,
  "lon": -87.583067,
  "depth_ft": 120,
  "relief_ft": 60,
  "type": "wreck",
  "grade": "A",
  "species": {
   "red_snapper": 5,
   "amberjack": 4,
   "gray_triggerfish": 4,
   "mangrove_snapper": 4,
   "vermilion_snapper": 3,
   "gag_grouper": 3
  },
  "notes": "Newest big ship in the Alabama reef zone: the 408-ft Argosy VI, sunk by ADCNR in July 2026 ~23 mi south of Orange Beach (N29 52.206 W087 34.984), within 7.5 mi of the LuLu and New Venture. ~120 ft to the bottom, top deck ~60 ft. Too new for the 2025 master reef list. Expect snapper, grouper, triggerfish and amberjack as it colonizes.",
  "sources": [
   {
    "name": "ADCNR — Argosy VI joins the reef zone",
    "url": "https://www.outdooralabama.com/articles/408-foot-argosy-vi-becomes-latest-addition-alabamas-artificial-reef-zone"
   }
  ]
 }
]);
  window.DATA_ZONES = (window.DATA_ZONES || []).concat([
 {
  "id": "al_roughtongue_hapc",
  "name": "Roughtongue Reef (HAPC)",
  "region": "gulfshores",
  "kind": "hapc",
  "polygon": [
   [
    29.41633,
    -87.6255
   ],
   [
    29.46033,
    -87.6255
   ],
   [
    29.46033,
    -87.52567
   ],
   [
    29.41633,
    -87.52567
   ]
  ],
  "center": [
   29.4384,
   -87.5755
  ],
  "depth_ft": null,
  "grade": "A",
  "species": {
   "scamp": 4,
   "vermilion_snapper": 4,
   "amberjack": 4,
   "red_snapper": 3
  },
  "notes": "Pinnacles-trend natural reef ~50 nm S of Perdido Pass (official 50 CFR 622.74 box). Federal coral HAPC: NO bottom anchoring (drift or power-pole only); bottom longline/trap gear banned. Hook-and-line drifting is allowed.",
  "sources": [
   {
    "name": "50 CFR 622.74 (boundary)",
    "url": "https://www.ecfr.gov/current/title-50/chapter-VI/part-622/subpart-D/section-622.74"
   }
  ]
 },
 {
  "id": "al_alps_hapc",
  "name": "Alabama Alps Reef (HAPC)",
  "region": "gulfshores",
  "kind": "hapc",
  "polygon": [
   [
    29.223,
    -88.34217
   ],
   [
    29.26933,
    -88.34217
   ],
   [
    29.26933,
    -88.3165
   ],
   [
    29.223,
    -88.3165
   ]
  ],
  "center": [
   29.2463,
   -88.3296
  ],
  "depth_ft": null,
  "grade": "A",
  "species": {
   "scamp": 4,
   "vermilion_snapper": 4,
   "amberjack": 4,
   "red_snapper": 3
  },
  "notes": "Pinnacles-trend natural reef SW of Mobile Pass (official 50 CFR 622.74 box). Federal coral HAPC: NO bottom anchoring (drift or power-pole only); bottom longline/trap gear banned. Hook-and-line drifting is allowed.",
  "sources": [
   {
    "name": "50 CFR 622.74 (boundary)",
    "url": "https://www.ecfr.gov/current/title-50/chapter-VI/part-622/subpart-D/section-622.74"
   }
  ]
 },
 {
  "id": "al_pinnacles_hapc",
  "name": "L & W Pinnacles and Scamp Reef (HAPC)",
  "region": "gulfshores",
  "kind": "hapc",
  "polygon": [
   [
    29.30833,
    -87.875
   ],
   [
    29.375,
    -87.875
   ],
   [
    29.375,
    -87.71
   ],
   [
    29.30833,
    -87.71
   ]
  ],
  "center": [
   29.3392,
   -87.7946
  ],
  "depth_ft": [
   300,
   360
  ],
  "grade": "B",
  "species": {
   "scamp": 4,
   "vermilion_snapper": 4,
   "amberjack": 4,
   "red_snapper": 3
  },
  "notes": "The Pinnacles reef tract on the outer shelf, ~60 nm S of Mobile Pass, ~330 ft (USGS). Drawn as the box around the official 11-point polygon — see 50 CFR 622.74 for the exact boundary. Federal coral HAPC: NO bottom anchoring (drift or power-pole only); bottom longline/trap gear banned. Hook-and-line drifting is allowed.",
  "sources": [
   {
    "name": "50 CFR 622.74 (boundary)",
    "url": "https://www.ecfr.gov/current/title-50/chapter-VI/part-622/subpart-D/section-622.74"
   },
   {
    "name": "USGS OFR 02-006 (Pinnacles)",
    "url": "https://pubs.usgs.gov/of/2002/0006"
   }
  ]
 }
]);
  window.DATA_REPORTS = (window.DATA_REPORTS || []).concat([
 {
  "region": "gulfshores",
  "date": "2025-08-26",
  "species": [
   "red_snapper",
   "gag_grouper"
  ],
  "quality": "limits",
  "port": "Orange Beach / Dauphin Island",
  "area": "Orange Beach offshore reefs and wrecks, 10-25 miles out",
  "details": "Charter report: red snapper limits coming quickly on reefs/wrecks 10-25 mi out; grouper biting deep on full-day trips with live bait (cigar minnows, hardtails).",
  "source": "coolchangecharter.com",
  "url": "https://coolchangecharter.com/current-orange-beach-offshore-fishing-report/"
 },
 {
  "region": "gulfshores",
  "date": "2025-12-22",
  "species": [
   "red_snapper"
  ],
  "quality": "limits",
  "port": "Orange Beach / Dauphin Island",
  "area": "Alabama offshore (private boats)",
  "details": "ADCNR: calm December weekends; several boats returning with limits of good-size red snapper; 2025 season ran 196 days to Dec 31.",
  "source": "outdooralabama.com",
  "url": "https://outdooralabama.com/articles/alabamas-red-snapper-season-continues-through-december-31"
 },
 {
  "region": "gulfshores",
  "date": "2026-01-16",
  "species": [
   "vermilion_snapper",
   "scamp"
  ],
  "quality": "good",
  "depth_ft": [
   180,
   400
  ],
  "port": "Pensacola, FL (next door)",
  "area": "Pensacola offshore (adjacent to Orange Beach; Hot Spots Charters)",
  "details": "Winter pattern between cold fronts: vermilion snapper steady on natural rock; scamp a secondary target in deeper water on live bait or jigs.",
  "source": "greatdaysoutdoors.com",
  "url": "https://greatdaysoutdoors.com/alabama-saltwater-fishing-report-for-january-16-22-2026/"
 },
 {
  "region": "gulfshores",
  "date": "2026-06-19",
  "species": [
   "vermilion_snapper",
   "lane_snapper",
   "scamp"
  ],
  "quality": "good",
  "depth_ft": [
   190,
   250
  ],
  "port": "Orange Beach / Dauphin Island",
  "area": "Orange Beach offshore deeper natural bottom (J&M Tackle report, week of Jun 19-25)",
  "details": "Mixed bag of vermilion, lane snapper and bigeye on deeper natural bottom; scamp slower than hoped; sharks a nuisance; gag spots avoided before the gag opener.",
  "source": "greatdaysoutdoors.com",
  "url": "https://greatdaysoutdoors.com/alabama-saltwater-fishing-report-for-june-19-25-2026/"
 },
 {
  "region": "gulfshores",
  "date": "2026-08-09",
  "species": [
   "red_grouper",
   "red_snapper"
  ],
  "quality": "good",
  "depth_ft": [
   70,
   165
  ],
  "port": "Orange Beach / Dauphin Island",
  "area": "South and southeast of Orange Beach (Capt. Kendall Annan, Gulf Rebel Charters)",
  "details": "Red grouper numbers up S/SE of Orange Beach, many undersized with legal fish mixed in; light current, 10-12 oz sinkers enough.",
  "source": "greatdaysoutdoors.com",
  "url": "https://greatdaysoutdoors.com/alabama-saltwater-fishing-report-for-august-7-13-2026/"
 },
 {
  "region": "gulfshores",
  "date": "2026-08-14",
  "species": [
   "red_snapper",
   "vermilion_snapper",
   "gray_triggerfish"
  ],
  "quality": "good",
  "depth_ft": [
   600,
   700
  ],
  "port": "Orange Beach / Dauphin Island",
  "area": "Dauphin Island offshore (Capt. King Marchand, Capt. Mike's Deep Sea Fishing)",
  "details": "Slow tuna bite so overnight trips turned to bottom fish: snowy/yellowedge grouper at 600-700 ft; after red snapper limits, small hooks and squid for beeliners and triggerfish on small structure.",
  "source": "greatdaysoutdoors.com",
  "url": "https://greatdaysoutdoors.com/alabama-saltwater-fishing-report-for-august-14-20-2026/"
 },
 {
  "region": "gulfshores",
  "date": "2026-08-28",
  "species": [
   "red_snapper",
   "gray_triggerfish",
   "vermilion_snapper",
   "amberjack"
  ],
  "quality": "good",
  "port": "Orange Beach / Dauphin Island",
  "area": "Orange Beach offshore reefs (Capt. Kendall Annan)",
  "details": "Red snapper steady; triggerfish and beeliners around; good numbers of amberjack on reefs ahead of the Sep 1 opener; nearby reefs fishing very differently.",
  "source": "greatdaysoutdoors.com",
  "url": "https://greatdaysoutdoors.com/alabama-saltwater-fishing-report-for-august-28-september-3-2026/"
 },
 {
  "region": "gulfshores",
  "date": "2026-09-18",
  "species": [
   "amberjack"
  ],
  "quality": "good",
  "port": "Orange Beach / Dauphin Island",
  "area": "Dauphin Island offshore: nearshore artificial reefs vs. shelf rigs (Capt. King Marchand)",
  "details": "Amberjack season: jigs on closer artificial reefs mostly catch undersized fish; farther offshore shelf rigs give better odds of legal (34 in FL) amberjack; large live hardtails preferred.",
  "source": "greatdaysoutdoors.com",
  "url": "https://greatdaysoutdoors.com/alabama-saltwater-fishing-report-for-september-18-24-2026/"
 }
]);
})();
