import { analyze } from "../modules/ColorAnalyzer";
import { remap } from "../modules/ColorMapper";
import { inject } from "../modules/CSSInjector";

export function run(): void {
  const entries = analyze(document.documentElement);
  const css = remap(entries);
  inject(css);
}

run();
