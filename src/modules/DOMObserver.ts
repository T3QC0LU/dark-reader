export function observe(onMutation: (nodes: Node[]) => void): () => void {
  const seen = new WeakSet<Node>();

  const observer = new MutationObserver((mutations) => {
    const newNodes: Node[] = [];
    mutations.forEach((m) => {
      m.addedNodes.forEach((node) => {
        if (!seen.has(node)) {
          seen.add(node);
          newNodes.push(node);
        }
      });
    });
    if (newNodes.length > 0) onMutation(newNodes);
  });

  observer.observe(document.body ?? document.documentElement, {
    childList: true,
    subtree: true,
  });

  const origPush = history.pushState.bind(history);
  const origReplace = history.replaceState.bind(history);
  history.pushState = function (...args) { origPush(...args); onMutation([]); };
  history.replaceState = function (...args) { origReplace(...args); onMutation([]); };

  return () => {
    observer.disconnect();
    history.pushState = origPush;
    history.replaceState = origReplace;
  };
}
