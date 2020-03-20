import React from "react";
import Legend from "./Legend";
import "./Category.css";

const Category = ({ title, count, legend, selected }) => {
  // console.log("props", title, count, legend, selected);

  return (
    <div className={`Category${selected ? " Category-selected" : ""}`}>
      <h2>
        <span className="Category-count">{count}</span>
        <span className="Category-title">{title}</span>
        implementations
      </h2>
      {selected && <Legend items={legend} />}
    </div>
  );
};

export default Category;
