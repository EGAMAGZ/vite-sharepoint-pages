import { defineConfig } from "vite";
import { htmlToAspx } from "@egamagz/vite-plugin-html-aspx";

export default defineConfig({
  plugins: [
    htmlToAspx(),
  ],
});
