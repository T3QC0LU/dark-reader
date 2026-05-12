import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
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

describe("S5: Per-Site Whitelist", () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement("div");
    document.head.innerHTML = "";
  });

  afterEach(() => {
    document.querySelector("style[data-dark-reader]")?.remove();
  });

  it("renders 'Add to whitelist' button when whitelist is false", async () => {
    const deps = makeDefaultDeps({
      getConfig: async () => ({ enabled: true, brightness: 100, whitelist: false }),
    });
    await initPopup(root, deps);
    expect(root.querySelector("#whitelistBtn")?.textContent).toContain(
      "Add to whitelist"
    );
  });

  it("renders 'Remove from whitelist' button when whitelist is true", async () => {
    const deps = makeDefaultDeps({
      getConfig: async () => ({ enabled: true, brightness: 100, whitelist: true }),
    });
    await initPopup(root, deps);
    expect(root.querySelector("#whitelistBtn")?.textContent).toContain(
      "Remove from whitelist"
    );
  });

  it("clicking whitelist button calls setConfig with correct whitelist value", async () => {
    const setConfig = vi.fn().mockResolvedValue(undefined);
    const deps = makeDefaultDeps({
      getConfig: async () => ({ enabled: true, brightness: 100, whitelist: false }),
      setConfig,
    });
    await initPopup(root, deps);
    (root.querySelector("#whitelistBtn") as HTMLButtonElement).click();
    await new Promise((r) => setTimeout(r, 0));
    expect(setConfig).toHaveBeenCalledWith(
      "https://example.com",
      expect.objectContaining({ whitelist: true })
    );
  });

  it("run() returns early (no style tag) when siteConfig.whitelist is true", async () => {
    vi.resetModules();
    vi.doMock("../src/modules/SiteConfigStore", () => ({
      getGlobalEnabled: vi.fn().mockResolvedValue(true),
      getConfig: vi
        .fn()
        .mockResolvedValue({ enabled: true, brightness: 100, whitelist: true }),
      setConfig: vi.fn(),
      setGlobalEnabled: vi.fn(),
    }));
    vi.doMock("../src/modules/DOMObserver", () => ({
      observe: vi.fn().mockReturnValue(() => {}),
    }));
    const { run } = await import("../src/content/index");
    await run();
    expect(document.querySelector("style[data-dark-reader]")).toBeNull();
  });

  it("run() returns early when getGlobalEnabled returns false", async () => {
    vi.resetModules();
    vi.doMock("../src/modules/SiteConfigStore", () => ({
      getGlobalEnabled: vi.fn().mockResolvedValue(false),
      getConfig: vi
        .fn()
        .mockResolvedValue({ enabled: true, brightness: 100, whitelist: false }),
      setConfig: vi.fn(),
      setGlobalEnabled: vi.fn(),
    }));
    vi.doMock("../src/modules/DOMObserver", () => ({
      observe: vi.fn().mockReturnValue(() => {}),
    }));
    const { run } = await import("../src/content/index");
    await run();
    expect(document.querySelector("style[data-dark-reader]")).toBeNull();
  });
});
