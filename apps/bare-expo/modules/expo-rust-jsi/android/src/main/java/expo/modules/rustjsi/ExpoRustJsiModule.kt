package expo.modules.rustjsi

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
class ExpoRustJsiModule : Module() {
    companion object {
        init {
            System.loadLibrary("expo-rust-jsi")
        }
    }

    override fun definition() = ModuleDefinition {
        Name("ExpoRustJsi")

        Function("install") {
            val runtime = appContext.runtime
            nativeInstall(runtime.rawPointer)
        }
    }

    private external fun nativeInstall(jsiRuntimePtr: Long)
}
