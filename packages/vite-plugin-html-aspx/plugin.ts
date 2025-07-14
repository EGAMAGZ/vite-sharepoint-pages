import type { Plugin } from "vite";
import path from "node:path";
import { toPascalCase } from "@std/text";

export interface HtmlToAspXConfiguration {
  fileNameTransform?: (fileName: string) => string;
}

export function htmlToAspx(config: HtmlToAspXConfiguration = {}): Plugin {
  return {
    name: "vite-plugin-html-aspx",
    apply: "build",
    enforce: "post",

    generateBundle(_, bundle) {
      const renamedAssets: Record<string, typeof bundle[string]> = {};

      for (const [fileName, htmlAsset] of Object.entries(bundle)) {
        const isHtmlAsset = fileName.endsWith(".html") && htmlAsset.type === "asset";
        if (!isHtmlAsset) continue;

        const baseName = path.basename(fileName, ".html");
        const transformedName = config.fileNameTransform?.(baseName) ?? toPascalCase(baseName);
        const newFileName = `${transformedName}.aspx`;

        renamedAssets[newFileName] = {
          ...htmlAsset,
          fileName: newFileName,
        };

        delete bundle[fileName];
      }

      for (const [newFileName, updatedAsset] of Object.entries(renamedAssets)) {
        bundle[newFileName] = updatedAsset;
      }
    },
  };
}
