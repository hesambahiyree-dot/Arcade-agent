/**
 * Optional SPA bootstrap for Electron / Capacitor static builds.
 * The Grok preview uses TanStack Start routes instead.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./i18n";
import "./styles.css";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
