import { defineConfig } from "vite";
import { htmlToAspx } from "@egamagz/vite-sharepoint-pages";
export default defineConfig({
  plugins: [
    htmlToAspx(),
  ],
});
