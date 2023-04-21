import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { DevtoolsProvider } from "../devtools";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <DevtoolsProvider dev={import.meta.env.DEV}>
      <App />
    </DevtoolsProvider>
  </React.StrictMode>
);
