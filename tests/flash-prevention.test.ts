import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("../src/modules/SiteConfigStore", () => ({
  getGlobalEnabled: vi.fn().mockResolvedValue(true),
  getConfig: vi
    .fn()
    .mockResolvedValue({ enabled: true, brightness: 100, whitelist: false }),
  setConfig: vi.fn().mockResolvedValue(undefined),
  setGlobalEnabled: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../src/modules/DOMObserver", () => ({
  observe: vi.fn().mockReturnValue(() => {}),
}));

describe("S2c: Zero White Flash", () => {
  beforeEach(() => {
    vi.resetModules();
    document.head.innerHTML = "";
  });

  afterEach(() => {
    document.querySelector("style[data-dark-reader]")?.remove();
  });

  it("after run() a style tag with #000000 is present in the document", async () => {
    const { run } = await import("../src/content/index");
    await run();
    const tag = document.querySelector("style[data-dark-reader]");
    expect(tag).not.toBeNull();
    expect(tag?.textContent).toContain("#000000");
  });

  it("calling run() twice doesn't create duplicate style tags", async () => {
    const { run } = await import("../src/content/index");
    await run();
    await run();
    const tags = document.querySelectorAll("style[data-dark-reader]");
    expect(tags.length).toBe(1);
  });
});
