import React from "react";
import Sidebar from "./components/Sidebar";
import Map from "./components/Map";
import Chart from "./components/Chart";
import "./App.css";

const App = () => (
  <div className="App">
    <Sidebar />
    <div className="App-main">
      <Map />
      <Chart />
    </div>
  </div>
);

export default App;
