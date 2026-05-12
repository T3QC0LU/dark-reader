import { describe, it, expect, beforeEach } from "vitest";
import {
  getConfig,
  setConfig,
  getGlobalEnabled,
  setGlobalEnabled,
  DEFAULT_CONFIG,
  _injectStorageBackend,
} from "../src/modules/SiteConfigStore";

const mockBackend = () => {
  const store = new Map<string, unknown>();
  return {
    get: async (keys: string[]) =>
      Object.fromEntries(
        keys.map((k) => [k, store.get(k)]).filter(([, v]) => v !== undefined)
      ),
    set: async (items: Record<string, unknown>) => {
      Object.entries(items).forEach(([k, v]) => store.set(k, v));
    },
  };
};

beforeEach(() => {
  _injectStorageBackend(mockBackend());
});

describe("S3: SiteConfigStore", () => {
  it("getConfig returns DEFAULT_CONFIG when nothing is stored", async () => {
    const config = await getConfig("https://example.com");
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it("setConfig then getConfig returns updated brightness", async () => {
    await setConfig("https://example.com", { brightness: 80 });
    const config = await getConfig("https://example.com");
    expect(config.brightness).toBe(80);
  });

  it("getGlobalEnabled returns true by default", async () => {
    expect(await getGlobalEnabled()).toBe(true);
  });

  it("setGlobalEnabled(false) then getGlobalEnabled returns false", async () => {
    await setGlobalEnabled(false);
    expect(await getGlobalEnabled()).toBe(false);
  });

  it("setConfig partial update doesn't overwrite other fields", async () => {
    await setConfig("https://example.com", { brightness: 90 });
    await setConfig("https://example.com", { whitelist: true });
    const config = await getConfig("https://example.com");
    expect(config.brightness).toBe(90);
    expect(config.whitelist).toBe(true);
    expect(config.enabled).toBe(DEFAULT_CONFIG.enabled);
  });
});
