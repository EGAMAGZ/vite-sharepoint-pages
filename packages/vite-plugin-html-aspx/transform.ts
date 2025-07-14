import { type HTMLElement, parse } from "node-html-parser";
import { generateAspxTemplate } from "./template.ts";

export interface AspxTransformResult {
  success: boolean;
  errors: string[];
  output?: string;
}

function rewriteAnchorLinks(
  bodyEl: HTMLElement,
  fileNameTransform: (fileName: string) => string = (name) => name
): void {
  const anchors = bodyEl.querySelectorAll("a[href]");
  anchors.forEach((a) => {
    const href = a.getAttribute("href");
    if (!href) return;

    try {
      const url = new URL(href, "http://dummy-base"); // handle relative URLs safely
      if (url.pathname.endsWith(".html")) {
        const baseName = url.pathname.slice(1, -5); // remove leading slash and .html
        const transformed = fileNameTransform(baseName);
        url.pathname = `/${transformed}.aspx`;
        a.setAttribute("href", url.pathname + url.search + url.hash);
      }
    } catch {
      // Skip malformed or non-URL hrefs (like "mailto:")
    }
  });
}

export function transformHtmlToAspx(
  html: string,
  fileName: string,
  fileNameTransform?: (fileName: string) => string
): AspxTransformResult {
  const errors: string[] = [];
  const root = parse(html);

  const head = root.querySelector("head");
  const body = root.querySelector("body");

  if (!head) errors.push(`[${fileName}] Missing <head>`);
  if (!body) errors.push(`[${fileName}] Missing <body>`);

  const metaTags =
    head?.querySelectorAll("meta")?.map((el) => el.toString()).join("\n") ?? "";
  const linkTags =
    head?.querySelectorAll("link")?.map((el) => el.toString()).join("\n") ?? "";

  if (!metaTags && !linkTags) {
    errors.push(`[${fileName}] No <meta> or <link> tags found in <head>`);
  }

  if (body) {
    rewriteAnchorLinks(body, fileNameTransform);
  }

  const bodyContent = body?.innerHTML ?? "";
  if (!bodyContent.trim()) {
    errors.push(`[${fileName}] <body> is empty`);
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const output = generateAspxTemplate({ metaTags, linkTags, bodyContent });
  return { success: true, errors: [], output };
}
