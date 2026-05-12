export interface SiteConfig { enabled: boolean; brightness: number; whitelist: boolean; }
export const DEFAULT_CONFIG: SiteConfig = { enabled: true, brightness: 100, whitelist: false };

type StorageBackend = {
  get(keys: string[]): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
};

let _backend: StorageBackend | null = null;

/** In-memory fallback used when chrome.storage is not available (e.g. unit tests). */
const _memStore = new Map<string, unknown>();
const _memBackend: StorageBackend = {
  get: async (keys) =>
    Object.fromEntries(
      keys.map((k) => [k, _memStore.get(k)]).filter(([, v]) => v !== undefined)
    ),
  set: async (items) => {
    Object.entries(items).forEach(([k, v]) => _memStore.set(k, v));
  },
};

export function _injectStorageBackend(b: StorageBackend): void { _backend = b; }

function getBackend(): StorageBackend {
  if (_backend) return _backend;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (globalThis as any).chrome === "undefined" || !(globalThis as any).chrome?.storage?.local) {
    return _memBackend;
  }
  return {
    get: (keys) => new Promise((resolve) => chrome.storage.local.get(keys, resolve as (items: { [key: string]: unknown }) => void)),
    set: (items) => new Promise((resolve) => chrome.storage.local.set(items, resolve)),
  };
}

export async function getConfig(origin: string): Promise<SiteConfig> {
  const key = `site:${origin}`;
  const result = await getBackend().get([key]);
  const stored = result[key] as Partial<SiteConfig> | undefined;
  return { ...DEFAULT_CONFIG, ...stored };
}

export async function setConfig(origin: string, patch: Partial<SiteConfig>): Promise<void> {
  const key = `site:${origin}`;
  const current = await getConfig(origin);
  await getBackend().set({ [key]: { ...current, ...patch } });
}

export async function getGlobalEnabled(): Promise<boolean> {
  const result = await getBackend().get(["global:enabled"]);
  if ("global:enabled" in result) return result["global:enabled"] as boolean;
  return true;
}

export async function setGlobalEnabled(enabled: boolean): Promise<void> {
  await getBackend().set({ "global:enabled": enabled });
}
