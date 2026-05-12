import { describe, it, expect } from "vitest";

describe("S2b: Image & Video Protection", () => {
  it("remap([]) output contains a rule that targets img and resets background", async () => {
    const { remap } = await import("../src/modules/ColorMapper");
    const css = remap([]);
    expect(css).toContain("img");
    expect(css).toContain("background-color: initial");
  });

  it("remap([]) output contains a rule that targets video", async () => {
    const { remap } = await import("../src/modules/ColorMapper");
    const css = remap([]);
    expect(css).toContain("video");
  });

  it("media exclusion rule appears after the universal rule", async () => {
    const { remap } = await import("../src/modules/ColorMapper");
    const css = remap([]);
    const universalRuleEnd = css.indexOf("}");
    const mediaRule = css.indexOf("img, video");
    expect(mediaRule).toBeGreaterThan(universalRuleEnd);
  });
});
