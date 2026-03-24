#pragma once

#import <Foundation/Foundation.h>

@class EXJavaScriptRuntime;

/// Installs all Rust JSI modules onto the given JavaScript runtime.
/// Extracts the raw jsi::Runtime* from EXJavaScriptRuntime and passes
/// it to the Rust C entry point.
void ExpoRustJsiInstall(EXJavaScriptRuntime * _Nonnull runtime);
