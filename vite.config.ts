import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": "/src",
      "@/modules": "/src/modules",
      "@/types": "/src/types",
      "@/utils": "/src/utils",
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        // Split large third-party libraries into separate chunks to reduce
        // main vendor bundle size and improve caching.
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("firebase")) return "firebase";
            if (id.includes("chart.js")) return "chartjs";
            if (id.includes("jspdf")) return "jspdf";
            if (id.includes("html2canvas")) return "html2canvas";
            return "vendor";
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: ["jspdf", "html2canvas", "firebase", "chart.js"],
  },
});
