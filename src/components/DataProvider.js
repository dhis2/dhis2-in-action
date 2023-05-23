import React, { createContext, useState, useEffect } from "react";
import { getData, getFocusData } from "../utils/data";

export const DataContext = createContext();
export const FocusContext = createContext();

const DataProvider = ({ children }) => {
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

  return (
    <DataContext.Provider value={data}>
      <FocusContext.Provider value={focus}>{children}</FocusContext.Provider>
    </DataContext.Provider>
  );
};

export default DataProvider;
