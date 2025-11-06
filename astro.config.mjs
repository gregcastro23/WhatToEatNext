import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";
import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  // Specify the source directory for Astro
  srcDir: "./src/astro",
  // Specify where to put the built files
  outDir: "./dist/astro",
  // Use static output for now to simplify setup
  output: "static",
  // Add base path for Astro
  base: "/astro",
  integrations: [
    react(), // Enable React components
  ],
  // Use Node adapter for local development
  // We'll comment out the adapter for now to simplify debugging
  // adapter: process.env.VERCEL ? vercel() : node({
  //   mode: 'standalone',
  // }),
});
