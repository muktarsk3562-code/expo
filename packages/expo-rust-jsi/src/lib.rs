//! # expo-rust-jsi
//!
//! Example Expo native module package written in Rust, using the
//! `expo-rust-jsi-core` SDK for direct JSI integration.
//!
//! This package demonstrates how to create Rust-based Expo modules.
//! It re-exports the core SDK so consumers only need one dependency.

// Re-export the core SDK so users can `use expo_rust_jsi::prelude::*`
pub use expo_rust_jsi_core::*;

/// C entry point called from the native side (Android JNI or iOS ObjC++)
/// to initialize Rust modules on the JSI runtime.
///
/// # Safety
/// The runtime_ptr must be a valid pointer to a `jsi::Runtime`.
#[no_mangle]
pub unsafe extern "C" fn expo_rust_jsi_install(runtime_ptr: *mut std::ffi::c_void) {
    expo_rust_jsi_core::install_modules(runtime_ptr, get_module_registry);
}

/// Returns the module registry with all Rust modules to install.
fn get_module_registry() -> expo_rust_jsi_core::module::ModuleRegistry {
    #[allow(unused_mut)]
    let mut registry = expo_rust_jsi_core::module::ModuleRegistry::new();

    #[cfg(feature = "example_modules")]
    {
        registry.register::<crate::examples::MathModule>();
        registry.register::<crate::examples::StringModule>();
    }

    registry
}

#[cfg(feature = "example_modules")]
pub mod examples;
