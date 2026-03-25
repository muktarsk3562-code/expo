cmake_minimum_required(VERSION 3.13.0)
project(expo-rust)

set(CMAKE_CXX_STANDARD 20)

# --- Resolve expo-modules-rs path ---
# The core package contains the C++ shim and cxx bridge headers.
# Use the resolve script to find it (works with npm, yarn, pnpm, bun).
execute_process(
    COMMAND node "${CMAKE_CURRENT_SOURCE_DIR}/../scripts/resolve-rust-core.js" "--print-path"
    OUTPUT_VARIABLE RUST_CORE_PATH
    OUTPUT_STRIP_TRAILING_WHITESPACE
    RESULT_VARIABLE RESOLVE_RESULT
)
if(NOT RESOLVE_RESULT EQUAL 0)
    message(FATAL_ERROR "Failed to resolve expo-modules-rs. Is it installed?")
endif()
message(STATUS "expo-modules-rs resolved: ${RUST_CORE_PATH}")

# --- Rust library ---
# The Rust static library is built by Gradle's cargo task before CMake runs.
# Map Android ABI to Rust target triple to find the pre-built library.
if(ANDROID_ABI STREQUAL "armeabi-v7a")
    set(RUST_TARGET "armv7-linux-androideabi")
elseif(ANDROID_ABI STREQUAL "arm64-v8a")
    set(RUST_TARGET "aarch64-linux-android")
elseif(ANDROID_ABI STREQUAL "x86")
    set(RUST_TARGET "i686-linux-android")
elseif(ANDROID_ABI STREQUAL "x86_64")
    set(RUST_TARGET "x86_64-linux-android")
endif()
set(RUST_LIB_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../target/${RUST_TARGET}/release")
set(RUST_LIB "${RUST_LIB_DIR}/libexpo_rust.a")

# Import the pre-built Rust static library
add_library(expo_rust_static STATIC IMPORTED)
set_target_properties(expo_rust_static PROPERTIES
    IMPORTED_LOCATION "${RUST_LIB}"
)

# --- C++ shim layer ---
# The C++ shim lives in the core package
set(CPP_DIR "${RUST_CORE_PATH}/cpp")
set(RUST_TARGET_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../target")

# Find the cxx-generated header directory.
# cargo build puts cxx bridge headers under target/<profile>/build/expo-modules-rs-*/out/cxxbridge/
# We glob for it since the hash in the directory name varies.
file(GLOB CXX_BRIDGE_DIRS "${RUST_TARGET_DIR}/*/build/expo-modules-rs-*/out/cxxbridge")
# Also check the target-specific build dirs
file(GLOB CXX_BRIDGE_DIRS_TARGET "${RUST_TARGET_DIR}/*/*/build/expo-modules-rs-*/out/cxxbridge")
list(APPEND CXX_BRIDGE_DIRS ${CXX_BRIDGE_DIRS_TARGET})

# Pick the first match (there should be only one per build)
set(CXX_INCLUDE_DIR "")
set(CXX_CRATE_DIR "")
foreach(dir ${CXX_BRIDGE_DIRS})
    if(EXISTS "${dir}/include" AND EXISTS "${dir}/crate")
        set(CXX_INCLUDE_DIR "${dir}/include")
        set(CXX_CRATE_DIR "${dir}/crate")
        break()
    endif()
endforeach()

add_library(expo-rust SHARED
    "${CPP_DIR}/jsi_shim.cpp"
    "src/main/cpp/jni_entry.cpp"
)

target_include_directories(expo-rust PRIVATE
    "${CPP_DIR}"
    "${CXX_INCLUDE_DIR}"   # rust/cxx.h
    "${CXX_CRATE_DIR}"     # expo-modules-rs/src/bridge.rs.h
)

# Find React Native packages
find_package(ReactAndroid REQUIRED CONFIG)
find_package(fbjni REQUIRED CONFIG)

target_link_libraries(expo-rust
    expo_rust_static
    fbjni::fbjni
    ReactAndroid::jsi
    ReactAndroid::reactnative
    android
    log
)

target_compile_options(expo-rust PRIVATE
    -Wall
    -Werror
    -fexceptions
)
