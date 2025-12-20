// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

const base = "/skytrain-rolling-stock/"; // ← בדיוק שם הריפו

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      // devOptions: { enabled: true, type: "module" }, // (רק אם רוצים התקנה גם ב-dev)
      includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "SkyTrain Rolling Stock Dashboard",
        short_name: "SkyTrain Fleet",
        description: "דשבורד אינטראקטיבי לצי הקרונות של SkyTrain",
        start_url: base,
        scope: base,
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0ea5e9",
        icons: [
          { src: "icons/pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/pwa-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,webp,woff2}"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.endsWith("rolling_stock.json"),
            handler: "StaleWhileRevalidate",
            options: { cacheName: "rolling-stock-json" }
          },
          {
            urlPattern: ({ url }) => url.origin.includes("wikimedia.org"),
            handler: "StaleWhileRevalidate",
            options: { cacheName: "images-cdn" }
          }
        ]
      }
    })
  ]
});
