// Firebase v12 browser ESM accesses window/document/localStorage at module init time.
// In React Native these globals are undefined, causing an immediate crash.
// This file must be imported before any Firebase import.
import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
  const g = global as any;

  // document — Firebase RTDB checks readyState, addEventListener, createElement, body
  if (!g.document) {
    g.document = {
      readyState: 'complete',
      domain: '',
      addEventListener: () => {},
      removeEventListener: () => {},
      attachEvent: undefined,
      detachEvent: undefined,
      createElement: () => ({
        style: {},
        parentNode: null,
        contentWindow: null,
        contentDocument: null,
      }),
      body: {
        appendChild: () => {},
        removeChild: () => {},
      },
    };
  }

  // window — Firebase checks window.location.protocol and window.addEventListener
  if (!g.window) g.window = g;
  const win = g.window;
  if (!win.location) {
    win.location = { protocol: 'https:', href: 'https://reactnative.app' };
  }
  if (!win.addEventListener) {
    win.addEventListener = () => {};
    win.removeEventListener = () => {};
  }
  if (win.attachEvent === undefined) {
    win.attachEvent = undefined;
  }

  // localStorage — Firebase RTDB uses it for session/auth persistence
  if (!g.localStorage) {
    const store: Record<string, string> = {};
    g.localStorage = {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => { store[k] = String(v); },
      removeItem: (k: string) => { delete store[k]; },
      clear: () => { for (const k in store) delete store[k]; },
      key: (i: number) => Object.keys(store)[i] ?? null,
      get length() { return Object.keys(store).length; },
    };
  }
}
