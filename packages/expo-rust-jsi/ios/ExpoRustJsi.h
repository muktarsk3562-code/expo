#pragma once

#include <Foundation/Foundation.h>

// C interface to the Rust static library.
// This header is included in the auto-generated module map
// (via DEFINES_MODULE = YES) so Swift can call these functions directly.
extern void expo_rust_jsi_install(void* runtime_ptr);
