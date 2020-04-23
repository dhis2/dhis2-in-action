import React, { useState, useEffect } from "react";
import Fullscreen from "./components/Fullscreen";
import Sidebar from "./components/Sidebar";
import Map from "./components/Map";
import ChartList from "./components/ChartList";
// import Chart from "./components/Chart";
// import List from "./components/List";
import { categories, getData } from "./utils/data";
import "./App.css";

const getInitialCategory = () => {
  const { hash } = window.location;

  if (hash) {
    const cat = hash.substr(1);

    if (categories.find((c) => c.id === cat)) {
      return cat;
    }
  }

  return "health"; // Default category
};

const App = () => {
  const [category, setCategory] = useState(getInitialCategory());
  const [data, setData] = useState();
  // const { showChart } = categories.find((c) => c.id === category);

  useEffect(() => {
    getData().then(setData);
  }, []);

  useEffect(() => {
    window.location.hash = `#${category}`;
  }, [category]);

  //
  // <List category={category} data={data} show={true} />

  /*
  <div>
          <ChartListToggle />
          <Chart category={category} data={data} show={showChart} />
        </div>
        */

  return (
    <Fullscreen>
      <Sidebar category={category} data={data} onSelect={setCategory}>
        <Map
          category={category}
          data={data}
          // height={showChart ? "58%" : "100%"}
          height={"58%"}
        />
        <ChartList category={category} data={data} />
      </Sidebar>
    </Fullscreen>
  );
};

export default App;
