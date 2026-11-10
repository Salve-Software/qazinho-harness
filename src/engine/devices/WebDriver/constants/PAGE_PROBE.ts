export const PAGE_PROBE = `(() => {
  if (window.__qazinho) return;
  const probe = { lastChange: performance.now() };
  const touch = () => { probe.lastChange = performance.now(); };
  window.__qazinho = probe;
  for (const name of ['pointerdown', 'mousedown', 'click'])
    window.addEventListener(name, () => { probe.pressed = true; }, true);
  new MutationObserver(touch).observe(document, {
    subtree: true, childList: true, characterData: true, attributes: true,
  });
})();`;
