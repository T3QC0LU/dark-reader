export interface ColorEntry {
  element: Element;
  background: string;
  foreground: string;
}

type GetStyle = (el: Element) => CSSStyleDeclaration;

const TRANSPARENT = ["", "transparent", "rgba(0, 0, 0, 0)"];

/**
 * Walk the DOM tree rooted at `root` and return colour entries for every
 * element that has an explicit (non-transparent) background or text colour.
 *
 * @param getStyle - injectable getter for computed styles; defaults to
 *                   window.getComputedStyle for production use.
 */
export function analyze(
  root: Element,
  getStyle: GetStyle = (el) => window.getComputedStyle(el)
): ColorEntry[] {
  const entries: ColorEntry[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);

  let node: Element | null = root;
  while (node) {
    const style = getStyle(node);
    const bg = style.backgroundColor ?? "";
    const fg = style.color ?? "";
    if (!TRANSPARENT.includes(bg) || fg) {
      entries.push({ element: node, background: bg, foreground: fg });
    }
    node = walker.nextNode() as Element | null;
  }
  return entries;
}
