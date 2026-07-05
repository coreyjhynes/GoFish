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
      tideStation: "8726364", tideStationName: "Mullet Key Channel (Skyway)" }
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
    { id: "yellowtail_snapper", name: "Yellowtail Snapper", short: "Yellowtail", color: "#ffd166", minor: true },
    { id: "black_grouper",    name: "Black Grouper",      short: "Black",     color: "#7a8b99", minor: true },
    { id: "gray_triggerfish", name: "Gray Triggerfish",   short: "Trigger",   color: "#9fb4c7", minor: true },
    { id: "hogfish",          name: "Hogfish (Gulf)",     short: "Hogfish",   color: "#e8a0bf", minor: true }
  ]
};
