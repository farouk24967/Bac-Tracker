// electron/auth-popup-preload.cjs
// ─────────────────────────────────────────────────────────────────────────────
// This preload runs inside the Firebase auth POPUP window.
//
// Problem: Firebase's handler page (firebaseapp.com/__/auth/handler) signals
// the auth result by calling:
//   window.opener.postMessage(data, targetOrigin)
//
// In Electron, window.opener is always null in child windows, so the message
// is never delivered and Firebase shows "The requested action is invalid."
//
// Solution: We replace window.opener with a fake that relays the message to
// the main process via IPC. The main process then forwards it to the main
// window's renderer, which dispatches it as a real MessageEvent so that
// Firebase SDK's own 'message' listener picks it up.
// ─────────────────────────────────────────────────────────────────────────────

const { ipcRenderer } = require('electron');

// Run immediately — must execute before the page's own script reads window.opener
(function patchWindowOpener() {
  try {
    Object.defineProperty(window, 'opener', {
      get() {
        return {
          postMessage(data, targetOrigin) {
            // 'window.location.origin' here is the popup's own origin,
            // e.g. "https://gen-lang-client-0040788828.firebaseapp.com"
            // Firebase SDK checks event.origin against authDomain, so we
            // must pass the popup's origin as the sender.
            const senderOrigin = window.location.origin;
            console.log('[Auth Popup] window.opener.postMessage intercepted, relaying via IPC');
            ipcRenderer.send(
              'firebase-auth-relay',
              JSON.stringify(data),
              senderOrigin
            );
          },
          closed: false,
          location: { href: '' },
        };
      },
      configurable: true,
    });
    console.log('[Auth Popup] window.opener patched successfully');
  } catch (e) {
    console.error('[Auth Popup] Failed to patch window.opener:', e);
  }
})();
