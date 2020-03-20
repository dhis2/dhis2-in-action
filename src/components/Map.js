import React, { useRef, useEffect } from "react";
import { map, geoJSON } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";

const Map = props => {
  const mapContainer = useRef();

  useEffect(() => {
    const instance = map(mapContainer.current);

    instance.fitBounds([
      [-40, -110],
      [60, 165]
    ]);

    fetch("./countries_indian_states.json")
      .then(response => response.json())
      .then(data => {
        // Work with JSON data here
        const features = geoJSON(data, {
          color: "#555",
          weight: 1,
          fillColor: "#eee",
          fillOpacity: 0.8
        }).addTo(instance);
      });
  }, [mapContainer]);

  return <div ref={mapContainer} className="Map"></div>;
};

export default Map;
