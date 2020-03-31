import React from "react";
import "./SidebarToggle.css";

const SidebarToggle = ({ type, onClick }) => (
  <div className={`SidebarToggle SidebarToggle-${type}`} onClick={onClick}>
    {type === "open" ? (
      <>
        Map options<span>&gt;</span>
      </>
    ) : (
      <>
        <span>&lt;</span>Close map options
      </>
    )}
  </div>
);

export default SidebarToggle;
