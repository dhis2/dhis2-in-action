import React, { useState, useRef, useMemo, useEffect } from "react";
import { map, geoJSON } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";

const Map = ({ category, data }) => {
  const [instance, setInstance] = useState();
  const [features, setFeatures] = useState();
  const mapContainer = useRef();

  useEffect(() => {
    setInstance(
      map(mapContainer.current).fitBounds([
        [-40, -110],
        [60, 165]
      ])
    );
  }, [mapContainer]);

  useEffect(() => {
    if (instance && features) {
      geoJSON(features, {
        color: "#555",
        weight: 1,
        fillColor: "#eee",
        fillOpacity: 0.8
      }).addTo(instance);
    }
  }, [instance, features]);

  useEffect(() => {
    fetch("./countries_indian_states.json")
      .then(response => response.json())
      .then(setFeatures);
  }, []);

  return <div ref={mapContainer} className="Map"></div>;
};

export default Map;
