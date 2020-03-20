import React from "react";
import "./Category.css";

const Category = ({ title, count, legend, selected }) => {
  console.log("props", title, count, legend, selected);

  return (
    <div className="Category">
      <h2>
        {count} {title} implementations
      </h2>
    </div>
  );
};

export default Category;
