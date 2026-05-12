import { describe, it, expect } from "vitest";

describe("S1: Extension Scaffold", () => {
  it("content script run() can be called without throwing", async () => {
    const { run } = await import("../src/content/index");
    expect(() => run()).not.toThrow();
  });

  it("service worker init() can be called without throwing", async () => {
    const { init } = await import("../src/background/index");
    expect(() => init()).not.toThrow();
  });

  it("SiteConfigStore exports getConfig, setConfig, getGlobalEnabled, setGlobalEnabled", async () => {
    const store = await import("../src/modules/SiteConfigStore");
    expect(typeof store.getConfig).toBe("function");
    expect(typeof store.setConfig).toBe("function");
    expect(typeof store.getGlobalEnabled).toBe("function");
    expect(typeof store.setGlobalEnabled).toBe("function");
  });

  it("SiteConfigStore getConfig returns default config for unknown origin", async () => {
    const { getConfig, DEFAULT_CONFIG } = await import("../src/modules/SiteConfigStore");
    const config = await getConfig("https://unknown.example.com");
    expect(config).toMatchObject(DEFAULT_CONFIG);
  });

  it("all core modules export their public interfaces", async () => {
    const { analyze } = await import("../src/modules/ColorAnalyzer");
    const { remap } = await import("../src/modules/ColorMapper");
    const { inject, eject } = await import("../src/modules/CSSInjector");
    const { observe } = await import("../src/modules/DOMObserver");
    expect(typeof analyze).toBe("function");
    expect(typeof remap).toBe("function");
    expect(typeof inject).toBe("function");
    expect(typeof eject).toBe("function");
    expect(typeof observe).toBe("function");
  });
});
