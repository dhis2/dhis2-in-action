import React, { useState, useEffect } from "react";
import Fullscreen from "./Fullscreen";
import DataProvider from "./DataProvider";
import Loader from "./Loader";
import Sidebar from "./Sidebar";
import MapProvider from "./map/MapProvider";
import Graticule from "./map/Graticule";
import Countries from "./map/Countries";
import ChartList from "./ChartList";
import { categories } from "../utils/data";
import "./App.css";

const getInitialCategory = () => {
  const { hash } = window.location;

  if (hash) {
    const cat = hash.substr(1);

    if (categories.find((c) => c.id === cat)) {
      return cat;
    }
  }

  return "all"; // Default category
};

const App = () => {
  const [category, setCategory] = useState(getInitialCategory());
  const [country, setCountry] = useState();

  useEffect(() => {
    window.location.hash = `#${category}`;
  }, [category]);

  return (
    <Fullscreen>
      <DataProvider>
        <Loader />
        <Sidebar category={category} onSelect={setCategory}>
          <MapProvider>
            <Graticule />
            <Countries
              category={category}
              selected={country}
              setCountry={setCountry}
              setCategory={setCategory}
            />
          </MapProvider>
          <ChartList category={category} onClick={setCountry} />
        </Sidebar>
      </DataProvider>
    </Fullscreen>
  );
};

export default App;
