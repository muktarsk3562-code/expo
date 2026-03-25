import ExpoModulesCore

/// Expo module that loads and initializes Rust-based JSI modules on iOS.
///
/// The install is exposed as an explicit Function rather than using OnCreate,
/// because OnCreate fires during module instantiation — before the JSI runtime
/// is set on AppContext. The JS layer calls install() synchronously on import.
public class ExpoRustJsiModule: Module {
    public func definition() -> ModuleDefinition {
        Name("ExpoRustJsi")

        Function("install") {
            guard let appContext else {
                NSLog("[ExpoRustJsi] ERROR: appContext is nil")
                throw Exceptions.AppContextLost()
            }
            let runtime = try appContext.runtime
            NSLog("[ExpoRustJsi] Swift install() calling ExpoRustJsiInstall, runtime=\(runtime)")
            ExpoRustJsiInstall(runtime)
            NSLog("[ExpoRustJsi] Swift install() completed")
        }
    }
}
