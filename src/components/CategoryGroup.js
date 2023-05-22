import React from "react";
import Category from "./Category";
import { categoryGroups, categories } from "../utils/data";

const CategoryGroup = ({ group, category, data, onClick }) => (
  <div>
    <h2>{categoryGroups[group]}</h2>
    {categories
      .filter((c) => c.group === group && c.inSidebar)
      .map((item) => (
        <Category
          key={item.id}
          onClick={onClick}
          selected={category === item.id}
          data={data}
          {...item}
        />
      ))}
  </div>
);

export default CategoryGroup;
