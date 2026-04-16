import React from "react";
import "./GlobeToggle.css";

const GlobeToggle = ({ isGlobe, onToggle }) => (
  <div
    className={`GlobeToggle GlobeToggle-${isGlobe ? "en" : "dis"}abled`}
    role="button"
    tabIndex={0}
    onClick={onToggle}
    title={isGlobe ? "Switch to flat map" : "Switch to 3D globe"}
    aria-label={isGlobe ? "Switch to flat map" : "Switch to 3D globe"}
    aria-pressed={isGlobe}
  />
);

export default GlobeToggle;
