import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);

// ✅ Force Inter sur tous les éléments avec style inline
// S'exécute après le render — ne perturbe pas le contexte React
const forceFont = (el) => {
  if (el && el.style) {
    el.style.fontFamily = "'Inter', system-ui, sans-serif";
  }
  if (el && el.querySelectorAll) {
    el.querySelectorAll("*").forEach(child => {
      if (child.style) child.style.fontFamily = "'Inter', system-ui, sans-serif";
    });
  }
};

const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === 1) forceFont(node);
    });
  });
});

// Démarre l'observation une fois le DOM prêt
window.addEventListener("DOMContentLoaded", () => {
  observer.observe(document.body, { childList: true, subtree: true });
});