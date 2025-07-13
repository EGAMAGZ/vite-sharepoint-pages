import {type Plugin } from "vite";
import path from "node:path";
export default function htmlToAspx(): Plugin {
  return {
    name: "vite-plugin-html-aspx",
    apply: "build",
    enforce: "post",
    generateBundle: (_, bundle) => {
      const updates: Record<string, typeof bundle[string]> = {};
      for (const [fileName, asset] of Object.entries(bundle)) {
        if (!fileName.endsWith(".html") || asset.type !== "asset") continue;
        const baseName = path.basename(fileName, ".html");
        const newFileName = `${baseName}.aspx`;

        updates[newFileName] = {
          ...asset,
          fileName: newFileName,
        };

        delete bundle[fileName];
      }
      Object.entries(updates).forEach(([newName, updatedAsset], _) => {
        bundle[newName] = updatedAsset;
      });
    },
  };
}
