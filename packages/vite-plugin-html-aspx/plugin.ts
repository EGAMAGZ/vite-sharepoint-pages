import type { Plugin } from "vite";
import path from "node:path";
import { toPascalCase } from "@std/text";
import { transformHtmlToAspx } from "./transform.ts";

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

      for (const [fileName, asset] of Object.entries(bundle)) {
        const isHtmlAsset = fileName.endsWith(".html") &&
          asset.type === "asset";
        if (!isHtmlAsset) continue;

        const html = typeof asset.source === "string"
          ? asset.source
          : asset.source.toString();

        const result = transformHtmlToAspx(html, fileName);

        if (!result.success) {
          console.warn(
            `⚠️ Issues in ${fileName}:\n  - ${result.errors.join("\n  - ")}`,
          );
          continue; // skip this file if invalid
        }

        const baseName = path.basename(fileName, ".html");
        const transformedName = config.fileNameTransform?.(baseName) ??
          toPascalCase(baseName);
        const newFileName = `${transformedName}.aspx`;

        renamedAssets[newFileName] = {
          ...asset,
          fileName: newFileName,
          source: result.output as string,
        };

        delete bundle[fileName];
      }

      for (const [newFileName, updatedAsset] of Object.entries(renamedAssets)) {
        bundle[newFileName] = updatedAsset;
      }
    },
  };
}
