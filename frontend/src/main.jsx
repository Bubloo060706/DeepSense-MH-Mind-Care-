import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Global styles
const style = document.createElement("style");
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --color-bg:        #0f1117;
    --color-surface:   #1a1d27;
    --color-border:    #2a2d3e;
    --color-primary:   #6c63ff;
    --color-success:   #22c55e;
    --color-warning:   #f59e0b;
    --color-danger:    #ef4444;
    --color-text:      #e2e8f0;
    --color-muted:     #94a3b8;
    --radius:          10px;
    --shadow:          0 4px 24px rgba(0,0,0,0.35);
  }

  body {
    font-family: 'Inter', 'Segoe UI', sans-serif;
    background: var(--color-bg);
    color: var(--color-text);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  a { color: var(--color-primary); text-decoration: none; }
  a:hover { text-decoration: underline; }

  button {
    cursor: pointer;
    border: none;
    font-family: inherit;
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--color-bg); }
  ::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);