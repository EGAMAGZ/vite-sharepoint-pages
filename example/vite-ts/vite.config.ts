import { defineConfig } from "vite";
import { htmlToAspx } from "@egamagz/vite-sharepoint-pages";
import { join, resolve } from "node:path";
import { readdirSync } from "node:fs";

// Function to get all HTML files from pages directory
function getHtmlEntries() {
  const pagesDir = "pages";
  const entries: Record<string, string> = {};

  try {
    const files = readdirSync(pagesDir);
    const htmlFiles = files.filter((file) => file.endsWith(".html"));

    htmlFiles.forEach((file) => {
      const name = file.replace(".html", "");
      entries[name] = resolve(join(pagesDir, file));
    });
  } catch (error) {
    console.warn("Pages directory not found, using default entry");
  }

  return entries;
}

export default defineConfig({
  plugins: [
    htmlToAspx(),
  ],
  build: {
    rollupOptions: {
      input: getHtmlEntries(),
    },
  },
});
