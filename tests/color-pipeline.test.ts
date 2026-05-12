import { describe, it, expect, beforeEach, afterEach } from "vitest";

// ─── CSSInjector ───────────────────────────────────────────────────────────

describe("CSSInjector", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
  });

  it("inject() adds a <style data-dark-reader> tag to document.head", async () => {
    const { inject } = await import("../src/modules/CSSInjector");
    inject("body { background: #000; }");
    const tag = document.querySelector("style[data-dark-reader]");
    expect(tag).not.toBeNull();
  });

  it("inject() sets the provided CSS as the style tag content", async () => {
    const { inject } = await import("../src/modules/CSSInjector");
    inject("* { color: red; }");
    const tag = document.querySelector("style[data-dark-reader]");
    expect(tag?.textContent).toContain("color: red");
  });

  it("eject() removes the <style data-dark-reader> tag", async () => {
    const { inject, eject } = await import("../src/modules/CSSInjector");
    inject("body { background: #000; }");
    eject();
    const tag = document.querySelector("style[data-dark-reader]");
    expect(tag).toBeNull();
  });

  it("inject() called twice replaces the previous tag (no duplicates)", async () => {
    const { inject } = await import("../src/modules/CSSInjector");
    inject("a { color: red; }");
    inject("a { color: blue; }");
    const tags = document.querySelectorAll("style[data-dark-reader]");
    expect(tags.length).toBe(1);
    expect(tags[0].textContent).toContain("blue");
  });
});

// ─── ColorMapper (pure functions) ─────────────────────────────────────────

describe("ColorMapper", () => {
  it("remapBackground() returns #000000 for a white background", async () => {
    const { remapBackground } = await import("../src/modules/ColorMapper");
    expect(remapBackground("rgb(255, 255, 255)")).toBe("#000000");
  });

  it("remapBackground() returns #000000 for a light-grey background", async () => {
    const { remapBackground } = await import("../src/modules/ColorMapper");
    expect(remapBackground("rgb(240, 240, 240)")).toBe("#000000");
  });

  it("remapBackground() preserves transparent (no element bg set)", async () => {
    const { remapBackground } = await import("../src/modules/ColorMapper");
    expect(remapBackground("rgba(0, 0, 0, 0)")).toBe("rgba(0, 0, 0, 0)");
  });

  it("remapText() keeps white text as-is (already readable on black)", async () => {
    const { remapText } = await import("../src/modules/ColorMapper");
    expect(remapText("rgb(255, 255, 255)")).toBe("rgb(255, 255, 255)");
  });

  it("remapText() remaps black text to a high-contrast light colour", async () => {
    const { remapText, contrastRatio, luminance } = await import("../src/modules/ColorMapper");
    const result = remapText("rgb(0, 0, 0)");
    // parse result back to RGB and check contrast against #000000 bg
    const m = result.match(/\d+/g)!;
    const lText = luminance(+m[0], +m[1], +m[2]);
    expect(contrastRatio(lText, 0)).toBeGreaterThanOrEqual(4.5);
  });

  it("remapText() remaps dark-grey text to readable light colour", async () => {
    const { remapText, contrastRatio, luminance } = await import("../src/modules/ColorMapper");
    const result = remapText("rgb(51, 51, 51)");
    const m = result.match(/\d+/g)!;
    const lText = luminance(+m[0], +m[1], +m[2]);
    expect(contrastRatio(lText, 0)).toBeGreaterThanOrEqual(4.5);
  });

  it("remap() output string contains #000000 for background overrides", async () => {
    const { remap } = await import("../src/modules/ColorMapper");
    const css = remap([], 100);
    expect(css).toContain("#000000");
  });
});

// ─── ColorAnalyzer ─────────────────────────────────────────────────────────

describe("ColorAnalyzer", () => {
  it("analyze() returns an entry for an element with explicit background", async () => {
    const { analyze } = await import("../src/modules/ColorAnalyzer");
    const div = document.createElement("div");
    div.style.backgroundColor = "rgb(255, 255, 255)";
    div.style.color = "rgb(0, 0, 0)";
    document.body.appendChild(div);

    const entries = analyze(div, (el) => (el as HTMLElement).style as unknown as CSSStyleDeclaration);
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0].background).toBe("rgb(255, 255, 255)");
    document.body.removeChild(div);
  });

  it("analyze() skips elements with transparent background", async () => {
    const { analyze } = await import("../src/modules/ColorAnalyzer");
    const div = document.createElement("div");
    div.style.backgroundColor = "";
    document.body.appendChild(div);

    const entries = analyze(div, (el) => (el as HTMLElement).style as unknown as CSSStyleDeclaration);
    expect(entries.length).toBe(0);
    document.body.removeChild(div);
  });
});

// ─── Integration: full pipeline ────────────────────────────────────────────

describe("Color Pipeline integration", () => {
  afterEach(() => {
    document.querySelector("style[data-dark-reader]")?.remove();
  });

  it("analyze → remap → inject produces a style tag in the document", async () => {
    const { analyze } = await import("../src/modules/ColorAnalyzer");
    const { remap } = await import("../src/modules/ColorMapper");
    const { inject } = await import("../src/modules/CSSInjector");

    const div = document.createElement("div");
    div.style.backgroundColor = "rgb(255, 255, 255)";
    div.style.color = "rgb(0, 0, 0)";
    document.body.appendChild(div);

    const entries = analyze(div, (el) => (el as HTMLElement).style as unknown as CSSStyleDeclaration);
    const css = remap(entries, 100);
    inject(css);

    const tag = document.querySelector("style[data-dark-reader]");
    expect(tag).not.toBeNull();
    expect(tag?.textContent).toContain("#000000");
    document.body.removeChild(div);
  });
});
