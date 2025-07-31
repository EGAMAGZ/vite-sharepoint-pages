import type { Plugin } from "vite";
import path from "node:path";
import { toPascalCase } from "@std/text";
import { transformHtmlToAspx } from "./transform.ts";

// Define our own types for the bundle assets
interface BundleAsset {
  type: string;
  source: string | any;
  fileName?: string;
}

export interface HtmlToAspXConfiguration {
  fileNameTransform?: (fileName: string) => string;
}

export function htmlToAspx(config: HtmlToAspXConfiguration = {}): Plugin {
  return {
    name: "vite-plugin-html-aspx",
    apply: "build",
    enforce: "post",

    generateBundle(_: unknown, bundle: Record<string, any>) {
      const renamedAssets: Record<string, BundleAsset> = {};

      for (const [fileName, asset] of Object.entries(bundle)) {
        const typedAsset = asset as BundleAsset;
        const isHtmlAsset = fileName.endsWith(".html") &&
          typedAsset.type === "asset";
        if (!isHtmlAsset) continue;

        const html = typeof typedAsset.source === "string"
          ? typedAsset.source
          : typedAsset.source.toString();

        const baseName = path.basename(fileName, ".html");
        const fileNameTransform = config.fileNameTransform ?? toPascalCase;
        const result = transformHtmlToAspx(html, fileName, fileNameTransform);

        if (!result.success) {
          console.warn(
            `⚠️ Issues in ${fileName}:\n  - ${result.errors.join("\n  - ")}`,
          );
          continue;
        }

        const transformedName = config.fileNameTransform?.(baseName) ??
          toPascalCase(baseName);
        const newFileName = `${transformedName}.aspx`;

        renamedAssets[newFileName] = {
          ...typedAsset,
          fileName: newFileName,
          source: result.output,
        };

        delete bundle[fileName];
      }

      for (const [newFileName, updatedAsset] of Object.entries(renamedAssets)) {
        bundle[newFileName] = updatedAsset;
      }
    },
  };
}
