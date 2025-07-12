import { type Plugin } from "vite";
import path from "node:path";
export default function htmlToAspx(): Plugin {
  return {
    name: "vite-plugin-html-aspx",
    apply: "build",
    enforce: "post",
    generateBundle: (_a, bundle) => {
	    console.dir(bundle);
    },
  };
}
