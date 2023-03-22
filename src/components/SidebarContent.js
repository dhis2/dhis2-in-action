import React from "react";
import SidebarToggle from "./SidebarToggle";
import Category from "./Category";
import { categories } from "../utils/data";

const Sidebar = ({ category, data, isDocked, onClose, onSelect }) => (
  <>
    {!isDocked && <SidebarToggle type="close" onClick={onClose} />}
    <div className="Sidebar-header">
      <h1>DHIS2 in action</h1>
      <p>
        DHIS2 is in use all over the world. Check out different use cases with
        this interactive map.
      </p>
    </div>
    {categories
      .filter((c) => c.isVisible)
      .map((item) => (
        <Category
          key={item.id}
          onClick={onSelect}
          selected={category === item.id}
          data={data}
          {...item}
        />
      ))}
  </>
);

export default Sidebar;
