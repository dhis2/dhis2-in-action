import React, { createContext, useState, useEffect } from "react";
import { getData, getFocusData } from "../utils/data";

export const CountriesContext = createContext();
export const DataContext = createContext();
export const FocusContext = createContext();

const DataProvider = ({ children }) => {
  const [countries, setCountries] = useState();
  const [data, setData] = useState();
  const [focus, setFocus] = useState();

  useEffect(() => {
    fetch("./countries.json")
      .then((response) => response.json())
      .then(setCountries)
      .catch((error) => console.log(error));

    getData().then(setData);
  }, []);

  // Load country focus after main data is loaded
  useEffect(() => {
    if (data) {
      getFocusData().then(setFocus);
    }
  }, [data]);

  return (
    <>
      <CountriesContext.Provider value={countries}>
        <DataContext.Provider value={data}>
          <FocusContext.Provider value={focus}>
            {children}
          </FocusContext.Provider>
        </DataContext.Provider>
      </CountriesContext.Provider>
    </>
  );
};

export default DataProvider;
