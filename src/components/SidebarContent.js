import React from "react";
import SidebarToggle from "./SidebarToggle";
import CategoryGroup from "./CategoryGroup";

const Sidebar = ({ category, isDocked, onClose, onSelect }) => {
  return (
    <>
      {!isDocked && <SidebarToggle type="close" onClick={onClose} />}
      <div className="Sidebar-header">
        <h1>DHIS2 in action</h1>
        <p>
          DHIS2 is in use all over the world. Check out different use cases with
          this interactive map.
        </p>
      </div>
      <CategoryGroup group="explore" onClick={onSelect} category={category} />
      <CategoryGroup
        group="country-owned"
        onClick={onSelect}
        category={category}
      />
      <CategoryGroup group="other" onClick={onSelect} category={category} />
    </>
  );
};

export default Sidebar;
