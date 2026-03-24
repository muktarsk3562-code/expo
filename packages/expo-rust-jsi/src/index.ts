import { requireNativeModule } from 'expo-modules-core';

import type { RustMathModule } from './RustMath';
import type { RustStringModule } from './RustString';

/**
 * ExpoRustJsi is the loader module. Importing it triggers the installation
 * of all Rust-defined modules onto the JSI runtime. Individual Rust modules
 * (RustMath, RustString) must be required *after* this initialization.
 *
 * NOTE: The RustMath/RustString requires are intentionally in this file
 * rather than re-exported from their own files, because ES module import
 * hoisting would cause those files to evaluate before ExpoRustJsi is
 * initialized, resulting in "cannot find native module" errors.
 */
const ExpoRustJsi = requireNativeModule('ExpoRustJsi');

export default ExpoRustJsi;

// These calls are safe here because the line above already ran expo_rust_jsi_install,
// which registered RustMath and RustString on globalThis.expo.modules.
export const RustMath = requireNativeModule<RustMathModule>('RustMath');
export const RustString = requireNativeModule<RustStringModule>('RustString');

// Re-export types for consumers
export type { RustMathModule } from './RustMath';
export type { RustStringModule } from './RustString';
