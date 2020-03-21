import fetchJsonp from "fetch-jsonp";

export const categories = [
  {
    id: "health",
    title: "Health System",
    count: 98,
    legend: [
      { code: "p", name: "National", color: "#009688" },
      { code: "s", name: "Pilot", color: "#B2DFDB" }
    ],
    selected: false
  },
  {
    id: "health2",
    title: "Health System",
    count: 98,
    legend: [
      { code: "p", name: "National", color: "#009688" },
      { code: "s", name: "Pilot", color: "#B2DFDB" }
    ],
    selected: true
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
      name: name,
      pilot: row["gsx$pilot"]["$t"] || null,
      national: row["gsx$scale"]["$t"] || null,
      tracker: row["gsx$tracker"]["$t"] || null,
      android: row["gsx$android"]["$t"] || null,
      emis: row["gsx$emis"]["$t"] || null
    });

    years.forEach(y => {
      const letters = row["gsx$y" + y]["$t"];

      if (letters.length) {
        country[y] = letters;

        if (!year[y]) {
          year[y] = {
            p: 0,
            s: 0,
            t: 0,
            a: 0,
            e: 0,
            c: 0,
            v: 0
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