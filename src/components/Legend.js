import React, { useMemo } from "react";
import "./Legend.css";

const Legend = ({ items, data }) => {
  const count = useMemo(() => (data ? data.year[data.lastYear] : {}), [data]);

  return (
    <div className="Legend">
      {items.map(({ code, name, color }) => (
        <div key={code}>
          <span style={{ backgroundColor: color }}></span> {name} ({count[code]}
          )
        </div>
      ))}
    </div>
  );
};

export default Legend;
