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
    { name: "FL saltwater fishing license", required_for: "standard requirements unless exempt; no federal permit needed for private rec", url: "https://myfwc.com/fishing/saltwater/recreational/" }
  ]
};
