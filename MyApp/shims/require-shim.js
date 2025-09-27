// Ensure a global `require` exists for runtime environments (Hermes) that may not
// expose it the way some modules expect. This tries common internal hooks and
// falls back to a harmless stub that throws a descriptive error when used.
;(function () {
  try {
    if (typeof globalThis.require === 'function') return;
    // Hermes internal runtime may expose __r or $RefreshReg; try common hooks
    if (typeof globalThis.__r === 'function') {
      globalThis.require = globalThis.__r;
      return;
    }
    // If Metro's module system exposes __d, we can't easily map it here safely.
    // Create a stub that throws an informative error so stack traces point to usage.
    globalThis.require = function () {
      throw new Error('global.require is not available in this JS runtime. Ensure Metro/Hermes setup or avoid relying on global.require.');
    };
  } catch (e) {
    // No-op; fail gracefully and let the app's startup error surface if require is used.
    // eslint-disable-next-line no-console
    console.warn('require-shim failed to initialize:', e && e.message);
  }
})();
