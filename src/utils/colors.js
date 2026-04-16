const noDataColor = "#fff";

/**
 * Returns the fill color for a country based on the active category legend and data.
 * @param {string} code - Country code (e.g. "UGA")
 * @param {Array}  legend - Legend array from categories (each item has { code, color })
 * @param {object} data - Parsed data object with { countriesOrStates, lastYear }
 * @returns {string} hex color string
 */
export const getCountryColor = (code, legend, data) => {
  if (!code || !legend || !data) return noDataColor;

  const { countriesOrStates, lastYear } = data;

  if (!countriesOrStates[code] || !countriesOrStates[code][lastYear]) {
    return noDataColor;
  }

  const letters = countriesOrStates[code][lastYear];
  let color = noDataColor;

  legend.forEach((item) => {
    if (letters.indexOf(item.code) !== -1 || item.code === "_") {
      color = item.color;
    }
  });

  return color;
};
