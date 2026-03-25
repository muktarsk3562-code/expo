import { requireNativeModule } from 'expo-modules-core';

import type { RustMathModule } from './RustMath';
import type { RustStringModule } from './RustString';

/**
 * ExpoRust is the loader module. Calling install() triggers the Rust
 * entry point that registers RustMath and RustString on
 * globalThis.__ExpoRustModules.
 *
 * We cannot use expo.modules for Rust modules because it is a read-only
 * HostObject managed by ExpoModulesCore. Instead, Rust modules are installed
 * on a dedicated global object and accessed directly here.
 */
const ExpoRust = requireNativeModule<{ install(): void }>('ExpoRust');
console.warn('[ExpoRust] calling install()...');
try {
  ExpoRust.install();
  console.warn('[ExpoRust] install() returned');
} catch (e) {
  console.warn('[ExpoRust] install() threw:', e);
}
console.warn(
  '[ExpoRust] __ExpoRustModules =',
  JSON.stringify(Object.keys((globalThis as any).__ExpoRustModules ?? {}))
);

declare const globalThis: {
  __ExpoRustModules?: Record<string, any>;
};

function requireRustModule<T>(name: string): T {
  const mod = globalThis.__ExpoRustModules?.[name];
  if (!mod) {
    throw new Error(
      `Cannot find Rust module '${name}'. Ensure expo-rust is linked and the Rust library was built.`
    );
  }
  return mod as T;
}

export const RustMath = requireRustModule<RustMathModule>('RustMath');
export const RustString = requireRustModule<RustStringModule>('RustString');

export default ExpoRust;

// Re-export types for consumers
export type { RustMathModule } from './RustMath';
export type { RustStringModule } from './RustString';
