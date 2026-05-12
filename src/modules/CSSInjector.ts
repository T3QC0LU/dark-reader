const TAG_ATTR = "data-dark-reader";

/** Inject (or replace) the dark-reader <style> tag. */
export function inject(css: string): void {
  eject(); // remove any existing tag first
  const style = document.createElement("style");
  style.setAttribute(TAG_ATTR, "");
  style.textContent = css;
  document.head.appendChild(style);
}

/** Remove the dark-reader <style> tag if present. */
export function eject(): void {
  document.querySelector(`style[${TAG_ATTR}]`)?.remove();
}
