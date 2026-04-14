import React from "react";
import "./GlobeToggle.css";

const GlobeToggle = ({ isGlobe, onToggle }) => (
  <div
    className={`GlobeToggle GlobeToggle-${isGlobe ? "en" : "dis"}abled`}
    onClick={onToggle}
    title={isGlobe ? "Switch to flat map" : "Switch to 3D globe"}
  />
);

export default GlobeToggle;
