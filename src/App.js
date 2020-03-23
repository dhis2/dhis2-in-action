import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Map from "./components/Map";
import Chart from "./components/Chart";
import { getData } from "./utils/data";
import "./App.css";

const App = () => {
  const [category, setCategory] = useState("health");
  const [data, setData] = useState();

  useEffect(() => {
    getData().then(setData);
  }, []);

  return (
    <div className="App">
      <Sidebar category={category} data={data} onChange={setCategory} />
      <div className="App-main">
        <Map category={category} data={data} />
        <Chart category={category} data={data} />
      </div>
    </div>
  );
};

export default App;
