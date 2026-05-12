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

describe("S4: Popup UI", () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement("div");
  });

  it("renders a checked checkbox when getGlobalEnabled returns true", async () => {
    const deps = makeDefaultDeps({ getGlobalEnabled: async () => true });
    await initPopup(root, deps);
    const toggle = root.querySelector<HTMLInputElement>("#globalToggle");
    expect(toggle?.checked).toBe(true);
  });

  it("renders an unchecked checkbox when getGlobalEnabled returns false", async () => {
    const deps = makeDefaultDeps({ getGlobalEnabled: async () => false });
    await initPopup(root, deps);
    const toggle = root.querySelector<HTMLInputElement>("#globalToggle");
    expect(toggle?.checked).toBe(false);
  });

  it("clicking the toggle calls setGlobalEnabled with the new value", async () => {
    const setGlobalEnabled = vi.fn().mockResolvedValue(undefined);
    const deps = makeDefaultDeps({
      getGlobalEnabled: async () => false,
      setGlobalEnabled,
    });
    await initPopup(root, deps);
    const toggle = root.querySelector<HTMLInputElement>("#globalToggle")!;
    toggle.checked = true;
    toggle.dispatchEvent(new Event("change"));
    await new Promise((r) => setTimeout(r, 0));
    expect(setGlobalEnabled).toHaveBeenCalledWith(true);
  });

  it("after toggle click the status text updates to reflect new state", async () => {
    const setGlobalEnabled = vi.fn().mockResolvedValue(undefined);
    const deps = makeDefaultDeps({
      getGlobalEnabled: async () => false,
      setGlobalEnabled,
    });
    await initPopup(root, deps);
    expect(root.querySelector(".status")?.textContent).toContain("Inactive");

    const toggle = root.querySelector<HTMLInputElement>("#globalToggle")!;
    toggle.checked = true;
    toggle.dispatchEvent(new Event("change"));
    await new Promise((r) => setTimeout(r, 0));

    expect(root.querySelector(".status")?.textContent).toContain("Active");
  });
});
