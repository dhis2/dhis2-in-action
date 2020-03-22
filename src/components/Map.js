import React, { useState, useRef, useEffect } from "react";
import { map, geoJSON } from "leaflet";
import { CRS } from "proj4leaflet";
import "leaflet/dist/leaflet.css";
import Graticule from "../utils/graticule";
import { categories } from "../utils/data";
import "./Map.css";

const noDataColor = "#fff";

const Map = ({ category, data }) => {
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
        )
      }).fitBounds([
        [-40, -80],
        [60, 165]
      ])
    );
  }, [container]);

  useEffect(() => {
    if (instance) {
      new Graticule({
        sphere: true,
        style: {
          opacity: 0,
          fillColor: "#f5fbfe",
          fillOpacity: 1,
          clickable: false
        }
      }).addTo(instance);

      new Graticule({
        style: {
          color: "#fafafa",
          weight: 1,
          opacity: 1,
          clickable: false
        }
      }).addTo(instance);

      fetch("./countries_indian_states.json")
        .then(response => response.json())
        .then(features =>
          setLayer(
            geoJSON(features, {
              color: "#777",
              weight: 1,
              fillColor: noDataColor,
              fillOpacity: 0.8
            }).addTo(instance)
          )
        );
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

          legend.forEach(({ code, color }) => {
            if (letters.indexOf(code) !== -1) {
              item.setStyle({
                fillColor: color
              });
            }
          });
        }
      });
    }
  }, [layer, category, data]);

  return <div ref={container} className="Map"></div>;
};

export default Map;
