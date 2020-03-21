import React from "react";
import Category from "./Category";
import { categories } from "../utils/data";
import "./Sidebar.css";

const Sidebar = ({ category, onChange }) => (
  <div className="Sidebar">
    <div className="Sidebar-header">
      <h1>DHIS2 in action</h1>
      <p>
        DHIS2 is in use all over the world. Check out different use cases around
        the world with this interactive map.
      </p>
    </div>
    {categories.map(item => (
      <Category
        key={item.id}
        onClick={onChange}
        selected={category === item.id}
        {...item}
      />
    ))}
  </div>
);

export default Sidebar;
