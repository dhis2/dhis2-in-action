import React, { useState, useEffect } from "react";
import Fullscreen from "./components/Fullscreen";
import Sidebar from "./components/Sidebar";
import Map from "./components/Map";
import ChartList from "./components/ChartList";
import { categories, getData, getFocusData } from "./utils/data";
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
  const [focus, setFocus] = useState();

  useEffect(() => {
    getData().then(setData);
  }, []);

  // Load country focus after main data is loaded
  useEffect(() => {
    if (data) {
      getFocusData().then(setFocus);
    }
  }, [data]);

  useEffect(() => {
    window.location.hash = `#${category}`;
  }, [category]);

  return (
    <Fullscreen>
      <Sidebar category={category} data={data} onSelect={setCategory}>
        <Map category={category} data={data} focus={focus} height={"58%"} />
        <ChartList category={category} data={data} focus={focus} />
      </Sidebar>
    </Fullscreen>
  );
};

export default App;
