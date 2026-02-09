import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react";
import path from "path"
import { defineConfig, mergeConfig } from "vite";
import svgr from "vite-plugin-svgr"
import { defineConfig as defineTestConfig } from "vitest/config";

// https://vite.dev/config/
const viteConfig = defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

const vitestConfig = defineTestConfig({
  test: {
    include: ["src/test/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["src/test/data/**"],
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});

export default mergeConfig(viteConfig, vitestConfig);