import { categories } from "../utils/data";

const isExploreMode = (legend) => legend[0].code === "_";

export const getPopupContent = (feature, data, focus, legend) => {
  const { CODE, NAME } = feature.properties;
  const country = data.countries[CODE];
  let content = `<h2>${NAME}</h2>`;

  if (country) {
    const countryFocus = focus && focus[CODE];

    const items = legend
      .map((i) => ({
        ...i,
        year: data.years.find((y) => country[y] && country[y].includes(i.code)),
      }))
      .filter((i) => i.year);

    const letter =
      countryFocus && items.map((i) => i.code).find((l) => !!countryFocus[l]);

    const itemsContent = items.length
      ? items
          .map(({ name, year }) =>
            name === "National"
              ? `National scale since ${year}`
              : name === "Subnational"
              ? `Using DHIS2 since ${year}`
              : `${name}: ${year}`
          )
          .join("<br/>")
      : "";

    if (letter) {
      if (itemsContent) {
        content += `<p>${itemsContent}</p>`;
      }

      const { title, body, imageurl, imagelink, youtubeid, readmorelink } =
        countryFocus[letter];

      content += `<h3>${title}</h3>${body}`;

      if (youtubeid) {
        content += `<div class="aspect-ratio"><iframe src="https://www.youtube.com/embed/${youtubeid}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
      } else if (imageurl) {
        content += `${
          imageurl
            ? `${
                imagelink ? `<a href="${imagelink}" target="_blank">` : ""
              }<img src="${imageurl}" />${imagelink ? `</a>` : ""}`
            : ""
        }`;
      }

      if (readmorelink) {
        content += `<p><a href="${readmorelink}" target="_blank">Learn more</a></p>`;
      }
    } else if (itemsContent) {
      content += itemsContent;
    } else if (isExploreMode(legend)) {
      const letters = country[data.lastYear];

      content += categories
        .filter(
          (c) => c.inSidebar && c.legend.find((l) => letters.includes(l.code))
        )
        .map(({ title, legend }) => {
          const { name } = legend.find((l) => letters.includes(l.code));
          return legend.length > 1 ? `${title}: ${name}` : name;
        })
        .join("<br/>");
    }
  }

  return content;
};
