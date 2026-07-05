/* Recent catch reports, Jan–Jun 2026, west-central FL offshore.
   Scraped from public charter reports, columns and forums 2026-06-12.
   zoneIds/spotIds tie a report to map structure so fresh intel boosts those scores. */
window.DATA_REPORTS = [
  {
    date: "2026-07-01", species: ["bay_scallop"],
    quality: "good", depth_ft: [4, 8], port: "Crystal River / Homosassa / Chassahowitzka",
    area: "Citrus-zone opener — flats off the Crystal, Salt, Homosassa & Chassahowitzka rivers",
    details: "Opening day of the Levy–Citrus–Hernando season: fleets on the grass, swimmers working 4–8 ft, healthy seagrass and improving clarity after pre-season scouting pointed to solid numbers. Low tide made for easy harvesting.",
    zoneIds: ["scallop_citrus"],
    source: "Citrus County Chronicle", url: "https://www.chronicleonline.com/news/local/boaters-flood-nature-coast-as-scallop-season-opens/article_fe933ffc-36ad-58dc-9100-7f748d5c1c5d.html"
  },
  {
    date: "2026-06-20", species: ["bay_scallop"],
    quality: "limits", depth_ft: [4, 8], port: "Steinhatchee / Keaton Beach",
    area: "Pepperfish Keys & Steinhatchee grass",
    details: "Abundant, large scallops with limits in 1–2 hours early in the 2026 season. Pepperfish Keys called out for the cleanest water AND the best concentrations; Keaton has great visibility but spottier scallops.",
    zoneIds: ["scallop_steinhatchee"],
    source: "Outdoor Update / Sea Hag area reports", url: "https://www.outdoorupdate.com/steinhatchee-fishing-scalloping-report-its-all-about-the-scallops-now/"
  },
  {
    date: "2026-07-04", species: ["bay_scallop"],
    quality: "fair", depth_ft: [4, 8], port: "Hudson / Anclote",
    area: "Pasco zone — PRE-SEASON note (opens Jul 10)",
    details: "Home-zone heads-up before the Jul 10 opener: in 2025 FWC closed the Pasco zone mid-season (Aug 6) after Pyrodinium bahamense toxin exceeded safety thresholds, reopening Sept 6–21 with an eat-the-muscle-only advisory. No 2026 closure as of Jul 5 — verify at FWC the morning you go.",
    zoneIds: ["scallop_pasco"],
    source: "FWC news (2025 closure)", url: "https://myfwc.com/news/all-news/pasco-scallop-825/"
  },
  {
    date: "2026-06-06", species: ["red_snapper", "scamp", "red_grouper", "mangrove_snapper", "vermilion_snapper"],
    quality: "good", depth_ft: [140, 250], port: "Madeira Beach (John's Pass)",
    area: "Deep grounds W/NW of John's Pass — hard bottom, good current, clean water",
    details: "Offshore 'strong' with a big mixed bag. Red snapper best on long-range trips ~140–250 ft; big dead baits (whole squid, bonita strips) for bigger fish.",
    zoneIds: ["red_snapper_band", "the_elbow"],
    source: "Hubbard's Marina weekly report 6-6-26", url: "https://www.hubbardsmarina.com/hubbards-marina-fishing-report-6-6-26/"
  },
  {
    date: "2026-06-05", species: ["red_snapper", "mangrove_snapper", "lane_snapper"],
    quality: "good", depth_ft: [140, 200], port: "Madeira Beach (John's Pass)",
    area: "140 ft and beyond W of John's Pass",
    details: "Season opened June 1 and 'the bite is already off to a HOT start.' Mangroves going well 140–180 ft ESPECIALLY AT NIGHT; lanes from ~60 ft out.",
    zoneIds: ["red_snapper_band"],
    source: "Hubbard's Marina 2026 season update", url: "https://www.hubbardsmarina.com/big-2026-fishing-season-updates-red-snapper-grouper-amberjack/"
  },
  {
    date: "2026-06-08", species: ["red_snapper", "red_grouper", "gag_grouper"],
    quality: "limits", depth_ft: [90, 105], port: "Clearwater / Indian Rocks Beach",
    area: "Hard bottom W of Clearwater in 90–105 ft",
    details: "'Consistently finding large groups of Red Snapper and Grouper holding in 90–105 ft' — 6-hour charters limiting out quickly on live pinfish and grass grunts.",
    zoneIds: ["clearwater_90_105"],
    source: "Clearwater Beach Fishing Charter reports", url: "https://clearwaterbeachfishingcharter.com/fishing-reports/"
  },
  {
    date: "2026-06-01", species: ["red_snapper", "red_grouper", "scamp"],
    quality: "good", depth_ft: [130, 200], port: "John's Pass",
    area: "Offshore shelf W of John's Pass / Tampa Bay",
    details: "Capt. Hutchko: 'American red snapper and grouper are in full swing' — good numbers 130–200 ft, 6–8 oz egg weights, 6 ft of 80-lb leader, sardines/threadfins/live pinfish. Red grouper 140–200 ft; scamp actively feeding.",
    zoneIds: ["red_snapper_band", "the_elbow"],
    source: "Coastal Angler Magazine (Tampa Bay)", url: "https://coastalanglermag.com/offshore-nearshore-report-by-capt-frank-hutchko-4/"
  },
  {
    date: "2026-06-04", species: ["red_snapper", "red_grouper"],
    quality: "good", depth_ft: [140, 160], port: "St. Pete Beach",
    area: "140 ft+ W of St. Pete",
    details: "8-hour trips fish 140 ft+ water, switching to grouper after the red snapper limit is reached. June–July called prime.",
    zoneIds: ["red_snapper_band", "fathom21"],
    source: "YachtFish Charters", url: "https://www.yachtfish.com/red-snapper-season/"
  },
  {
    date: "2026-06-03", species: ["red_grouper", "gag_grouper", "mangrove_snapper"],
    quality: "good", depth_ft: [40, 50], port: "Crystal River / Homosassa",
    area: "Deeper rock piles off the Nature Coast, 40–50 ft band",
    details: "Mangrove snapper productive 'especially out deep,' fish pushing 9 lb on live pinfish. Hungry gags mixed in 40–50 ft (closed — released).",
    zoneIds: [],
    source: "High Octane Fishing — June Crystal River report", url: "https://www.highoctanefishing.com/june-crystal-river-fishing-report"
  },
  {
    date: "2026-05-28", species: ["red_snapper"],
    quality: "good", depth_ft: [80, 110], port: "Crystal River (applies to Hudson runs)",
    area: "60–80 mi W on the shallow Big Bend shelf, 80 ft+",
    details: "Pre-season scouting: 'spots around 60–80 miles offshore looking to be the most promising. Focus on depths of 80 feet or deeper.' The northern shelf is gentle — run WSW from Hudson to shorten the trip to depth.",
    zoneIds: ["red_snapper_band"],
    source: "High Octane Fishing", url: "https://www.highoctanefishing.com/red-snapper"
  },
  {
    date: "2026-05-20", species: ["red_grouper", "red_snapper", "mangrove_snapper", "lane_snapper"],
    quality: "limits", depth_ft: [100, 120], port: "Madeira Beach",
    area: "Hard bottom 100+ ft W of Madeira/Clearwater",
    details: "'Red grouper, red snapper, mango snapper and lane snapper are on fire in 100+ feet… filling the box on every trip.' Sharks thick — move when they show.",
    zoneIds: ["fathom21", "clearwater_90_105"],
    source: "FishingBooker Madeira Beach reports", url: "https://fishingbooker.com/reports/destination/us/FL/madeira-beach"
  },
  {
    date: "2026-05-09", species: ["red_grouper", "vermilion_snapper", "mangrove_snapper", "scamp", "yellowtail_snapper"],
    quality: "good", depth_ft: [100, 180], port: "Madeira Beach (John's Pass)",
    area: "Hard bottom, potholes, smaller ledges and cracks; deeper grounds most consistent",
    details: "Red grouper the primary target. Vermilion 'start around 100 ft' on cut squid/threadfin. Offshore mangroves on threadfin chunks / medium pinfish, 40–60 lb, 5–7/0 hooks.",
    zoneIds: ["fathom21", "red_snapper_band"],
    source: "Hubbard's Marina report 5-9-26", url: "https://www.hubbardsmarina.com/hubbards-marina-fishing-report-5-9-26/"
  },
  {
    date: "2026-05-15", species: ["gag_grouper"],
    quality: "good", depth_ft: [8, 100], port: "Crystal River / Pasco",
    area: "Rock piles 8–100 ft along the Nature Coast",
    details: "'No shortage of gag grouper… stacked up on just about any rock pile from 8 to 100 feet' — all catch-and-release until Sept 1.",
    zoneIds: ["anclote_ledges", "swiss_cheese_belt"],
    source: "High Octane Fishing — May report", url: "https://www.highoctanefishing.com/may-crystal-river-fishing-report"
  },
  {
    date: "2026-05-12", species: ["red_grouper"],
    quality: "good", depth_ft: [150, 200], port: "Hudson",
    area: "Deep water W of Hudson",
    details: "'You will have to head pretty deep to find any sizeable Red Grouper right now, starting in at least 150 feet' — long WSW run from Hudson. Mixed bottom bite starts ~30 ft.",
    zoneIds: ["red_snapper_band"],
    source: "Pro Angler — Hudson report", url: "https://proangler.us/fishingreport/hudson-fishing-report/"
  },
  {
    date: "2026-05-10", species: ["red_grouper", "gag_grouper", "lane_snapper"],
    quality: "fair", depth_ft: [40, 60], port: "Hernando Beach",
    area: "Hard bottom ~10 mi W of Hernando Beach",
    details: "'A decent Grouper and Snapper bite on the days you can get out around 10 miles.' Pinfish a favorite.",
    zoneIds: ["swiss_cheese_belt"],
    source: "Pro Angler — Hernando Beach report", url: "https://proangler.us/fishingreport/hernando-beach-fishing-report/"
  },
  {
    date: "2026-04-24", species: ["red_grouper", "scamp", "yellowtail_snapper", "mangrove_snapper"],
    quality: "good", depth_ft: [140, 180], port: "Madeira Beach (John's Pass)",
    area: "Offshore hard bottom; scamp pushing beyond 160 ft",
    details: "'Red grouper remain the primary target with consistent catches from 140 to 180 ft' on large dead baits. Scamp showing more beyond 160 ft. Yellowtail outstanding 100–120 ft and deeper.",
    zoneIds: ["red_snapper_band", "the_elbow"],
    source: "Hubbard's Marina report 4-24-26", url: "https://www.hubbardsmarina.com/hubbards-marina-fishing-report-4-24-26"
  },
  {
    date: "2026-04-15", species: ["gag_grouper", "mangrove_snapper", "hogfish"],
    quality: "good", depth_ft: [30, 60], port: "Hudson / Port Richey",
    area: "Rocky bottom and ledges 30–60 ft off the Pasco coast",
    details: "Cobia and 'plenty of gag grouper' on the 30–60 ft rock (gags released). Hogfish and mangrove bite solid on the same ledges — Capt. Fritz fishing 32–38 ft with live shrimp.",
    zoneIds: ["anclote_ledges"],
    source: "Suncoast News — Pasco & North Pinellas Fishin' Report", url: "https://www.suncoastnews.com/sports/the-pasco-north-pinellas-fishin-report-gulf-council-announces-2026-gag-grouper-season/article_b5eb1dd1-e7fc-4601-86e7-a99733ab9606.html"
  },
  {
    date: "2026-03-27", species: ["red_grouper", "yellowtail_snapper"],
    quality: "good", depth_ft: [100, 140], port: "Madeira Beach (John's Pass)",
    area: "20+ mi out / 100 ft and beyond — hard bottom, potholes, ledges",
    details: "Red grouper 'a cornerstone target' on hard bottom, potholes and ledges — whole squid, octopus, bonita strips; live baits for quality fish.",
    zoneIds: ["fathom21"],
    source: "Hubbard's Marina report 3-27-26", url: "https://www.floridafishreports.com/fish_reports/236464/hubbards-marina-fishing-report-3-27-26.php"
  },
  {
    date: "2026-02-07", species: ["red_grouper", "gag_grouper", "mangrove_snapper"],
    quality: "good", depth_ft: [120, 140], port: "Madeira Beach (John's Pass)",
    area: "Potholes, ledges and rock piles in 120–140 ft",
    details: "'Huge numbers of red grouper on the potholes, ledges and rock piles around 120–140 ft with plenty of quality fish in the mix.'",
    zoneIds: ["fathom21", "red_snapper_band"],
    source: "Hubbard's Marina report 2-7-26", url: "https://www.floridafishreports.com/fish_reports/235268/hubbards-marina-fishing-report-2-7-26.php"
  },
  {
    date: "2026-01-09", species: ["red_grouper", "mangrove_snapper", "yellowtail_snapper"],
    quality: "good", depth_ft: [100, 160], port: "Madeira Beach (John's Pass)",
    area: "100–160+ ft W of John's Pass",
    details: "Red grouper solid 100–120 ft and beyond; mangroves 'super consistent' in the same band and deeper; muttons 140–160+.",
    zoneIds: ["fathom21", "red_snapper_band"],
    source: "Hubbard's Marina report 1-9-26", url: "https://www.hubbardsmarina.com/hubbards-marina-fishing-report-1-9-26"
  },
  {
    date: "2026-01-20", species: ["yellowtail_snapper", "mangrove_snapper", "gag_grouper", "red_snapper", "amberjack", "hogfish"],
    quality: "limits", depth_ft: [80, 140], port: "Clearwater",
    area: "Offshore freshwater springs (8–11 hr range W of Clearwater)",
    details: "Winter 11-hr trip with 50s water temps: fish stacked on offshore spring vents — limits of big yellowtail and mangroves, AJs on poppers, ~6 big gags and 'way too many huge Red Snapper' released. Springs concentrate fish hard in cold snaps.",
    zoneIds: [],
    source: "Captain Experiences — Clearwater recap", url: "https://captainexperiences.com/fishing-reports/locations/florida/clearwater"
  },
  {
    date: "2026-06-02", species: ["red_snapper", "vermilion_snapper", "mangrove_snapper", "gag_grouper", "scamp", "red_grouper", "amberjack"],
    quality: "good", depth_ft: [120, 250], port: "Madeira Beach (39-hr trips)",
    area: "Florida Middle Grounds / Elbow, 100–150 mi runs",
    details: "Hubbard's long-range trips fish the Middle Grounds 120–250 ft — the premier grounds for big red snapper, grouper and AJs (AJ/gag closed now; reopen Sept 1).",
    zoneIds: ["middle_grounds", "the_elbow"],
    source: "Hubbard's Marina 39-hr trip page", url: "https://www.hubbardsmarina.com/39hr-overnight-fishing-trip/"
  },
  {
    date: "2026-06-05", species: ["red_snapper", "gag_grouper", "amberjack"],
    quality: "good", depth_ft: [100, 130], port: "St. Petersburg",
    area: "21-Fathom Ledge — limestone shelf edge ~50–60 mi W of St. Pete, drops 100 → 130+ ft",
    details: "Named 2026 hotspot for Tampa boats: the ledge concentrates gag (released until Sept), red snapper and AJ. 'Good fishing ~125 ft about 38 miles out' on the way.",
    zoneIds: ["fathom21"],
    source: "SaltwaterPros / FishnFL 2026 spot guides", url: "https://saltwaterpros.com/florida/st-petersburg/charters/offshore"
  }
];
