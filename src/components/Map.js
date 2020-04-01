import React, { useState, useRef, useEffect } from "react";
import { map, geoJSON } from "leaflet";
import { CRS } from "proj4leaflet";
import "leaflet/dist/leaflet.css";
import Graticule from "../utils/graticule";
import { categories } from "../utils/data";
import "./Map.css";

const noDataColor = "#fff";

const bounds = [
  [-40, -100],
  [50, 165]
];

const Map = ({ category, data, height }) => {
  const [instance, setInstance] = useState();
  const [layer, setLayer] = useState();
  const container = useRef();

  useEffect(() => {
    setInstance(
      map(container.current, {
        crs: new CRS(
          "ESRI:53009",
          "+proj=moll +lon_0=0 +x_0=0 +y_0=0 +a=6371000 +b=6371000 +units=m +no_defs",
          {
            resolutions: [50000, 40000, 30000, 20000, 10000, 5000, 2500, 1250]
          }
        ),
        maxZoom: 7
      }).fitBounds(bounds)
    );
  }, [container]);

  useEffect(() => {
    if (instance) {
      instance.invalidateSize();
      instance.fitBounds(bounds);
    }
  }, [instance, height]);

  useEffect(() => {
    if (instance) {
      new Graticule({
        sphere: true,
        style: {
          opacity: 0,
          fillColor: "#edf7ff",
          fillOpacity: 1,
          clickable: false
        }
      }).addTo(instance);

      fetch("./countries_indian_states.json")
        .then(response => response.json())
        .then(features => {
          setLayer(
            geoJSON(features, {
              color: "#555",
              weight: 1,
              fillColor: noDataColor,
              fillOpacity: 0.75
            }).addTo(instance)
          );

          instance.invalidateSize();
        })
        .catch(error => console.log(error));
    }
  }, [instance, setLayer]);

  useEffect(() => {
    if (layer && category && data) {
      const { countries, lastYear } = data;
      const { legend } = categories.find(c => c.id === category);

      layer.eachLayer(item =>
        item.setStyle({
          fillColor: noDataColor
        })
      );

      layer.eachLayer(item => {
        const code = item.feature.properties.CODE;

        if (code && countries[code] && countries[code][lastYear]) {
          const country = countries[code];
          const letters = country[lastYear];

          // India: show country or states
          if (code === "IN") {
            if (legend.some(({ code }) => letters.includes(code))) {
              item.bringToFront();
            } else {
              item.bringToBack();
            }
          }

          legend.forEach(({ code, color }) => {
            if (letters.indexOf(code) !== -1) {
              item.setStyle({
                fillColor: color
              });
            }
          });
        }
      });

      layer.bindPopup(({ feature }) => {
        const { CODE, NAME } = feature.properties;
        const country = data.countries[CODE];
        const name = `<h2>${NAME}</h2>`;

        if (!country) {
          return name;
        }

        const items = legend
          .map(i => ({
            ...i,
            year: data.years.find(
              y => country[y] && country[y].includes(i.code)
            )
          }))
          .filter(i => i.year);

        const content = items.map(
          ({ name, year }) =>
            `${
              name.includes("National")
                ? CODE.includes("-")
                  ? "State"
                  : "National"
                : name
            }: ${year}`
        );

        return `${name}${content.join("<br/>")}`;
      });
    }
  }, [layer, category, data]);

  return <div ref={container} className="Map" style={{ height }}></div>;
};

export default Map;
