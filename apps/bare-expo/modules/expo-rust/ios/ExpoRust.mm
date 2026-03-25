#import "ExpoRust.h"
#import <ExpoModulesJSI/EXJavaScriptRuntime.h>

// C entry point defined by the Rust static library
extern "C" void expo_rust_install(void *runtime_ptr);

void ExpoRustInstall(EXJavaScriptRuntime *runtime) {
  // EXJavaScriptRuntime::get returns jsi::Runtime*, which is a C++ pointer.
  // We pass it as void* to the Rust C interface.
  jsi::Runtime *rt = [runtime get];
  NSLog(@"[ExpoRust] ExpoRustInstall: runtime=%p, jsi::Runtime*=%p", runtime, rt);
  expo_rust_install(static_cast<void *>(rt));
  NSLog(@"[ExpoRust] ExpoRustInstall: returned from Rust");
}
