import React    from "react";
import ReactDOM from "react-dom/client";
import App      from "./App";

// Global reset
const globalStyles = `
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
                 Roboto, Oxygen, Ubuntu, sans-serif;
    background-color: #f7fafc;
    color: #2d3748;
    -webkit-font-smoothing: antialiased;
  }

  button {
    font-family: inherit;
  }

  input {
    font-family: inherit;
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
  }
`;

const styleTag = document.createElement("style");
styleTag.innerHTML = globalStyles;
document.head.appendChild(styleTag);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);