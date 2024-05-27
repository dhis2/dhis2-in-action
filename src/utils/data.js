import fetchJsonp from "fetch-jsonp";

// Colors: https://sashamaps.net/docs/resources/20-colors/

export const categories = [
  {
    id: "all",
    group: "explore",
    title: "Where is DHIS2 used?",
    legend: [{ code: "_", name: "All countries", color: "#0080d4" }],
    hasChart: false,
  },
  {
    id: "health",
    group: "country-owned",
    title: "Health",
    legend: [
      { code: "s", name: "National", color: "#238443" },
      { code: "p", name: "Subnational", color: "#d9f0a3" },
    ],
    hasChart: true,
  },
  {
    id: "disease",
    group: "country-owned",
    title: "> Disease Surveillance",
    legend: [
      { code: "d", name: "National surveillance system", color: "#e34a33" },
    ],
    hasChart: false,
  },
  {
    id: "covid-19",
    group: "country-owned",
    title: "> COVID-19",
    legend: [
      { code: "y", name: "Surveillance & Vaccine", color: "#a63603" },
      { code: "c", name: "Surveillance only", color: "#fd8d3c" },
      { code: "x", name: "Vaccine only", color: "#fdd0a2" },
    ],
    hasChart: false,
  },
  {
    id: "animal",
    group: "country-owned",
    title: "> Animal health",
    legend: [
      {
        code: "z",
        name: "Animal health and zoonoses",
        color: "#ff7f00",
      },
    ],
    hasChart: false,
  },
  {
    id: "climate",
    group: "country-owned",
    title: "Climate",
    legend: [
      { code: "w", name: "Systems using climate data", color: "#008080" },
    ],
    hasChart: false,
  },
  {
    id: "logistics",
    group: "country-owned",
    title: "Logistics",
    legend: [{ code: "l", name: "DHIS2 for Logistics", color: "#808000" }],
    hasChart: false,
  },
  {
    id: "tracker",
    group: "country-owned",
    title: "Tracker",
    legend: [{ code: "t", name: "Tracker", color: "#e34a33" }],
    hasChart: true,
    legacy: true,
  },
  {
    id: "android",
    group: "country-owned",
    title: "Android app",
    legend: [{ code: "a", name: "Android app", color: "#2ca25f" }],
    hasChart: true,
    legacy: true,
  },
  {
    id: "emis",
    group: "country-owned",
    title: "Education",
    legend: [{ code: "e", name: "DHIS2 for Education", color: "#ae017e" }],
    hasChart: false,
  },
  {
    id: "other",
    group: "country-owned",
    title: "Other sectors",
    legend: [{ code: "o", name: "DHIS2 in other sectors", color: "#301934" }],
    hasChart: false,
  },
  {
    id: "projects",
    group: "other",
    title: "Projects using DHIS2",
    legend: [{ code: "n", name: "Non-governmental systems", color: "#ffe119" }], // "#6fa2d0"
    hasChart: false,
  },
];

export const categoryGroups = {
  explore: "Explore the map",
  "country-owned": "Country-owned systems",
  other: "NGO and other systems",
};

export const sidebarCategories = categories
  .filter((c) => !c.legacy)
  .map((c) => c.id);

export const legacyCategories = categories
  .filter((c) => c.legacy)
  .map((c) => c.id);

const allLetters = categories
  .flatMap((c) => c.legend)
  .filter((c) => c.code)
  .reduce((obj, { code }) => ({ ...obj, [code]: 0 }), {});

const isYear = /^Y\d{4}$/;

const parseData = (values, legacy) => {
  const cols = values[0];
  const idx = cols.indexOf("Code");
  const namex = cols.indexOf("Name");
  const years = cols.filter((c) => c.match(isYear)).map((c) => c.substring(1));
  const lastYear = years[years.length - 1];
  const rows = values.slice(1);
  const countries = {};
  const year = {};
  let skip = false;

  rows.forEach((row) => {
    const id = row[idx];
    const name = row[namex];

    // Loop until first empty id
    if (!id) {
      skip = true;
    }

    if (id && !skip) {
      const country = (countries[id] = {
        name: name,
      });

      years.forEach((y) => {
        let letters = row[cols.indexOf(`Y${y}`)];

        // Remove tracker and android
        if (!legacy) {
          letters = (letters || "").replace("t", "").replace("a", "");
        }

        if (letters) {
          if (letters.length) {
            country[y] = letters;

            if (!year[y]) {
              year[y] = { ...allLetters };
            }

            // '_' is used for any letter
            year[y]["_"]++;

            letters.split("").forEach((value) => {
              year[y][value]++;
            });
          }
        }
      });
    }
  });

  return { countries, year, years, lastYear };
};

const parseSheetData = ({ values }) => {
  return {
    current: parseData(values, false),
    legacy: parseData(values, true), // Includes tracker and android
  };
};

const parseFocusData = ({ values }) => {
  const cols = values[0];
  const rows = values.slice(1);
  const idx = cols.indexOf("Country code");
  const letterx = cols.indexOf("Letter");
  const titlex = cols.indexOf("Title");
  const bodyx = cols.indexOf("Body");
  const imageurlx = cols.indexOf("Image url");
  const imagelinkx = cols.indexOf("Image link");
  const youtubeidx = cols.indexOf("YouTube ID");
  const readmorelinkx = cols.indexOf("Read more link");
  const byCountry = {};

  rows.forEach((row) => {
    const id = row[idx];
    const letter = row[letterx];
    const title = row[titlex];
    const body = row[bodyx];
    const imageurl = row[imageurlx];
    const imagelink = row[imagelinkx];
    const youtubeid = row[youtubeidx];
    const readmorelink = row[readmorelinkx];

    if (!byCountry[id]) {
      byCountry[id] = {};
    }

    byCountry[id][letter] = {
      title,
      body,
      imageurl,
      imagelink,
      youtubeid,
      readmorelink,
    };
  });

  return byCountry;
};

const fetchData = (sheet) =>
  fetchJsonp(
    `https://sheets.googleapis.com/v4/spreadsheets/1GRqJrapEJ7HBnrsvcIA0PlTok1DfgRLng7S4XLODXS4/values/${sheet}?key=AIzaSyDWyCSemDgAxocSL7j9Dy4mi93xTTcPEek`,
    { jsonpCallback: "callback" }
  ).then((response) => response.json());

export const getData = () =>
  fetchData("Country status per year").then(parseSheetData);

export const getFocusData = () =>
  fetchData("Country focus").then(parseFocusData);
