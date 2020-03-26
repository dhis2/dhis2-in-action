import fetchJsonp from "fetch-jsonp";

export const categories = [
  {
    id: "health",
    title: "Health Information System",
    legend: [
      { code: "s", name: "National", color: "#238443" },
      { code: "i", name: "Indian State", color: "#78c679" },
      { code: "p", name: "Pilot", color: "#d9f0a3" }
    ],
    showChart: true
  },
  {
    id: "covid-19",
    title: "COVID-19",
    legend: [
      { code: "c", name: "Operational", color: "#d95f0e" },
      { code: "v", name: "In development", color: "#fec44f" }
    ],
    showChart: false
  },
  {
    id: "tracker",
    title: "Tracker",
    legend: [{ code: "t", name: "Tracker", color: "#e34a33" }],
    showChart: true
  },
  {
    id: "android",
    title: "Android app",
    legend: [{ code: "a", name: "Android app", color: "#2ca25f" }],
    showChart: true
  },
  {
    id: "emis",
    title: "Education Management Information System (EMIS)",
    legend: [{ code: "e", name: "DHIS2 for Education", color: "#1d91c0" }],
    showChart: false
  }
];

const parseData = data => {
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

  rows.forEach(row => {
    const id = row["gsx$code"]["$t"];
    const name = row["gsx$name"]["$t"];

    const country = (countries[id] = {
      name: name
    });

    years.forEach(y => {
      let letters = row["gsx$y" + y]["$t"];

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
            v: 0 // covid-19 (development)
          };
        }

        letters.split("").forEach(value => {
          year[y][value]++;
        });
      }
    });
  });

  return { countries, year, years, lastYear };
};

export const getData = () =>
  fetchJsonp(
    "//spreadsheets.google.com/feeds/list/1Fd-vBoJPjp5wdCyJc7d_LOJPOg5uqdzVa3Eq5-VFR-g/1/public/values?alt=json-in-script",
    { jsonpCallback: "callback" }
  )
    .then(response => response.json())
    .then(parseData);
