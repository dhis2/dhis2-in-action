import React from "react";
import Legend from "./Legend";
import "./Category.css";

const Category = ({ id, title, count, legend, selected, onClick }) => (
  <div
    onClick={() => onClick(id)}
    className={`Category${selected ? " Category-selected" : ""}`}
  >
    <h2>
      <span className="Category-count">{count}</span>
      <span className="Category-title">{title}</span>
      implementations
    </h2>
    {selected && <Legend items={legend} />}
  </div>
);

export default Category;
