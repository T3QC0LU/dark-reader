import type { SiteConfig } from "../modules/SiteConfigStore";

export interface PopupDeps {
  getGlobalEnabled: () => Promise<boolean>;
  setGlobalEnabled: (v: boolean) => Promise<void>;
  queryActiveTab: () => Promise<{ id?: number; url?: string }>;
  getConfig: (origin: string) => Promise<SiteConfig>;
  setConfig: (origin: string, patch: Partial<SiteConfig>) => Promise<void>;
}

export async function initPopup(root: HTMLElement, deps: PopupDeps): Promise<void> {
  let origin = "";
  try {
    const tab = await deps.queryActiveTab();
    origin = tab.url ? new URL(tab.url).origin : "";
  } catch {
    // queryActiveTab unavailable on restricted pages — proceed with empty origin
  }
  const [enabled, config] = await Promise.all([
    deps.getGlobalEnabled(),
    deps.getConfig(origin),
  ]);
  render(root, enabled, config, origin, deps);
}

function render(
  root: HTMLElement,
  enabled: boolean,
  config: SiteConfig,
  origin: string,
  deps: PopupDeps
): void {
  root.innerHTML = `
    <div class="popup">
      <div class="header">
        <span>Dark Reader</span>
        <label class="toggle">
          <input type="checkbox" id="globalToggle" ${enabled ? "checked" : ""} />
          <span class="slider"></span>
        </label>
      </div>
      <div class="status">${enabled ? "● Active" : "○ Inactive"}</div>
      <div class="controls">
        <label>Brightness <input type="range" id="brightness" min="80" max="100" value="${config.brightness}" /></label>
        <button id="whitelistBtn">${config.whitelist ? "Remove from whitelist" : "Add to whitelist"}</button>
      </div>
    </div>
  `;

  root.querySelector("#globalToggle")?.addEventListener("change", async (e) => {
    const v = (e.target as HTMLInputElement).checked;
    await deps.setGlobalEnabled(v);
    render(root, v, config, origin, deps);
  });

  root.querySelector("#brightness")?.addEventListener("input", async (e) => {
    const v = parseInt((e.target as HTMLInputElement).value, 10);
    await deps.setConfig(origin, { brightness: v });
  });

  root.querySelector("#whitelistBtn")?.addEventListener("click", async () => {
    const newWhitelist = !config.whitelist;
    await deps.setConfig(origin, { whitelist: newWhitelist });
    config = { ...config, whitelist: newWhitelist };
    render(root, enabled, config, origin, deps);
  });
}
