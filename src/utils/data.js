import fetchJsonp from "fetch-jsonp";

export const categories = [
  {
    id: "health",
    title: "Health Information System",
    legend: [
      { code: "s", name: "National", color: "#238443" },
      { code: "i", name: "Indian State", color: "#78c679" },
      { code: "p", name: "Pilot", color: "#d9f0a3" },
    ],
    hasChart: true,
  },
  {
    id: "covid-19",
    title: "COVID-19",
    legend: [
      { code: "c", name: "Operational", color: "#d95f0e" },
      { code: "v", name: "In development", color: "#fec44f" },
    ],
    hasChart: false,
  },
  {
    id: "tracker",
    title: "Tracker",
    legend: [{ code: "t", name: "Tracker", color: "#e34a33" }],
    hasChart: true,
  },
  {
    id: "android",
    title: "Android app",
    legend: [{ code: "a", name: "Android app", color: "#2ca25f" }],
    hasChart: true,
  },
  {
    id: "emis",
    title: "Education Management Information System (EMIS)",
    legend: [{ code: "e", name: "DHIS2 for Education", color: "#1d91c0" }],
    hasChart: false,
  },
];

const getCol = (row, name) => row[`gsx$${name}`]["$t"];

const parseData = (data) => {
  const rows = data.feed.entry;
  const row = rows[0];
  const years = [];

  for (let col in row) {
    if (row.hasOwnProperty(col)) {
      if (col.slice(0, 5) === "gsx$y") {
        years.push(col.slice(-4));
      }
    }
  }

  const lastYear = years[years.length - 1];
  const countries = {};
  const year = {};

  rows.forEach((row) => {
    const id = getCol(row, "code");
    const name = getCol(row, "name");

    if (id) {
      const country = (countries[id] = {
        name: name,
      });

      years.forEach((y) => {
        let letters = getCol(row, `y${y}`);

        // Remove and fix in google spreadsheet
        if (id.startsWith("IN-")) {
          // s/p is not valid for indian states
          letters = letters.replace("s", "").replace("p", "");
        }

        if (letters.length) {
          country[y] = letters;

          if (!year[y]) {
            year[y] = {
              p: 0, // pilot
              s: 0, // national scale
              i: 0, // indian state
              t: 0, // tracker
              a: 0, // android
              e: 0, // education
              c: 0, // covid-19
              v: 0, // covid-19 (development)
            };
          }

          letters.split("").forEach((value) => {
            year[y][value]++;
          });
        }
      });
    }
  });

  return { countries, year, years, lastYear };
};

const parseFocusData = (data) => {
  const rows = data.feed.entry;
  const byCountry = {};

  rows.forEach((row) => {
    const id = getCol(row, "countrycode");
    const letter = getCol(row, "letter");
    const title = getCol(row, "title");
    const body = getCol(row, "body");
    const imageurl = getCol(row, "imageurl");
    const imagelink = getCol(row, "imagelink");
    const youtubeid = getCol(row, "youtubeid");
    const readmorelink = getCol(row, "readmorelink");

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
    `//spreadsheets.google.com/feeds/list/1Fd-vBoJPjp5wdCyJc7d_LOJPOg5uqdzVa3Eq5-VFR-g/${sheet}/public/values?alt=json-in-script`,
    { jsonpCallback: "callback" }
  ).then((response) => response.json());

export const getData = () => fetchData(1).then(parseData);

export const getFocusData = () => fetchData(2).then(parseFocusData);
