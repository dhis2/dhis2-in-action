import { useContext, useEffect } from "react";
import { geoJSON, marker, icon } from "leaflet";
import { MapContext } from "./MapProvider";
import { FocusContext } from "../DataProvider";
import { getIconPosition } from "../../utils/map";

const CountryFocus = ({ layer, legend, onClick }) => {
  const map = useContext(MapContext);
  const focus = useContext(FocusContext);

  useEffect(() => {
    if (map && layer && legend && focus) {
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
        }).on("click", onClick);

        map.addLayer(infoLayer);

        return () => {
          if (infoLayer) {
            infoLayer.off("click", onClick);
            map.removeLayer(infoLayer);
          }
        };
      }
    }
  }, [map, layer, legend, focus, onClick]);

  return null;
};

export default CountryFocus;
