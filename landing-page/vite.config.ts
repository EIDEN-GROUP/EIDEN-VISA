// Landing page Eiden Visa — projet Vite autonome, séparé de l'app (TanStack Start à la racine).
// Aucun import depuis ../src : ce dossier doit pouvoir être déplacé ou déployé seul.
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Port distinct de l'app (3000) pour lancer les deux en parallèle.
  server: { port: 5180 },
  preview: { port: 5181 },
});
