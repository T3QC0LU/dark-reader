import type { ColorEntry } from "./ColorAnalyzer";
export interface CSSOverride { selector: string; property: string; value: string; }
export function remap(_entries: ColorEntry[]): CSSOverride[] { return []; }
