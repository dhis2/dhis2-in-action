import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { map, geoJSON, marker, icon, popup } from "leaflet";
import { CRS } from "proj4leaflet";
import "leaflet/dist/leaflet.css";
import Graticule from "../utils/graticule";
import { categories } from "../utils/data";
import { getIconPosition } from "../utils/map";
import "./Map.css";

const noDataColor = "#fff";

const bounds = [
  [-40, -100],
  [50, 165],
];

const Map = ({ category, data, focus, selected, onClick }) => {
  const [instance, setInstance] = useState();
  const [layer, setLayer] = useState();
  const container = useRef();

  const legend = useMemo(
    () => categories.find((c) => c.id === category).legend,
    [category]
  );

  const onFeatureClick = useCallback(
    ({ latlng, layer }) => {
      const { feature } = layer;
      const { CODE, NAME } = feature.properties;
      const country = data.countries[CODE];
      let content = `<h2>${NAME}</h2>`;

      if (country) {
        const countryFocus = focus[CODE];

        const items = legend
          .map((i) => ({
            ...i,
            year: data.years.find(
              (y) => country[y] && country[y].includes(i.code)
            ),
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
        }

        if (countryFocus) {
          const letter = items
            .map((i) => i.code)
            .find((l) => !!countryFocus[l]);

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
                '<iframe width="260" height="146" src="https://www.youtube.com/embed/hynRGQCvIo8" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
            } else if (imageurl) {
              content += `${
                imageurl
                  ? `${
                      imagelink ? `<a href="${imagelink}">` : ""
                    }<img src="${imageurl}" height="100px" />${
                      imagelink ? `</a>` : ""
                    }`
                  : ""
              }`;
            }

            if (readmorelink) {
              content += `<p><a href="${readmorelink}">Learn more</a></p>`;
            }
          }
        }
      }

      popup({
        maxWidth: 260,
      })
        .setLatLng(latlng)
        .setContent(content)
        .openOn(instance);

      onClick();
    },
    [instance, legend, data, focus, onClick]
  );

  useEffect(() => {
    setInstance(
      map(container.current, {
        crs: new CRS(
          "ESRI:53009",
          "+proj=moll +lon_0=0 +x_0=0 +y_0=0 +a=6371000 +b=6371000 +units=m +no_defs",
          {
            resolutions: [50000, 40000, 30000, 20000, 10000, 5000, 2500, 1250],
          }
        ),
        maxZoom: 7,
      }).fitBounds(bounds)
    );
  }, [container]);

  useEffect(() => {
    if (instance) {
      new Graticule({
        sphere: true,
        style: {
          opacity: 0,
          fillColor: "#edf7ff",
          fillOpacity: 1,
          clickable: false,
        },
      }).addTo(instance);

      fetch("./countries_indian_states.json")
        .then((response) => response.json())
        .then((features) => {
          setLayer(
            geoJSON(features, {
              color: "#555",
              weight: 1,
              fillColor: noDataColor,
              fillOpacity: 0.75,
            }).addTo(instance)
          );

          instance.invalidateSize();
        })
        .catch((error) => console.log(error));
    }
  }, [instance, setLayer]);

  useEffect(() => {
    if (layer && legend && data) {
      const { countries, lastYear } = data;

      layer.eachLayer((item) =>
        item.setStyle({
          fillColor: noDataColor,
        })
      );

      layer.eachLayer((item) => {
        const code = item.feature.properties.CODE;

        if (code && countries[code] && countries[code][lastYear]) {
          const country = countries[code];
          const letters = country[lastYear];

          // Use name from Google Spreadsheet
          item.feature.properties.NAME = country.name;

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
                fillColor: color,
              });
            }
          });
        }
      });
    }
  }, [layer, legend, data]);

  useEffect(() => {
    if (layer) {
      layer.on("click", onFeatureClick);
    }
    return () => {
      if (layer) {
        layer.off("click", onFeatureClick);
      }
    };
  }, [layer, data, focus, onFeatureClick]);

  useEffect(() => {
    if (instance && layer && legend && focus) {
      let infoLayer;
      let onZoomEnd;

      const features = layer
        .getLayers()
        .filter(({ feature }) => {
          const code = feature.properties.CODE;
          return focus[code] && legend.some((l) => focus[code][l.code]);
        })
        .map(({ feature }) => ({
          ...feature,
          geometry: {
            type: "Point",
            coordinates: getIconPosition(feature.geometry),
          },
        }));

      if (features.length) {
        const markerOptions = {
          icon: icon({
            iconUrl: "icon-info-48.png",
            iconSize: [20, 20],
          }),
        };

        infoLayer = geoJSON(features, {
          pointToLayer: (feature, latlng) => marker(latlng, markerOptions),
        }).on("click", onFeatureClick);

        onZoomEnd = () =>
          instance[instance.getZoom() > 1 ? "addLayer" : "removeLayer"](
            infoLayer
          );

        // instance.on("zoomend", onZoomEnd);

        onZoomEnd();

        return () => {
          if (infoLayer) {
            // instance.off("zoomend", onZoomEnd);
            infoLayer.off("click", onFeatureClick);
            instance.removeLayer(infoLayer);
          }
        };
      }
    }
  }, [instance, layer, legend, focus, data, onFeatureClick]);

  useEffect(() => {
    if (selected && layer) {
      const selectedLayer = layer
        .getLayers()
        .find((l) => l.feature.properties.NAME === selected);

      if (selectedLayer) {
        onFeatureClick({
          layer: selectedLayer,
          latlng: getIconPosition(selectedLayer.feature.geometry).reverse(),
        });
      }
    }
  }, [selected, layer, onFeatureClick]);

  return <div ref={container} className="Map"></div>;
};

export default Map;
