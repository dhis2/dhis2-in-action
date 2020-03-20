import React from "react";
import Sidebar from "./components/Sidebar";
import "./App.css";

const App = () => (
  <div className="App">
    <Sidebar />
    <div className="App-main">
      <div className="App-map">MAP</div>
      <div className="App-chart">CHART</div>
    </div>
  </div>
);

export default App;
