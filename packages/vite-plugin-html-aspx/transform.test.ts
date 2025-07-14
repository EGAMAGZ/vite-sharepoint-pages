import { describe, expect, it } from "vitest";
import { transformHtmlToAspx } from "./transform.ts";

describe("transformHtmlToAspx", () => {
  it("transforms valid HTML correctly", () => {
    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <link rel="stylesheet" href="style.css" />
        </head>
        <body>
          <h1>Hello</h1>
        </body>
      </html>
    `;

    const result = transformHtmlToAspx(html, "test.html");
    expect(result.success).toBe(true);
    expect(result.output).toContain(
      '<asp:Content ContentPlaceHolderId="PlaceHolderMain"',
    );
  });

  it("returns errors for invalid HTML", () => {
    const result = transformHtmlToAspx(
      "<html><head></head></html>",
      "bad.html",
    );
    expect(result.success).toBe(false);
    expect(result.errors).toContain("[bad.html] Missing <body>");
  });
});
