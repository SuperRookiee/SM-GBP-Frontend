import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react";
import path from "path"
import { defineConfig, mergeConfig } from "vite";
import svgr from "vite-plugin-svgr"
import { defineConfig as defineTestConfig } from "vitest/config";

// https://vite.dev/config/
const viteConfig = defineConfig({
    plugins: [react(), tailwindcss(), svgr()],
    envPrefix: ["VITE_", "MIRACLE_"],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
})

const vitestConfig = defineTestConfig({
    test: {
        include: ["src/tests/**/*.{test,spec}.{ts,tsx}"],
        exclude: ["src/tests/data/**"],
        environment: "jsdom",
        setupFiles: "./src/tests/setup.ts",
    },
});

export default mergeConfig(viteConfig, vitestConfig);