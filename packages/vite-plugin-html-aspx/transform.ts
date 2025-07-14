import { parse } from "node-html-parser";
import { generateAspxTemplate } from "./template";

export interface AspxTransformResult {
  success: boolean;
  errors: string[];
  output?: string;
}

export function transformHtmlToAspx(
  html: string,
  fileName: string,
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
  const bodyContent = body?.innerHTML ?? "";

  if (!metaTags && !linkTags) {
    errors.push(`[${fileName}] No <meta> or <link> tags found in <head>`);
  }

  if (!bodyContent.trim()) {
    errors.push(`[${fileName}] <body> is empty`);
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const output = generateAspxTemplate({ metaTags, linkTags, bodyContent });
  return { success: true, errors: [], output };
}
