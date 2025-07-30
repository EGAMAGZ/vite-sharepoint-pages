import { type HTMLElement, parse } from "node-html-parser";
import { generateAspxTemplate } from "./template.ts";

type AspxTransformSuccess = {
  success: true;
  errors?: never;
  output: string;
};

type AspxTransformError = {
  success: false;
  errors: string[];
  output?: never;
};

export type AspxTransformResult = AspxTransformSuccess | AspxTransformError;

function rewriteAnchorLinks(
  bodyEl: HTMLElement,
  fileNameTransform: (fileName: string) => string = (name) => name,
): void {
  const anchors = bodyEl.querySelectorAll("a[href]");
  anchors.forEach((a) => {
    const href = a.getAttribute("href");
    if (!href) return;

    try {
      const url = new URL(href, "http://dummy-base");
      if (url.pathname.endsWith(".html")) {
        const parts = url.pathname.slice(1).split("/");
        const fileName = parts.pop()!;
        const baseName = fileName.slice(0, -5);
        const transformedFile = fileNameTransform(baseName) + ".aspx";
        parts.push(transformedFile);

        const finalHref = parts.join("/") + url.search + url.hash;
        a.setAttribute("href", finalHref);
      }
    } catch {
      // Skip invalid hrefs (mailto:, tel:, etc.)
    }
  });
}

export function transformHtmlToAspx(
  html: string,
  fileName: string,
  fileNameTransform?: (fileName: string) => string,
): AspxTransformResult {
  const errors: string[] = [];
  const root = parse(html);

  const head = root.querySelector("head");
  const body = root.querySelector("body");

  if (!head) errors.push(`[${fileName}] Missing <head>`);
  if (!body) errors.push(`[${fileName}] Missing <body>`);

  const linkTags =
    head?.querySelectorAll("link")?.map((el) =>
      el.toString().replace(
        /href\s*=\s*["']([^"']+)["']/gi,
        (_match, url) => {
          // Remove only the first slash if it exists
          const newUrl = url.replace(/^\/+/, "");
          return `href="${newUrl}"`;
        },
      )
    ).join("\n") ?? "";

  const scriptTags =
    head?.querySelectorAll("script")?.map((el) =>
      el.toString().replace(
        /src\s*=\s*["']([^"']+)["']/gi,
        (_match, url) => {
          // Remove only the first slash if it exists
          const newUrl = url.replace(/^\/+/, "");
          return `src="${newUrl}"`;
        },
      )
    ).join("\n") ?? "";

  if (!linkTags) {
    errors.push(`[${fileName}] No <link> tags found in <head>`);
  }

  if (body) {
    rewriteAnchorLinks(body, fileNameTransform);
  }

  const stylesContent =
    head?.querySelectorAll("style")?.map((el) => el.innerHTML)?.join("\n") ||
    null;

  const bodyContent = body?.innerHTML ?? "";
  if (!bodyContent.trim()) {
    errors.push(`[${fileName}] <body> is empty`);
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const output = generateAspxTemplate({
    scriptTags,
    linkTags,
    bodyContent,
    stylesContent,
  });
  return { success: true, output };
}
