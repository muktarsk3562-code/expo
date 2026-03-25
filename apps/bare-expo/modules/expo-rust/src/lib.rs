//! # expo-rust
//!
//! Expo native module written in Rust, using the
//! `expo-modules-rs` SDK for direct JSI integration.

// Re-export the core SDK so users can `use expo_rust::prelude::*`
pub use expo_modules_rs::*;

/// C entry point called from the native side (Android JNI or iOS ObjC++)
/// to initialize Rust modules on the JSI runtime.
///
/// # Safety
/// The runtime_ptr must be a valid pointer to a `jsi::Runtime`.
#[no_mangle]
pub unsafe extern "C" fn expo_rust_install(runtime_ptr: *mut std::ffi::c_void) {
    expo_modules_rs::install_modules(runtime_ptr, get_module_registry);
}

/// Returns the module registry with all Rust modules to install.
fn get_module_registry() -> expo_modules_rs::module::ModuleRegistry {
    #[allow(unused_mut)]
    let mut registry = expo_modules_rs::module::ModuleRegistry::new();

    #[cfg(feature = "example_modules")]
    {
        registry.register::<crate::examples::MathModule>();
        registry.register::<crate::examples::StringModule>();
    }

    registry
}

#[cfg(feature = "example_modules")]
pub mod examples;
