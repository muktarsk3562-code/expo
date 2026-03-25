//! # expo-modules-rs
//!
//! Rust SDK for writing Expo native modules that integrate directly
//! with the JavaScript Interface (JSI) runtime.
//!
//! This crate provides:
//! - The `ExpoModule` trait and `ModuleBuilder` for defining modules
//! - `JsValue` types and conversion traits (`FromJsValue`, `IntoJsValue`)
//! - The cxx bridge to the JSI C++ layer
//! - The `#[expo_module]` and `#[derive(ExpoRecord)]` proc macros
//!
//! ## Architecture
//!
//! ```text
//! +---------------+     +----------------+     +----------------+
//! |  JavaScript   |---->|   JSI (C++)    |---->|  Rust Module   |
//! |   (Hermes)    |<----|  jsi_shim.cpp  |<----|  (your crate)  |
//! +---------------+     +----------------+     +----------------+
//!         |                    |                      |
//!    JS calls             cxx bridge             ExpoModule
//!    module.fn()          FfiValue               trait impl
//! ```
//!
//! ## Quick Start
//!
//! ```rust,ignore
//! use expo_modules_rs::prelude::*;
//!
//! struct MathModule;
//!
//! #[expo_module("RustMath")]
//! impl MathModule {
//!     #[constant]
//!     const PI: f64 = std::f64::consts::PI;
//!
//!     fn add(a: f64, b: f64) -> f64 {
//!         a + b
//!     }
//! }
//! ```

pub mod bridge;
pub mod module;
pub mod value;

/// Prelude module - import everything needed for module development.
pub mod prelude {
    pub use crate::module::{ExpoModule, ModuleBuilder, ModuleDefinition, ModuleRegistry};
    pub use crate::value::{
        ExpoError, FromJsValue, IntoJsValue, JsArray, JsObject, JsValue, PromiseHandle, Runtime,
    };
    pub use expo_module_macro::{expo_module, ExpoRecord};
}

/// C entry point called from the native side (Android JNI or iOS ObjC++)
/// to initialize Rust modules on the JSI runtime.
///
/// The `get_registry` closure must return a `ModuleRegistry` populated
/// with all modules to install.
///
/// # Safety
/// The runtime_ptr must be a valid pointer to a `jsi::Runtime`.
pub unsafe fn install_modules(
    runtime_ptr: *mut std::ffi::c_void,
    get_registry: impl FnOnce() -> module::ModuleRegistry,
) {
    if runtime_ptr.is_null() {
        eprintln!("[ExpoRust] ERROR: runtime_ptr is null!");
        return;
    }

    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        let rt = value::Runtime {
            handle: bridge::ffi::RuntimeHandle {
                ptr: runtime_ptr as *mut u8,
            },
        };

        let registry = get_registry();
        let module_count = registry.module_count();
        registry.install(&rt);
    }));

    if let Err(e) = result {
        eprintln!("[ExpoRust] PANIC during install: {:?}", e);
    }
}
