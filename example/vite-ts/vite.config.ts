import { defineConfig } from "vite";
import { htmlToAspx } from "@egamagz/vite-plugin-html-aspx";
import { readdirSync } from "node:fs";
import { join } from "node:path";

function getHtmlFiles() {
  const pagesDir = "pages";
  const files = readdirSync(pagesDir);
  const htmlFiles = files.filter((file) => file.endsWith(".html"));
  return htmlFiles.reduce((acc, file) => {
    const name = file.replace(".html", "");
    acc[name] = join(pagesDir, file);
    return acc;
  }, {} as Record<string, string>);
}
export default defineConfig({
  build: {
    rollupOptions: {
      input: getHtmlFiles(),
    },
  },

  plugins: [
    htmlToAspx(),
  ],
});
