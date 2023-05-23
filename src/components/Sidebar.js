import React, { useState, useEffect } from "react";
import ReactSidebar from "react-sidebar";
import SidebarContent from "./SidebarContent";
import SidebarToggle from "./SidebarToggle";
import { sidebarCategories } from "../utils/data";
import "./Sidebar.css";

const App = ({ category, onSelect, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarDocked, setSidebarDocked] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: 700px)`);
    mql.addListener(() => setSidebarDocked(mql.matches));
    setSidebarDocked(mql.matches);
  }, []);

  if (!sidebarCategories.includes(category)) {
    return children;
  }

  return (
    <ReactSidebar
      sidebar={
        <SidebarContent
          category={category}
          onSelect={onSelect}
          isDocked={sidebarDocked}
          onClose={() => setSidebarOpen(false)}
        />
      }
      open={sidebarOpen}
      docked={sidebarDocked}
      onSetOpen={() => setSidebarOpen(true)}
      rootClassName="App"
      contentClassName="App-main"
      overlayClassName="App-overlay"
      sidebarClassName="Sidebar"
    >
      {sidebarOpen && !sidebarDocked && (
        <div className="App-mask" onClick={() => setSidebarOpen(false)}></div>
      )}
      <div
        style={{
          transition: "none",
        }}
      >
        {children}
      </div>
      {!sidebarOpen && !sidebarDocked && (
        <SidebarToggle type="open" onClick={() => setSidebarOpen(true)} />
      )}
    </ReactSidebar>
  );
};

export default App;
