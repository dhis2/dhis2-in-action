import React, { useContext } from "react";
import { CountriesContext, DataContext } from "./DataProvider";
import "./Loader.css";

const Loader = ({ items }) => {
  const countries = useContext(CountriesContext);
  const dataContext = useContext(DataContext);

  return countries && dataContext ? null : (
    <div className="mask">
      <div className="loader"></div>
    </div>
  );
};

export default Loader;
