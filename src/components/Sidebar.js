import React from "react";
import Category from "./Category";
import "./Sidebar.css";

const data = [
  {
    key: "health",
    title: "Health System",
    count: 98,
    legend: [
      {
        p: { name: "National", color: "#009688" },
        s: { name: "Pilot", color: "#009688" }
      }
    ],
    selected: false
  },
  {
    key: "health2",
    title: "Health System",
    count: 98,
    legend: [
      {
        p: { name: "National", color: "#009688" },
        s: { name: "Pilot", color: "#009688" }
      }
    ],
    selected: true
  }
];

const Sidebar = () => {
  return (
    <div className="Sidebar">
      <div className="Sidebar-header">
        <h1>DHIS2 in action</h1>
        <p>
          DHIS2 is in use all over the world. Check out different use cases
          around the world with this interactive map.
        </p>
      </div>
      {data.map(item => (
        <Category {...item} />
      ))}
    </div>
  );
};

export default Sidebar;
