export const MOTION_PROBE = `(() => {
  if (window.__qazinho) return;
  const probe = { shifts: [], frames: [], lastChange: performance.now() };
  const touch = () => { probe.lastChange = performance.now(); };
  window.__qazinho = probe;
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        probe.shifts.push({ at: entry.startTime, value: entry.value, hadInput: entry.hadRecentInput });
        touch();
      }
    }).observe({ type: 'layout-shift', buffered: true });
  } catch {}
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) probe.frames.push({ at: entry.startTime, ms: entry.duration });
    }).observe({ type: 'long-animation-frame', buffered: true });
  } catch {}
  new MutationObserver(touch).observe(document, {
    subtree: true, childList: true, characterData: true, attributes: true,
  });
})();`;
