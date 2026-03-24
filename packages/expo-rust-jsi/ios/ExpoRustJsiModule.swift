import ExpoModulesCore

/// Expo module that loads and initializes Rust-based JSI modules on iOS.
///
/// This module calls into the Rust static library via an Objective-C++ shim
/// to install Rust modules directly onto the JSI runtime.
public class ExpoRustJsiModule: Module {
    public func definition() -> ModuleDefinition {
        Name("ExpoRustJsi")

        OnCreate {
            guard let runtime = try? self.appContext?.runtime else {
                return
            }
            // ExpoRustJsiInstall is defined in ExpoRustJsi.mm — it extracts
            // the raw jsi::Runtime* and passes it to the Rust C entry point.
            ExpoRustJsiInstall(runtime)
        }
    }
}
