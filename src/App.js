import React, { useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Map from "./components/Map";
import Chart from "./components/Chart";
import { getData } from "./utils/data";
import "./App.css";

const App = () => {
  useEffect(() => {
    getData().then(console.log);

    console.log("load data");
  }, []);

  return (
    <div className="App">
      <Sidebar onChange={console.log} />
      <div className="App-main">
        <Map />
        <Chart />
      </div>
    </div>
  );
};

export default App;
