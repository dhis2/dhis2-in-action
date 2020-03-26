import React from "react";
import Legend from "./Legend";
import "./Category.css";

const Category = ({ id, title, legend, selected, data, onClick }) => (
  <div
    onClick={() => onClick(id)}
    className={`Category${selected ? " Category-selected" : ""}`}
  >
    <h2>{title}</h2>
    {selected && <Legend items={legend} data={data} />}
  </div>
);

export default Category;
