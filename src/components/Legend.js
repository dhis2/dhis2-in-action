import React from "react";
import "./Legend.css";

const Legend = ({ items }) => {
  return (
    <div className="Legend">
      {items.map(({ code, name, color }) => (
        <div key={code}>
          <span style={{ backgroundColor: color }}></span> {name}
        </div>
      ))}
    </div>
  );
};

export default Legend;
