/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serwuje projekt pod ścieżką /<nazwa-repo>/, a nie w korzeniu
  // domeny — bez tego wszystkie odwołania do plików w dist/ byłyby na 404.
  // Zmienna zamiast wpisanej na sztywno ścieżki, żeby ten sam build działał
  // też w korzeniu (Vercel, Netlify, podgląd lokalny), gdzie base to "/".
  base: process.env.VITE_BASE ?? "/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
  },
});
