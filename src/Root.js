import React from "react";
import Fullscreen from "./components/Fullscreen";
import App from "./App";

// TODO: Read view parameter and toggle between App and AppWho
// http://localhost:3000/dhis2-in-action?view=who#health

const Root = () => {
  return (
    <Fullscreen>
      <App />
    </Fullscreen>
  );
};

export default Root;
