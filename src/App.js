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
  const [selected, setSelected] = useState();

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
    setSelected();
  }, [category]);

  return (
    <Fullscreen>
      <Sidebar category={category} data={data} onSelect={setCategory}>
        <Map
          category={category}
          data={data}
          focus={focus}
          selected={selected}
          height={"58%"}
          onClick={setSelected}
        />
        <ChartList
          category={category}
          data={data}
          focus={focus}
          onClick={setSelected}
        />
      </Sidebar>
    </Fullscreen>
  );
};

export default App;
