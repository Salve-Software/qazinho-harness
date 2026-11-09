export const FILE_VIEWER_PAGE = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body { margin: 0; background: #2f3033; color: #d9d9dc; font: 13px/1.4 system-ui, sans-serif; }
      main { display: flex; flex-direction: column; align-items: center; gap: 18px; padding: 16px 24px 40px; }
      main.is-text { align-items: stretch; gap: 0; }
      section { display: flex; flex-direction: column; align-items: center; gap: 6px; }
      main.is-text section { align-items: stretch; }
      header { color: #a8a9ad; font: 12px/1 ui-monospace, monospace; }
      .sheet { position: relative; background: #fff; box-shadow: 0 1px 8px rgba(0, 0, 0, 0.45); }
      .sheet img { display: block; width: 100%; height: 100%; }
      .text { position: absolute; inset: 0; overflow: hidden; color: transparent; }
      .text span { position: absolute; line-height: 1; white-space: pre; }
      .picture { display: block; max-width: 100%; height: auto; }
      pre { margin: 0; font: 12px/18px ui-monospace, monospace; white-space: pre; }
      .note { margin: 0; color: #a8a9ad; }
    </style>
  </head>
  <body>
    <main></main>
    <script type="module" src="/~/viewer.js"></script>
  </body>
</html>`;
