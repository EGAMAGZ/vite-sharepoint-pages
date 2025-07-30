import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { transformHtmlToAspx } from "./transform.ts";

describe("transformHtmlToAspx", () => {
  it("transforms valid HTML with head, body, link, script, and anchor tags", () => {
    const html = `
      <html>
        <head>
          <link rel=\"stylesheet\" href=\"/styles/main.css\">
          <script src=\"/scripts/app.js\"></script>
        </head>
        <body>
          <a href=\"/about.html\">About</a>
          <div>Hello World</div>
        </body>
      </html>
    `;
    const result = transformHtmlToAspx(html, "index.html");
    expect(result.success).toBe(true);
    expect(result.output).toContain("main.css");
    expect(result.output).toContain("app.js");
    expect(result.output).toContain("About</a>");
    expect(result.output).toContain("Hello World");
    expect(result.output).toContain(".aspx");
  });

  it("returns error if <head> is missing", () => {
    const html = `<html><body>Content</body></html>`;
    const result = transformHtmlToAspx(html, "nohead.html");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.includes("Missing <head>"))).toBe(
        true,
      );
    }
  });

  it("returns error if <body> is missing", () => {
    const html = `<html><head></head></html>`;
    const result = transformHtmlToAspx(html, "nobody.html");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.includes("Missing <body>"))).toBe(
        true,
      );
    }
  });

  it("returns error if <body> is empty", () => {
    const html = `<html><head></head><body>   </body></html>`;
    const result = transformHtmlToAspx(html, "emptybody.html");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.includes("<body> is empty"))).toBe(
        true,
      );
    }
  });

  it("rewrites anchor hrefs ending with .html to .aspx", () => {
    const html = `
      <html>
        <head><link rel=\"stylesheet\" href=\"/x.css\"></head>
        <body>
          <a href=\"/foo/bar.html\">Bar</a>
          <a href=\"/baz.html?x=1#y\">Baz</a>
        </body>
      </html>
    `;
    const result = transformHtmlToAspx(html, "anchors.html");
    expect(result.success).toBe(true);
    expect(result.output).toContain("foo/bar.aspx");
    expect(result.output).toContain("baz.aspx?x=1#y");
  });

  it("applies fileNameTransform to anchor hrefs", () => {
    const html = `
      <html>
        <head><link rel=\"stylesheet\" href=\"/x.css\"></head>
        <body>
          <a href=\"/test.html\">Test</a>
        </body>
      </html>
    `;
    const result = transformHtmlToAspx(
      html,
      "fileNameTransform.html",
      (name) => name.toUpperCase(),
    );
    expect(result.success).toBe(true);
    expect(result.output).toContain("TEST.aspx");
  });

  it("returns error if no <link> tags in <head>", () => {
    const html = `<html><head></head><body>Content</body></html>`;
    const result = transformHtmlToAspx(html, "nolink.html");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.includes("No <link> tags found")))
        .toBe(true);
    }
  });
});
