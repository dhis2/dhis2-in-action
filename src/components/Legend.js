import React, { useContext, useMemo } from "react";
import { DataContext } from "./DataProvider";
import "./Legend.css";

const Legend = ({ items }) => {
  const dataContext = useContext(DataContext);
  const data = dataContext?.current;

  const count = useMemo(() => (data ? data.year[data.lastYear] : {}), [data]);

  return (
    <div className="Legend">
      {items.map(({ code, name, color }) => (
        <div key={color}>
          <span style={{ backgroundColor: color }}></span> {name}
          {count[code] ? ` (${count[code]})` : ""}
        </div>
      ))}
    </div>
  );
};

export default Legend;
