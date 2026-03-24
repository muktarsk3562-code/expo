import { requireNativeModule } from 'expo-modules-core';

import type { RustMathModule } from './RustMath';
import type { RustStringModule } from './RustString';

/**
 * ExpoRustJsi is the loader module. Calling install() triggers the Rust
 * entry point that registers RustMath and RustString on globalThis.expo.modules.
 *
 * We use an explicit install() call rather than OnCreate because OnCreate fires
 * during module instantiation — before the JSI runtime is available on AppContext.
 * Function bodies are only called after the runtime is ready.
 */
const ExpoRustJsi = requireNativeModule<{ install(): void }>('ExpoRustJsi');
ExpoRustJsi.install();

// Now that expo_rust_jsi_install has run, the Rust modules are registered.
export const RustMath = requireNativeModule<RustMathModule>('RustMath');
export const RustString = requireNativeModule<RustStringModule>('RustString');

export default ExpoRustJsi;

// Re-export types for consumers
export type { RustMathModule } from './RustMath';
export type { RustStringModule } from './RustString';
