/* 2026 Gulf recreational regulations — PRIVATE rec angler, federal waters (>9 nm)
   off west-central Florida, with state-water notes. Researched & compiled 2026-06-12.
   swg_closure: subject to shallow-water-grouper closure Feb 1 – Mar 31 seaward of 20 fathoms (~120 ft).
   ALWAYS verify at myfwc.com / Fish Rules before keeping fish. */
window.DATA_REGS = {
  as_of: "2026-06-12",
  species: {
    red_snapper: {
      name: "Red Snapper",
      open: [
        { start: "2026-05-22", end: "2026-07-31", note: "summer season" },
        { start: "2026-09-01", end: "2026-10-04", note: "fall" },
        { start: "2026-10-09", end: "2026-10-11" }, { start: "2026-10-16", end: "2026-10-18" },
        { start: "2026-10-23", end: "2026-10-25" }, { start: "2026-10-30", end: "2026-11-01" },
        { start: "2026-11-07", end: "2026-11-08" }, { start: "2026-11-14", end: "2026-11-15" },
        { start: "2026-11-21", end: "2026-11-22" }, { start: "2026-11-26", end: "2026-11-29" },
        { start: "2026-12-05", end: "2026-12-06" }, { start: "2026-12-12", end: "2026-12-13" },
        { start: "2026-12-19", end: "2026-12-20" }, { start: "2026-12-25", end: "2026-12-27" }
      ],
      bag: "2/person (additive — not in snapper aggregate)",
      size: "16\" total length",
      agg: "Record 140-day FWC season for private rec in state AND federal waters. State Reef Fish Angler required.",
      needs_verification: false,
      url: "https://myfwc.com/fishing/saltwater/recreational/snappers/"
    },
    mangrove_snapper: {
      name: "Mangrove (Gray) Snapper",
      open: [{ start: "2026-01-01", end: "2026-12-31", note: "year-round" }],
      bag: "Fed: 10/person within 10-snapper agg · State: 5/person",
      size: "12\" TL federal · 10\" TL state",
      agg: "Within 10-snapper aggregate",
      needs_verification: false,
      url: "https://myfwc.com/fishing/saltwater/recreational/snappers/"
    },
    lane_snapper: {
      name: "Lane Snapper",
      open: [{ start: "2026-01-01", end: "2026-12-31", note: "year-round" }],
      bag: "20/person (new FL rule Apr 2026); fed: within 20-reef-fish agg",
      size: "10\" total length (raised from 8\" in 2026)",
      agg: "Not in snapper aggregate",
      needs_verification: true,
      url: "https://myfwc.com/news/all-news/lane-snapper-0326/"
    },
    vermilion_snapper: {
      name: "Vermilion Snapper",
      open: [{ start: "2026-01-01", end: "2026-12-31", note: "year-round" }],
      bag: "10/person (separate from snapper aggregate)",
      size: "10\" total length",
      agg: "Within federal 20-reef-fish aggregate",
      needs_verification: false,
      url: "https://gulfcouncil.org/clarifying-common-misunderstandings-aggregate-bag-limits/"
    },
    yellowtail_snapper: {
      name: "Yellowtail Snapper",
      open: [{ start: "2026-01-01", end: "2026-12-31", note: "year-round" }],
      bag: "10/person within 10-snapper aggregate",
      size: "12\" total length",
      agg: "Within 10-snapper aggregate",
      needs_verification: false,
      url: "https://myfwc.com/fishing/saltwater/recreational/snappers/"
    },
    red_grouper: {
      name: "Red Grouper",
      open: [{ start: "2026-01-01", end: "2026-12-31", note: "year-round*" }],
      bag: "2/person within 4-grouper aggregate",
      size: "20\" total length",
      agg: "*Closed beyond 20 fathoms (~120 ft) Feb 1 – Mar 31 (shallow-water grouper closure; repeal pending under Amendment 62)",
      swg_closure: true,
      needs_verification: false,
      url: "https://myfwc.com/fishing/saltwater/recreational/groupers/"
    },
    gag_grouper: {
      name: "Gag Grouper",
      open: [{ start: "2026-09-01", end: "2026-09-30", note: "federal waters; STATE waters only Sep 1–14" }],
      bag: "2/person within 4-grouper aggregate",
      size: "24\" total length",
      agg: "Severely shortened season (overfished stock). Federal: Sep 1 – Sep 30, 2026.",
      swg_closure: true,
      needs_verification: true,
      url: "https://www.fisheries.noaa.gov/bulletin/noaa-fisheries-announces-2026-gag-recreational-season-federal-waters-gulf"
    },
    scamp: {
      name: "Scamp",
      open: [{ start: "2026-01-01", end: "2026-12-31", note: "year-round*" }],
      bag: "4/person within 4-grouper aggregate",
      size: "16\" total length",
      agg: "*Closed beyond 20 fathoms Feb 1 – Mar 31 (SWG closure)",
      swg_closure: true,
      needs_verification: false,
      url: "https://myfwc.com/fishing/saltwater/recreational/groupers/"
    },
    black_grouper: {
      name: "Black Grouper",
      open: [{ start: "2026-01-01", end: "2026-12-31", note: "year-round*" }],
      bag: "4/person within 4-grouper aggregate",
      size: "24\" total length",
      agg: "*Closed beyond 20 fathoms Feb 1 – Mar 31 (SWG closure)",
      swg_closure: true,
      needs_verification: false,
      url: "https://myfwc.com/fishing/saltwater/recreational/groupers/"
    },
    amberjack: {
      name: "Greater Amberjack",
      open: [{ start: "2026-09-01", end: "2026-10-13", note: "federal; state waters Sep 1 – Oct 31 (early close likely)" }],
      bag: "1/person",
      size: "34\" fork length",
      agg: "Overfished — short window. Watch for in-season closure.",
      needs_verification: false,
      url: "https://www.fisheries.noaa.gov/bulletin/recreational-fishing-season-length-announcement-greater-amberjack-federal-waters-gulf"
    },
    gray_triggerfish: {
      name: "Gray Triggerfish",
      open: [
        { start: "2026-03-01", end: "2026-05-31" },
        { start: "2026-08-01", end: "2026-12-31", note: "quota — may close early" }
      ],
      bag: "1/person",
      size: "15\" fork length",
      agg: "Within federal 20-reef-fish aggregate",
      needs_verification: false,
      url: "https://myfwc.com/news/all-news/gray-triggerfish-0226/"
    },
    bay_scallop: {
      name: "Bay Scallop",
      open: [
        { start: "2026-06-15", end: "2026-09-07", note: "Fenholloway–Suwannee (Steinhatchee); reduced bag Jun 15–30" },
        { start: "2026-07-01", end: "2026-09-24", note: "Levy–Citrus–Hernando (Crystal R/Homosassa/Chass/Bayport)" },
        { start: "2026-07-10", end: "2026-08-18", note: "PASCO zone (Anclote–Aripeka)" }
      ],
      bag: "2 gal whole (or 1 pint meat)/person · max 10 gal whole (½ gal meat)/vessel",
      size: "No size limit — by hand or dip net only",
      agg: "Zone-by-zone seasons (see pink zones on map). Saltwater license required (shoreline-license holders: wading only). Divers-down flag required. State waters only. ⚠ Pasco zone has a history of mid-season toxin closures — check FWC first.",
      needs_verification: false,
      url: "https://myfwc.com/fishing/saltwater/recreational/bay-scallops/"
    },
    yellowfin_tuna: {
      name: "Yellowfin Tuna",
      open: [{ start: "2026-01-01", end: "2026-12-31", note: "year-round (federal HMS)" }],
      bag: "3/person/day",
      size: "27\" curved fork length",
      agg: "Federal HMS Angling permit REQUIRED on the vessel (hmspermits.noaa.gov) — Gulf (Venice) and Atlantic (Keys). Land with tail + one pectoral fin attached. LA also requires the free ROLP.",
      needs_verification: false,
      url: "https://www.fisheries.noaa.gov/atlantic-highly-migratory-species/recreational-atlantic-bigeye-albacore-yellowfin-and-skipjack-tuna"
    },
    blackfin_tuna: {
      name: "Blackfin Tuna",
      open: [{ start: "2026-01-01", end: "2026-12-31", note: "year-round" }],
      bag: "FL: 2/person or 10/vessel (whichever is GREATER) · LA: no limit",
      size: "No minimum",
      agg: "Not federally managed — the only tuna that doesn't need the HMS permit. LA requires the free ROLP to possess.",
      needs_verification: false,
      url: "https://myfwc.com/fishing/saltwater/recreational/tunas/"
    },
    mahi: {
      name: "Mahi (Dolphinfish)",
      open: [{ start: "2026-01-01", end: "2026-12-31", note: "year-round" }],
      bag: "Keys (FL Atlantic): 5/person AND 30/vessel · FL Gulf: 10/person · LA (Venice): no limit (ROLP reqd)",
      size: "FL Atlantic: 20\" fork length · none in Gulf/LA",
      agg: "Keys trips follow the tighter 2022 Atlantic rules — cull schoolies.",
      needs_verification: false,
      url: "https://myfwc.com/fishing/saltwater/recreational/dolphinfish/"
    },
    wahoo: {
      name: "Wahoo",
      open: [{ start: "2026-01-01", end: "2026-12-31", note: "year-round" }],
      bag: "FL: 2/person/day · LA: 5/person (rule since Jun 2025)",
      size: "No minimum",
      agg: "Winter is wahoo time everywhere — Keys peak Nov–Feb (±4 days of full/new moons), Venice Dec–Mar on the Lump.",
      needs_verification: false,
      url: "https://www.wlf.louisiana.gov/news/new-recreational-wahoo-regulations-effective-june-20"
    },
    swordfish: {
      name: "Swordfish",
      open: [{ start: "2026-01-01", end: "2026-12-31", note: "year-round (federal HMS)" }],
      bag: "1/person/trip, max 4/vessel (private rec)",
      size: "47\" lower-jaw fork length",
      agg: "HMS Angling permit required; non-tournament landings MUST be reported within 24 hrs (HMS Catch app / 800-894-5528). No retention with a hammerhead or oceanic whitetip aboard. Daytime fishery 1,200–1,800 ft.",
      needs_verification: false,
      url: "https://www.fisheries.noaa.gov/atlantic-highly-migratory-species/recreational-atlantic-swordfish-fishery-statuses-minimum-sizes"
    },
    hogfish: {
      name: "Hogfish (Gulf zone)",
      open: [{ start: "2026-01-01", end: "2026-12-31", note: "year-round in Gulf zone" }],
      bag: "5/person",
      size: "14\" fork length",
      agg: "Gulf zone rules (not the Keys 16\"/1-fish rules)",
      needs_verification: false,
      url: "https://myfwc.com/fishing/saltwater/recreational/hogfish/"
    }
  },
  gear: [
    { rule: "Descending device OR venting tool rigged and ready — required in FL state waters; keep one ready in federal waters too (DESCEND Act continuation pending)", url: "https://myfwc.com/fishing/saltwater/recreational/gear-rules/" },
    { rule: "Non-stainless circle hooks required with natural bait for reef fish; dehooking device required aboard", url: "https://www.ecfr.gov/current/title-50/chapter-VI/part-622/subpart-B/section-622.30" },
    { rule: "Shallow-water grouper (red, gag, black, scamp) closed Feb 1 – Mar 31 seaward of 20 fathoms (~120 ft)", url: "https://myfwc.com/fishing/saltwater/recreational/groupers/" }
  ],
  permits: [
    { name: "State Reef Fish Angler designation (FREE)", required_for: "required for red snapper, vermilion, yellowtail, hogfish, gag, red/black grouper, AJ, triggerfish from a private boat — renew annually", url: "https://myfwc.com/fishing/saltwater/recreational/state-reef-fish-survey/" },
    { name: "FL saltwater fishing license", required_for: "standard requirements unless exempt; no federal permit needed for private rec reef fish", url: "https://myfwc.com/fishing/saltwater/recreational/" },
    { name: "Federal HMS Angling permit (~$26/yr)", required_for: "REQUIRED to fish for/retain tuna (incl. yellowfin & blackfin in federal waters), swordfish, billfish — both Venice LA and the Keys. Buy at hmspermits.noaa.gov", url: "https://hmspermits.noaa.gov/" },
    { name: "Louisiana Saltwater License (Venice trips)", required_for: "LA basic + saltwater license for residents/non-residents fishing out of Venice; LDWF offers short-term non-resident options", url: "https://www.wlf.louisiana.gov/page/fishing-licenses-and-permits" },
    { name: "Louisiana ROLP (free, online)", required_for: "Recreational Offshore Landing Permit — REQUIRED in LA to possess tunas, billfish, swordfish, wahoo, dolphinfish, snappers, groupers, AJ, cobia. Two minutes online, zero dollars, big ticket without it.", url: "https://www.wlf.louisiana.gov/page/rolp" },
    { name: "Western Dry Rocks closure (Keys)", required_for: "ALL fishing prohibited in the marked area ~10 mi SW of Key West, April 1 – July 31 every year (spawning protection). Shown as a red zone on the map.", url: "https://myfwc.com/fishing/saltwater/recreational/wdr/" }
  ]
};
