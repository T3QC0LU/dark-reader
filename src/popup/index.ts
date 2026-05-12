import { initPopup } from "./popup-logic";
import { getGlobalEnabled, setGlobalEnabled, getConfig, setConfig } from "../modules/SiteConfigStore";

initPopup(document.getElementById("root") as HTMLElement, {
  getGlobalEnabled,
  setGlobalEnabled,
  queryActiveTab: () =>
    new Promise((resolve) =>
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => resolve(tab ?? {}))
    ),
  getConfig,
  setConfig,
});
