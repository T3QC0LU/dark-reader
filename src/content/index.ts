import { analyze } from "../modules/ColorAnalyzer";
import { remap } from "../modules/ColorMapper";
import { inject, eject } from "../modules/CSSInjector";
import { getGlobalEnabled, getConfig } from "../modules/SiteConfigStore";
import { observe } from "../modules/DOMObserver";

export async function run(): Promise<void> {
  // Prevent white flash immediately (synchronous)
  inject("html, body { background-color: #000000 !important; color: rgb(224,224,224) !important; }");

  const origin = location.origin;
  const [globalEnabled, siteConfig] = await Promise.all([
    getGlobalEnabled(),
    getConfig(origin),
  ]);

  if (!globalEnabled || siteConfig.whitelist) {
    eject();
    return;
  }

  const doFullAnalysis = () => {
    const entries = analyze(document.documentElement);
    const css = remap(entries, siteConfig.brightness);
    inject(css);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", doFullAnalysis);
  } else {
    doFullAnalysis();
  }

  observe((newNodes) => {
    if (newNodes.length === 0) {
      doFullAnalysis();
    } else {
      newNodes.forEach((node) => {
        if (node instanceof Element) {
          const entries = analyze(node);
          const css = remap(entries, siteConfig.brightness);
          inject(css);
        }
      });
    }
  });
}

run();
