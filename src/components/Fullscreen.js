import React, { useState } from "react";
import ReactFullscreen from "react-full-screen";
import "./Fullscreen.css";

const Fullscreen = ({ children }) => {
  const [isFullscreen, setFullscreen] = useState(false);

  return (
    <ReactFullscreen enabled={isFullscreen} onChange={setFullscreen}>
      {children}
      <div
        className={`Fullscreen Fullscreen-${isFullscreen ? "en" : "dis"}abled`}
        onClick={() => setFullscreen(!isFullscreen)}
      />
    </ReactFullscreen>
  );
};

export default Fullscreen;
