import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Map from "./components/Map";
import Chart from "./components/Chart";
import { categories, getData } from "./utils/data";
import "./App.css";

const getInitialCategory = () => {
  const { hash } = window.location;

  if (hash) {
    const cat = hash.substr(1);

    if (categories.find(c => c.id === cat)) {
      return cat;
    }
  }

  return "health"; // Default category
};

const App = () => {
  const [category, setCategory] = useState(getInitialCategory());
  const [data, setData] = useState();
  const { showChart } = categories.find(c => c.id === category);

  useEffect(() => {
    getData().then(setData);
  }, []);

  useEffect(() => {
    window.location.hash = `#${category}`;
  }, [category]);

  return (
    <div className="App">
      <Sidebar category={category} data={data} onChange={setCategory} />
      <div className="App-main">
        <Map
          category={category}
          data={data}
          height={showChart ? "58%" : "100%"}
        />
        <Chart category={category} data={data} show={showChart} />
      </div>
    </div>
  );
};

export default App;
