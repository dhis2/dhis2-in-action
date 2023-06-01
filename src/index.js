import React from "react";
import ReactDOM from "react-dom";
import "core-js/features/string/starts-with"; // IE 11 support
import "core-js/features/string/includes"; // IE 11 support
import "core-js/features/array/includes"; // IE 11 support
import "core-js/features/array/flat-map"; // IE 11 support
import "core-js/features/array/find"; // IE 11 support
import "core-js/features/array/find-index"; // IE 11 support
import "core-js/features/object/assign"; // IE 11 support
import "core-js/features/object/values"; // IE 11 support
import "core-js/features/promise"; // IE 11 support
import "unfetch/polyfill"; // IE 11 support
import "./index.css";
import App from "./components/App";
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
