import React from "react";
import ReactDOM from "react-dom/client";
import App from "../views/PopupView.tsx";
import "../styles/index.css";

ReactDOM.createRoot(document.getElementById("app")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
