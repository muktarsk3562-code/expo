import { requireNativeModule } from 'expo-modules-core';

import type { RustMathModule } from './RustMath';
import type { RustStringModule } from './RustString';

/**
 * ExpoRustJsi is the loader module. Calling install() triggers the Rust
 * entry point that registers RustMath and RustString on
 * globalThis.__ExpoRustJsiModules.
 *
 * We cannot use expo.modules for Rust modules because it is a read-only
 * HostObject managed by ExpoModulesCore. Instead, Rust modules are installed
 * on a dedicated global object and accessed directly here.
 */
const ExpoRustJsi = requireNativeModule<{ install(): void }>('ExpoRustJsi');
ExpoRustJsi.install();

declare const globalThis: {
  __ExpoRustJsiModules?: Record<string, any>;
};

function requireRustModule<T>(name: string): T {
  const mod = globalThis.__ExpoRustJsiModules?.[name];
  if (!mod) {
    throw new Error(
      `Cannot find Rust module '${name}'. Ensure expo-rust-jsi is linked and the Rust library was built.`
    );
  }
  return mod as T;
}

export const RustMath = requireRustModule<RustMathModule>('RustMath');
export const RustString = requireRustModule<RustStringModule>('RustString');

export default ExpoRustJsi;

// Re-export types for consumers
export type { RustMathModule } from './RustMath';
export type { RustStringModule } from './RustString';
