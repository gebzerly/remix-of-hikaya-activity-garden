// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// Never set ssr.external or resolve.external: the Worker has no runtime module resolution, so
// the build fails. Never add compression (compressPublicAssets, vite-plugin-compression):
// hosting already compresses at the edge.
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      strategies: "generateSW",
      filename: "sw.js",
      registerType: "autoUpdate",
      injectRegister: null,
      devOptions: { enabled: false },
      includeAssets: ["favicon.png", "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png"],
      manifest: false,
      workbox: {
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/~oauth(?:\/|$)/],
        globPatterns: ["**/*.{html,js,css,svg,png,ico,woff2,mp3,webmanifest}"],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) => request.mode === "navigate" && url.origin === self.location.origin,
            handler: "NetworkFirst",
            options: { cacheName: "page-navigation", networkTimeoutSeconds: 3 },
          },
          {
            urlPattern: ({ request, url }) => request.destination.match(/^(script|style|image|font)$/) !== null && url.origin === self.location.origin && /-[a-zA-Z0-9_-]{8,}\./.test(url.pathname),
            handler: "CacheFirst",
            options: { cacheName: "hashed-app-assets", expiration: { maxEntries: 80, maxAgeSeconds: 31536000 } },
          },
        ],
      },
    }),
  ],
  vite: {
    base: process.env["VITE_BASE_PATH"] ?? "/",
  },
  tanstackStart: {
    pages: [{ path: "/" }],
    prerender: { enabled: true, autoStaticPathsDiscovery: false },
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
