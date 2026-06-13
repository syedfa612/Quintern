import { useEffect, useRef, useState } from 'react'

// Shortcut shape:
//   { combo, description, action, scope }
// `combo` uses keyboard notation: 'mod+k', 'g d', '/', '?', 'esc'
// `scope` is a key in the activeScopes map; only enabled if the scope is active.
//
// Modifiers: `mod` (Cmd on Mac, Ctrl elsewhere), `shift`, `alt`.

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform);

function matchesEvent(e, combo) {
  const parts = combo.toLowerCase().split('+').map((s) => s.trim());
  const key = parts[parts.length - 1];
  const wantMod = parts.includes('mod');
  const wantShift = parts.includes('shift');
  const wantAlt = parts.includes('alt');
  // Sequence combos (with a space) are handled separately.
  if (combo.includes(' ')) return false;

  // For "?" we need to check the actual key.
  if (key === 'escape') return e.key === 'Escape';
  if (key === 'enter') return e.key === 'Enter';
  if (key === 'arrowup' || key === 'arrowdown' || key === 'arrowleft' || key === 'arrowright') {
    return e.key.toLowerCase() === key;
  }
  if (key === '/') return e.key === '/';
  if (key === '?') return e.key === '?';
  if (key.length === 1) return e.key.toLowerCase() === key;

  const mod = isMac ? e.metaKey : e.ctrlKey;
  if (mod !== wantMod) return false;
  if (wantShift !== e.shiftKey) return false;
  if (wantAlt !== e.altKey) return false;
  if (key === 'space') return e.key === ' ';
  if (key === 'k' || key === 'd' || key === 't' || key === 'b' || key === 'a') return e.key.toLowerCase() === key;
  return e.key.toLowerCase() === key;
}

// useShortcuts({ shortcuts, scope })
// Pass `shortcuts` as a stable array. `scope` is a string telling the hook
// which scope is currently active (e.g. 'global', 'command-palette', 'modal').
// When the scope is not in the active set, the shortcut is ignored.
export function useShortcuts({ shortcuts, activeScopes, enabled = true }) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e) => {
      // Sequence tracking: a "g d" combo is two consecutive keypresses.
      // We do this with a small buffer.
      window.__shortcutBuffer = window.__shortcutBuffer || { keys: [], at: 0 };
      const buf = window.__shortcutBuffer;

      // Plain single-key shortcuts
      for (const s of shortcuts) {
        if (s.scope && activeScopes && !activeScopes.includes(s.scope)) continue;
        if (s.combo.includes(' ') || s.combo === '?') continue;
        if (matchesEvent(e, s.combo)) {
          e.preventDefault();
          s.action?.(e);
          return;
        }
      }

      // Sequential shortcuts like "g d"
      const now = Date.now();
      if (now - buf.at > 1000) buf.keys = [];
      buf.at = now;
      if (e.key === 'Escape') { buf.keys = []; return; }
      if (e.metaKey || e.ctrlKey || e.altKey) return; // skip on modifier keys
      buf.keys.push(e.key.toLowerCase());
      const seq = buf.keys.join(' ');
      for (const s of shortcuts) {
        if (!s.combo.includes(' ')) continue;
        if (s.scope && activeScopes && !activeScopes.includes(s.scope)) continue;
        if (seq === s.combo.toLowerCase()) {
          e.preventDefault();
          buf.keys = [];
          s.action?.(e);
          return;
        }
      }
      // If the buffer grows without matching, reset.
      if (buf.keys.length > 2) buf.keys = [];
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts, activeScopes, enabled]);
}
