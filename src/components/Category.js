import React, { useMemo } from "react";
import Legend from "./Legend";
import "./Category.css";

const Category = ({ id, title, legend, selected, data, onClick }) => {
  const count = useMemo(() => {
    if (data) {
      const { year, lastYear } = data;

      return legend.reduce((c, { code }) => (c += year[lastYear][code]), 0);
    }
    return "";
  }, [legend, data]);

  return (
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
};

export default Category;
