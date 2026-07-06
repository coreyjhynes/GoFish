/* Core app data: launches, species. Compiled 2026-06-12. */
window.DATA_CORE = {
  built: "2026-06-12",
  // Fixed reference for ALL distance readouts (popups, lists, top picks):
  // the Anclote River entrance — where you clear the channel into open Gulf.
  distanceRef: { name: "Anclote River entrance", short: "Anclote entrance", lat: 28.1700, lon: -82.8000 },
  launches: [
    { id: "hudson", name: "Hudson (Hudson Beach ramp)", lat: 28.3622, lon: -82.7035,
      tideStation: "8727061", tideStationName: "Hudson, Hudson Creek" },
    { id: "anclote", name: "Anclote / Tarpon Springs", lat: 28.1700, lon: -82.8000,
      tideStation: "8726917", tideStationName: "Anclote Key (south end)" }, // positioned at the river ENTRANCE, not the upriver ramp
    { id: "clearwater", name: "Clearwater Pass", lat: 27.9745, lon: -82.8270,
      tideStation: "8726724", tideStationName: "Clearwater Beach" },
    { id: "johnspass", name: "John's Pass (Madeira Beach)", lat: 27.7843, lon: -82.7780,
      tideStation: "8726533", tideStationName: "Johns Pass" },
    { id: "skyway", name: "St. Pete / Skyway (mouth of bay)", lat: 27.7104, lon: -82.6808,
      tideStation: "8726364", tideStationName: "Mullet Key Channel (Skyway)" },
    /* Venice, LA */
    { id: "venice_marina", name: "Venice Marina (Tiger Pass)", region: "venice", lat: 29.2540, lon: -89.3550,
      tideStation: "8760551", tideStationName: "South Pass" },
    /* Florida Keys — Marathon first: home port for Keys trips */
    { id: "marathon", name: "Marathon (Boot Key)", region: "keys", lat: 24.7040, lon: -81.0980,
      tideStation: "8723970", tideStationName: "Vaca Key" },
    { id: "islamorada", name: "Islamorada (Whale Harbor)", region: "keys", lat: 24.9400, lon: -80.6080,
      tideStation: "8723795", tideStationName: "Whale Harbor, Hawk Channel" },
    { id: "keywest", name: "Key West (Stock Island)", region: "keys", lat: 24.5670, lon: -81.7330,
      tideStation: "8724580", tideStationName: "Key West" }
  ],
  // Regions: each with its own map view, launches, distance reference and species focus.
  // Spots/zones carry a `region` field ('tampa' when absent).
  regions: [
    { id: "tampa", name: "Tampa Bay → Hudson", center: [28.05, -83.45], zoom: 8,
      fpBearing: 262, fpMiles: 35,
      distanceRef: { name: "Anclote River entrance", short: "Anclote entrance", lat: 28.1700, lon: -82.8000 },
      species: ["red_snapper", "mangrove_snapper", "gag_grouper", "red_grouper", "scamp", "lane_snapper", "vermilion_snapper", "amberjack", "bay_scallop"] },
    { id: "venice", name: "Venice, LA — the Delta", center: [28.80, -89.15], zoom: 8,
      fpBearing: 150, fpMiles: 40,
      distanceRef: { name: "South Pass mouth", short: "South Pass", lat: 28.990, lon: -89.140 },
      species: ["yellowfin_tuna", "blackfin_tuna", "mahi", "wahoo", "swordfish", "mangrove_snapper", "amberjack"] },
    { id: "keys", name: "Florida Keys (Marathon)", center: [24.72, -81.00], zoom: 9,
      fpBearing: 155, fpMiles: 20,
      distanceRef: null, // Keys span 100+ mi — distances follow the selected launch
      species: ["mahi", "blackfin_tuna", "wahoo", "swordfish", "yellowtail_snapper", "mangrove_snapper", "amberjack", "hogfish"] }
  ],
  species: [
    { id: "red_snapper",      name: "Red Snapper",        short: "Red Snap",  color: "#ff5a5f" },
    { id: "mangrove_snapper", name: "Mangrove Snapper",   short: "Mangrove",  color: "#d98e04" },
    { id: "gag_grouper",      name: "Gag Grouper",        short: "Gag",       color: "#06d6a0" },
    { id: "red_grouper",      name: "Red Grouper",        short: "Red Grpr",  color: "#ef476f" },
    { id: "scamp",            name: "Scamp",              short: "Scamp",     color: "#b58aef" },
    { id: "lane_snapper",     name: "Lane Snapper",       short: "Lane",      color: "#f4a259" },
    { id: "vermilion_snapper",name: "Vermilion Snapper",  short: "Beeliner",  color: "#ff7f50" },
    { id: "amberjack",        name: "Greater Amberjack",  short: "AJ",        color: "#118ab2" },
    { id: "bay_scallop",      name: "Bay Scallop",        short: "Scallops",  color: "#ff9ecb" },
    { id: "yellowfin_tuna",   name: "Yellowfin Tuna",     short: "Yellowfin", color: "#ffe94d" },
    { id: "blackfin_tuna",    name: "Blackfin Tuna",      short: "Blackfin",  color: "#4d7cff" },
    { id: "mahi",             name: "Mahi (Dolphin)",     short: "Mahi",      color: "#3ddc70" },
    { id: "wahoo",            name: "Wahoo",              short: "Wahoo",     color: "#8be9fd" },
    { id: "swordfish",        name: "Swordfish",          short: "Sword",     color: "#c0a6ff" },
    { id: "tilefish",         name: "Golden Tilefish",    short: "Tilefish",  color: "#e5c07b", minor: true },
    { id: "yellowtail_snapper", name: "Yellowtail Snapper", short: "Yellowtail", color: "#ffd166", minor: true },
    { id: "black_grouper",    name: "Black Grouper",      short: "Black",     color: "#7a8b99", minor: true },
    { id: "gray_triggerfish", name: "Gray Triggerfish",   short: "Trigger",   color: "#9fb4c7", minor: true },
    { id: "hogfish",          name: "Hogfish (Gulf)",     short: "Hogfish",   color: "#e8a0bf", minor: true }
  ]
};
