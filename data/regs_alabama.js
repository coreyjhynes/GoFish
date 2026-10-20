/* 2026 Alabama recreational reef-fish rules — PRIVATE angler, AL state waters (9 nm) + adjacent
   federal Gulf. ADCNR Marine Resources creel table & notices + NOAA Fisheries / eCFR. Researched 2026-10-19.
   Used only when the Gulf Shores region is selected (DATA_REGS.byRegion). ALWAYS verify at outdooralabama.com. */
window.DATA_REGS.byRegion = window.DATA_REGS.byRegion || {};
window.DATA_REGS.byRegion.gulfshores = {
 "as_of": "2026-10-19",
 "scope": "Alabama (state waters to 9 nm + adjacent federal Gulf)",
 "species": {
  "red_snapper": {
   "name": "Red Snapper",
   "open": [
    {
     "start": "2026-05-22",
     "end": "2026-12-31",
     "note": "AL private season, 7 days/wk — until Dec 31 or quota"
    }
   ],
   "bag": "2 per person per day",
   "size": "16 in minimum total length",
   "agg": "Alabama private-angler season in AL state AND adjacent federal waters; MRD closes it early if the 664,552-lb quota is projected to be met. Report every trip in Snapper Check. Not in the snapper aggregate.",
   "url": "https://outdooralabama.com/articles/red-snapper-season-opens-7-day-week-starting-may-22",
   "needs_verification": true
  },
  "gray_triggerfish": {
   "name": "Gray Triggerfish",
   "open": [
    {
     "start": "2026-03-01",
     "end": "2026-05-31",
     "note": "spring"
    },
    {
     "start": "2026-08-01",
     "end": "2026-12-31",
     "note": "reopens Aug 1"
    }
   ],
   "bag": "1 per person per day",
   "size": "15 in minimum fork length",
   "agg": "Counts within the 20-fish reef fish aggregate (no more than 1 gray triggerfish within it). Report through Snapper Check when open.",
   "url": "https://www.outdooralabama.com/fishing/saltwater-recreational-size-creel-limits",
   "needs_verification": false
  },
  "amberjack": {
   "name": "Greater Amberjack",
   "open": [
    {
     "start": "2026-09-01",
     "end": "2026-10-13",
     "note": "43-day fall season; closed Oct 14"
    }
   ],
   "bag": "1 per person per day (captain/crew of for-hire vessels: 0)",
   "size": "34 in minimum fork length",
   "agg": "Stand-alone bag limit. Report through Snapper Check when open.",
   "url": "https://www.fisheries.noaa.gov/bulletin/recreational-fishing-season-length-announcement-greater-amberjack-federal-waters-gulf",
   "needs_verification": false
  },
  "vermilion_snapper": {
   "name": "Vermilion Snapper (Beeliner)",
   "open": [
    {
     "start": "2026-01-01",
     "end": "2026-12-31",
     "note": "year-round"
    }
   ],
   "bag": "10 per person per day",
   "size": "10 in minimum total length",
   "agg": "Counts within the 20-fish reef fish aggregate (no more than 10 vermilion within it); not part of the 10-snapper aggregate.",
   "url": "https://www.outdooralabama.com/fishing/saltwater-recreational-size-creel-limits",
   "needs_verification": false
  },
  "mangrove_snapper": {
   "name": "Mangrove (Gray) Snapper",
   "open": [
    {
     "start": "2026-01-01",
     "end": "2026-12-31",
     "note": "year-round"
    }
   ],
   "bag": "10 per person per day",
   "size": "12 in minimum total length",
   "agg": "Federal: counts in the 10-fish snapper aggregate (all snappers except red, lane and vermilion; max 5 mutton).",
   "url": "https://www.outdooralabama.com/fishing/saltwater-recreational-size-creel-limits",
   "needs_verification": false
  },
  "gag_grouper": {
   "name": "Gag Grouper",
   "open": [
    {
     "start": "2026-09-01",
     "end": "2026-09-30",
     "note": "Sep only; closed Oct 1"
    }
   ],
   "bag": "2 per person per day",
   "size": "24 in minimum total length",
   "agg": "Within the 4-per-person grouper aggregate (no more than 2 gag and 2 red grouper). Captain/crew of for-hire vessels: 0.",
   "url": "https://www.fisheries.noaa.gov/bulletin/noaa-fisheries-announces-2026-gag-recreational-season-federal-waters-gulf",
   "needs_verification": false
  },
  "red_grouper": {
   "name": "Red Grouper",
   "open": [
    {
     "start": "2026-01-01",
     "end": "2026-12-31",
     "note": "closed Feb 1–Mar 31 beyond 20 fathoms only"
    }
   ],
   "bag": "2 per person per day",
   "size": "20 in minimum total length",
   "agg": "Within the 4-per-person grouper aggregate (no more than 2 gag and 2 red grouper).",
   "url": "https://www.outdooralabama.com/fishing/saltwater-recreational-size-creel-limits",
   "needs_verification": false,
   "swg_closure": true
  },
  "scamp": {
   "name": "Scamp",
   "open": [
    {
     "start": "2026-01-01",
     "end": "2026-12-31",
     "note": "closed Feb 1–Mar 31 beyond 20 fathoms only"
    }
   ],
   "bag": "Up to 4 per person (within the grouper aggregate)",
   "size": "16 in minimum total length",
   "agg": "Within the 4-per-person grouper aggregate. A new Jan 1–Jun 30 closure for this grouper group starts in 2027.",
   "url": "https://www.outdooralabama.com/fishing/saltwater-recreational-size-creel-limits",
   "needs_verification": true,
   "swg_closure": true
  },
  "lane_snapper": {
   "name": "Lane Snapper",
   "open": [
    {
     "start": "2026-01-01",
     "end": "2026-12-31",
     "note": "year-round"
    }
   ],
   "bag": "Within the 20-fish reef fish aggregate (no separate limit)",
   "size": "10\" TL landed in Alabama (federal rule still 8\")",
   "agg": "20-fish reef fish aggregate; not part of the 10-snapper aggregate.",
   "url": "https://www.outdooralabama.com/fishing/saltwater-recreational-size-creel-limits",
   "needs_verification": true
  }
 },
 "gear": [
  {
   "rule": "Non-stainless-steel circle hooks are required when fishing for Gulf reef fish with natural bait in the Gulf EEZ (50 CFR 622.30(a)).",
   "url": "https://www.ecfr.gov/api/versioner/v1/full/2026-10-15/title-50.xml?part=622&section=622.30"
  },
  {
   "rule": "At least one dehooking device must be on board and used to remove hooks from Gulf reef fish (50 CFR 622.30(b)).",
   "url": "https://www.ecfr.gov/api/versioner/v1/full/2026-10-15/title-50.xml?part=622&section=622.30"
  },
  {
   "rule": "DESCEND Act requirement (descending device with >=16 oz weight and >=60 ft line, or a hollow venting tool >=16-gauge, rigged and ready) was effective only until 2026-01-14 per eCFR 622.30(c); NOAA has a proposed framework to continue it (status 'Information Gathering', updated 2026-07-30). ADCNR's April 2026 announcement still says federally permitted reef fish vessels must have one rigged and ready. Treat as recommended/possibly required; verify.",
   "url": "https://www.fisheries.noaa.gov/action/continuation-management-measures-reduce-reef-fish-release-mortality"
  },
  {
   "rule": "Bottom anchoring by fishing vessels and bottom longline/trawl/pot/trap/buoy gear are prohibited year-round inside the Alabama Alps Reef, L & W Pinnacles and Scamp Reef, and Roughtongue Reef HAPCs (50 CFR 622.74(f),(g),(i)); hook-and-line drifting is not prohibited by that section.",
   "url": "https://www.ecfr.gov/api/versioner/v1/full/2026-10-15/title-50.xml?part=622&section=622.74"
  },
  {
   "rule": "Alabama state waters for reef fish extend 9 nm from shore; Alabama state reef fish seasons open and close with federal seasons (red snapper private season is set by ADCNR).",
   "url": "https://www.outdooralabama.com/fishing/saltwater-recreational-size-creel-limits"
  }
 ],
 "permits": [
  {
   "name": "Alabama saltwater fishing license",
   "required_for": "Anglers 16 and older. Alabama residents 65+ and lifetime license holders need a free saltwater angler registration instead. Under-16 anglers need no license but their catch must still be reported.",
   "url": "https://outdooralabama.com/articles/red-snapper-season-opens-7-day-week-starting-may-22"
  },
  {
   "name": "Alabama Gulf Reef Fish Endorsement",
   "required_for": "Anyone 16+ taking, attempting to take or possessing Gulf reef fish (red snapper, triggerfish, amberjack, groupers, other snappers) in Alabama; also operators of federal for-hire and state charter vessels. $10/year, lifetime $220.",
   "url": "https://www.outdooralabama.com/fishing/saltwater-recreational-size-creel-limits"
  },
  {
   "name": "Snapper Check landing report (Outdoor AL app)",
   "required_for": "One report per vessel trip by the owner/operator, filed before fish are removed from the boat or the boat is removed from the water, for red snapper landed in Alabama regardless of where caught; greater amberjack and gray triggerfish must also be reported when their seasons are open. Shore/pier/non-powered anglers report red snapper with a Conservation ID. Creel surveys or enforcement checks do not count as reporting.",
   "url": "https://outdooralabama.com/articles/red-snapper-season-opens-7-day-week-starting-may-22"
  },
  {
   "name": "No federal permit for private anglers (state license governs red snapper in the EEZ)",
   "required_for": "A private angler under Alabama's delegated red snapper management must comply with Alabama license rules and may not possess red snapper in the Gulf EEZ when Alabama's season is closed.",
   "url": "https://www.ecfr.gov/api/versioner/v1/full/2026-10-15/title-50.xml?part=622&section=622.34"
  }
 ]
};
