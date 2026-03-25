package expo.modules.rust

import expo.modules.core.utilities.ifNull
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Expo module that loads and initializes Rust-based JSI modules.
 *
 * The install is exposed as an explicit Function rather than using OnCreate,
 * because OnCreate fires during module instantiation — before the JSI runtime
 * is guaranteed to be available. The JS layer calls install() synchronously
 * on import.
 */
class ExpoRustModule : Module() {
    companion object {
        init {
            System.loadLibrary("expo-rust")
        }
    }

    override fun definition() = ModuleDefinition {
        Name("ExpoRust")

        Function("install") {
          val jsContextHolder = appContext.runtime.reactContext?.javaScriptContextHolder?.get()
            ?: throw IllegalStateException("JavaScript context is not available")
          val jsRuntimePointer = jsContextHolder.takeIf { it != 0L }.ifNull {
            throw IllegalStateException("❌ Cannot install JSI interop - JS runtime pointer is null")
          }
          nativeInstall(jsRuntimePointer)
        }
    }

    private external fun nativeInstall(jsiRuntimePtr: Long)
}
