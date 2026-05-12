import type { ColorEntry } from "./ColorAnalyzer";

// ── Colour math helpers (exported for testing) ───────────────────────────

export function parseRGB(color: string): [number, number, number] {
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return [0, 0, 0];
  return [+m[1], +m[2], +m[3]];
}

export function luminance(r: number, g: number, b: number): number {
  return [r, g, b].reduce((acc, c, i) => {
    const s = c / 255;
    const l = s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    return acc + l * [0.2126, 0.7152, 0.0722][i];
  }, 0);
}

export function contrastRatio(l1: number, l2: number): number {
  const [lo, hi] = l1 < l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

// ── Public remapping functions ────────────────────────────────────────────

/** Force any background to #000000 (OLED pure black). Transparent is preserved. */
export function remapBackground(color: string): string {
  if (color === "transparent" || color === "rgba(0, 0, 0, 0)") return color;
  return "#000000";
}

/**
 * Remap a text colour so it has ≥ 4.5:1 contrast against #000000.
 * Already-readable colours are returned unchanged.
 */
export function remapText(color: string, brightness = 100): string {
  const [r, g, b] = parseRGB(color);
  const lum = luminance(r, g, b);
  if (contrastRatio(lum, 0) >= 4.5) return color; // already readable
  // Derive a light grey scaled by the brightness preference (80–100 %)
  const v = Math.round(224 * (brightness / 100));
  return `rgb(${v}, ${v}, ${v})`;
}

// ── Full remap ────────────────────────────────────────────────────────────

/**
 * Given a list of ColorEntries, produce a CSS string that:
 *  1. Applies a universal baseline (all backgrounds → #000000, text → light).
 *  2. Targets each analysed element via a data-dr-id attribute override.
 */
export function remap(entries: ColorEntry[], brightness = 100): string {
  const v = Math.round(224 * (brightness / 100));
  const lines: string[] = [
    `/* Dark Reader — pure black baseline */`,
    `*, *::before, *::after {`,
    `  background-color: #000000 !important;`,
    `  color: rgb(${v}, ${v}, ${v}) !important;`,
    `  border-color: #1a1a1a !important;`,
    `}`,
    `img, video, canvas, picture, svg, iframe {`,
    `  background-color: initial !important;`,
    `  filter: none !important;`,
    `}`,
  ];

  entries.forEach((entry, idx) => {
    const id = String(idx);
    (entry.element as HTMLElement).dataset.drId = id;

    const bg = remapBackground(entry.background);
    const fg = remapText(entry.foreground, brightness);

    lines.push(
      `[data-dr-id="${id}"] { background-color: ${bg} !important; color: ${fg} !important; }`
    );
  });

  return lines.join("\n");
}
