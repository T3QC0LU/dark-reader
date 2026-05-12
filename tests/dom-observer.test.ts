import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { observe } from "../src/modules/DOMObserver";

beforeEach(() => {
  document.body.innerHTML = "";
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("S7: DOMObserver", () => {
  it("adding a child node triggers the callback with that node", async () => {
    const received: Node[][] = [];
    const cleanup = observe((nodes) => received.push(nodes));

    const div = document.createElement("div");
    document.body.appendChild(div);
    await new Promise((r) => setTimeout(r, 0));

    expect(received.length).toBe(1);
    expect(received[0]).toContain(div);

    cleanup();
  });

  it("the same node added twice is only reported once (WeakSet dedup)", async () => {
    const received: Node[][] = [];
    const cleanup = observe((nodes) => received.push(nodes));

    const div = document.createElement("div");
    document.body.appendChild(div);
    await new Promise((r) => setTimeout(r, 0));

    document.body.removeChild(div);
    document.body.appendChild(div);
    await new Promise((r) => setTimeout(r, 0));

    // Only the first addition is in a callback; second is deduplicated
    const allReported = received.flat();
    expect(allReported.filter((n) => n === div).length).toBe(1);

    cleanup();
    document.body.removeChild(div);
  });

  it("calling the cleanup function stops future callbacks", async () => {
    const received: Node[][] = [];
    const cleanup = observe((nodes) => received.push(nodes));

    cleanup();

    document.body.appendChild(document.createElement("div"));
    await new Promise((r) => setTimeout(r, 0));

    expect(received.length).toBe(0);
  });

  it("history.pushState call triggers the callback with empty array", () => {
    const received: Node[][] = [];
    const cleanup = observe((nodes) => received.push(nodes));

    history.pushState({}, "", "/test-path");

    expect(received.length).toBe(1);
    expect(received[0]).toEqual([]);

    cleanup();
  });
});
