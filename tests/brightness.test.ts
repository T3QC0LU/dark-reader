import { describe, it, expect, beforeEach, vi } from "vitest";
import { initPopup } from "../src/popup/index";
import type { PopupDeps } from "../src/popup/index";

const makeDefaultDeps = (overrides: Partial<PopupDeps> = {}): PopupDeps => ({
  getGlobalEnabled: async () => true,
  setGlobalEnabled: vi.fn().mockResolvedValue(undefined),
  queryActiveTab: async () => ({ url: "https://example.com" }),
  getConfig: async () => ({ enabled: true, brightness: 100, whitelist: false }),
  setConfig: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe("S6: Brightness Control", () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement("div");
  });

  it("popup renders slider with current brightness value from config", async () => {
    const deps = makeDefaultDeps({
      getConfig: async () => ({ enabled: true, brightness: 85, whitelist: false }),
    });
    await initPopup(root, deps);
    const slider = root.querySelector<HTMLInputElement>("#brightness");
    expect(slider?.value).toBe("85");
  });

  it("moving slider calls setConfig with updated brightness", async () => {
    const setConfig = vi.fn().mockResolvedValue(undefined);
    const deps = makeDefaultDeps({ setConfig });
    await initPopup(root, deps);
    const slider = root.querySelector<HTMLInputElement>("#brightness")!;
    slider.value = "90";
    slider.dispatchEvent(new Event("input"));
    await new Promise((r) => setTimeout(r, 0));
    expect(setConfig).toHaveBeenCalledWith(
      "https://example.com",
      expect.objectContaining({ brightness: 90 })
    );
  });

  it("remap([], 80) generates CSS with text rgb(179, 179, 179)", async () => {
    const { remap } = await import("../src/modules/ColorMapper");
    const css = remap([], 80);
    expect(css).toContain("rgb(179, 179, 179)");
  });

  it("remap([], 100) generates CSS with text rgb(224, 224, 224)", async () => {
    const { remap } = await import("../src/modules/ColorMapper");
    const css = remap([], 100);
    expect(css).toContain("rgb(224, 224, 224)");
  });
});
