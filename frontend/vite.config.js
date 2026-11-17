import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // load .env sesuai mode (development/production)
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    build: {
      outDir: "../public_html", // folder hasil build
      emptyOutDir: true,
      target: "es2020",
      cssCodeSplit: true,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 650,
      rollupOptions: {
        output: {
          // Pisahkan vendor besar agar caching browser lebih efektif
          // (vendor jarang berubah -> tetap valid walau app di-redeploy).
          manualChunks(id) {
            if (!id.includes("node_modules")) return;
            if (id.includes("sweetalert2")) return "vendor-sweetalert";
            if (id.includes("framer-motion")) return "vendor-motion";
            if (id.includes("bootstrap")) return "vendor-bootstrap";
            if (id.includes("@popperjs")) return "vendor-popper";
            if (id.includes("react-router")) return "vendor-router";
            if (id.includes("react-redux") || id.includes("@reduxjs") || id.includes("redux")) return "vendor-redux";
            if (id.includes("axios")) return "vendor-axios";
            return "vendor";
          },
        },
      },
    },
    define: {
      DELCOM_BASEURL: JSON.stringify(env.VITE_DELCOM_BASEURL || ""),
    },
  };
});