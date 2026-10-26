import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "lenis/dist/lenis.css";
import { App } from "./App";
import { LangueProvider } from "./i18n";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LangueProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LangueProvider>
  </StrictMode>,
);
