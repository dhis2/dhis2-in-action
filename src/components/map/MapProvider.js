import React, { createContext, useState, useRef, useEffect } from "react";
import { map as leafletMap } from "leaflet";
import { CRS } from "proj4leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";

export const MapContext = createContext();

const bounds = [
  [-40, -100],
  [50, 165],
];

const MapProvider = ({ children }) => {
  const [map, setMap] = useState();
  const mapContainer = useRef();

  useEffect(() => {
    setMap(
      leafletMap(mapContainer.current, {
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
  }, [mapContainer]);

  return (
    <div ref={mapContainer} className="Map">
      {map && <MapContext.Provider value={map}>{children}</MapContext.Provider>}
    </div>
  );
};

export default MapProvider;
