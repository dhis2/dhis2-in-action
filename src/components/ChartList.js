import React, { useContext, useState } from "react";
import Chart from "./Chart";
import List from "./List";
import { DataContext, FocusContext } from "./DataProvider";
import { categories, legacyCategories } from "../utils/data";
import "./ChartList.css";

const ChartListToggle = ({ category, onClick }) => {
  const dataContext = useContext(DataContext);
  const data =
    dataContext?.[legacyCategories.includes(category) ? "legacy" : "current"];
  const focus = useContext(FocusContext);
  const [showChart, setShowChart] = useState(true);
  const { hasChart } = categories.find((c) => c.id === category);

  return (
    <div className="ChartList">
      <div className="menu">
        {hasChart && (
          <div className="toggle" onClick={() => setShowChart(!showChart)}>
            {showChart
              ? "View list of implementations"
              : "View chart of adoption over time"}
          </div>
        )}
      </div>
      <div className="wrapper" style={{ top: hasChart ? 30 : 5 }}>
        <Chart category={category} data={data} show={hasChart && showChart} />
        <List
          category={category}
          data={data}
          show={!showChart || !hasChart}
          focus={focus}
          onClick={onClick}
        />
      </div>
    </div>
  );
};

export default ChartListToggle;
