import fetchJsonp from "fetch-jsonp";

export const categories = [
  {
    id: "health",
    title: "Health",
    legend: [
      { code: "s", name: "National", color: "#238443" },
      { code: "p", name: "Subnational", color: "#d9f0a3" },
    ],
    hasChart: true,
    inSidebar: true,
  },
  {
    id: "disease",
    title: "Disease Surveillance",
    legend: [{ code: "d", name: "Disease surveillance", color: "#e34a33" }],
    hasChart: false,
    inSidebar: true,
  },
  {
    id: "covid-19",
    title: "COVID-19",
    legend: [
      { code: "y", name: "Surveillance & Vaccine", color: "#a63603" },
      { code: "c", name: "Surveillance only", color: "#fd8d3c" },
      { code: "x", name: "Vaccine only", color: "#fdd0a2" },
    ],
    hasChart: false,
    inSidebar: true,
  },
  {
    id: "logistics",
    title: "Logistics",
    legend: [{ code: "l", name: "Logistics", color: "#1d91c0" }],
    hasChart: false,
    inSidebar: true,
  },
  {
    id: "tracker",
    title: "Tracker",
    legend: [{ code: "t", name: "Tracker", color: "#e34a33" }],
    hasChart: true,
    inSidebar: false,
  },
  {
    id: "android",
    title: "Android app",
    legend: [{ code: "a", name: "Android app", color: "#2ca25f" }],
    hasChart: true,
    inSidebar: false,
  },
  {
    id: "emis",
    title: "Education",
    legend: [{ code: "e", name: "DHIS2 for Education", color: "#ae017e" }],
    hasChart: false,
    inSidebar: true,
  },
];

export const sidebarCategories = categories
  .filter((c) => c.inSidebar)
  .map((c) => c.id);

const allLetters = categories
  .flatMap((c) => c.legend)
  .reduce((obj, { code }) => ({ ...obj, [code]: 0 }), {});

const isYear = /^Y\d{4}$/;

const parseData = ({ values }) => {
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

        if (letters) {
          if (letters.length) {
            country[y] = letters;

            if (!year[y]) {
              year[y] = { ...allLetters };
            }

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
  fetchData("Country status per year").then(parseData);

export const getFocusData = () =>
  fetchData("Country focus").then(parseFocusData);
