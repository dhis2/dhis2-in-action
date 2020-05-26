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

    if (!countryFocus) {
      content += items
        .map(
          ({ name, year }) =>
            `${
              name.includes("National")
                ? CODE.includes("-")
                  ? "State"
                  : "National"
                : name
            }: ${year}`
        )
        .join("<br/>");
    } else {
      const letter = items.map((i) => i.code).find((l) => !!countryFocus[l]);

      if (letter) {
        const {
          title,
          body,
          imageurl,
          imagelink,
          videourl,
          readmorelink,
        } = countryFocus[letter];

        content += `<h3>${title}</h3>${body}`;

        if (videourl) {
          content +=
            '<div class="aspect-ratio"><iframe src="https://www.youtube.com/embed/hynRGQCvIo8" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
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
      }
    }
  }

  return content;
};
