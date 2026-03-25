#import "ExpoRustJsi.h"
#import <ExpoModulesJSI/EXJavaScriptRuntime.h>

// C entry point defined by the Rust static library
extern "C" void expo_rust_jsi_install(void *runtime_ptr);

void ExpoRustJsiInstall(EXJavaScriptRuntime *runtime) {
  // EXJavaScriptRuntime::get returns jsi::Runtime*, which is a C++ pointer.
  // We pass it as void* to the Rust C interface.
  jsi::Runtime *rt = [runtime get];
  NSLog(@"[ExpoRustJsi] ExpoRustJsiInstall: runtime=%p, jsi::Runtime*=%p", runtime, rt);
  expo_rust_jsi_install(static_cast<void *>(rt));
  NSLog(@"[ExpoRustJsi] ExpoRustJsiInstall: returned from Rust");
}
