// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.

// dotenv doit être chargé ICI (config Vite, exécuté uniquement par le process Node de build/dev)
// et nulle part dans src/** : un `import "dotenv/config"` dans un fichier atteignable par le
// bundle client embarque le parseur CLI de dotenv dans le navigateur, qui plante immédiatement
// (`args.reduce is not a function`, args étant undefined hors Node) — c'est ce qui bloquait
// silencieusement tout le rendu client (qualification, dossiers, etc.).
import "dotenv/config";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
