export interface SiteConfig { enabled: boolean; brightness: number; whitelist: boolean; }
export const DEFAULT_CONFIG: SiteConfig = { enabled: true, brightness: 100, whitelist: false };
export async function getConfig(_origin: string): Promise<SiteConfig> { return { ...DEFAULT_CONFIG }; }
export async function setConfig(_origin: string, _patch: Partial<SiteConfig>): Promise<void> {}
export async function getGlobalEnabled(): Promise<boolean> { return true; }
export async function setGlobalEnabled(_enabled: boolean): Promise<void> {}
