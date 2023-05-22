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
import { getPopupContent } from "../utils/popup";
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
      const content = getPopupContent(layer.feature, data, focus, legend);
      const { clientWidth, clientHeight } = container.current;
      const maxWidth = clientWidth < 400 ? clientWidth - 100 : 300;
      const maxHeight = clientHeight - 100;

      popup({
        maxWidth,
        maxHeight,
      })
        .setLatLng(latlng)
        .setContent(content)
        .openOn(instance);

      onClick(); // Clear previously clicked country
    },
    [instance, container, legend, data, focus, onClick]
  );

  const onPopupOpen = useCallback(
    () => document.body.classList.add("popupopen"),
    []
  );

  const onPopupClose = useCallback(
    () => document.body.classList.remove("popupopen"),
    []
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

      fetch("./countries.json")
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

          legend.forEach(({ code, color }) => {
            if (letters.indexOf(code) !== -1 || code === "_") {
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

        instance.addLayer(infoLayer);

        return () => {
          if (infoLayer) {
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

  useEffect(() => {
    if (instance) {
      instance.on("popupopen", onPopupOpen);
      instance.on("popupclose", onPopupClose);
    }

    return () => {
      if (instance) {
        instance.off("popupopen", onPopupOpen);
        instance.off("popupclose", onPopupClose);
      }
    };
  }, [instance, onPopupOpen, onPopupClose]);

  // Close popup when category changes
  useEffect(() => {
    if (instance) {
      instance.closePopup();
    }
  }, [instance, category]);

  return <div ref={container} className="Map"></div>;
};

export default Map;
