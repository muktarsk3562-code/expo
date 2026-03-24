require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'ExpoRustJsi'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = package['homepage'] || 'https://github.com/expo/expo'
  s.platforms      = { :ios => '16.4' }
  s.swift_version  = '5.9'
  s.source         = { git: 'https://github.com/expo/expo.git' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = [
    '**/*.{swift,h,m,mm}',
    '../cpp/**/*.{h,cpp}',
  ]

  # cxx-generated headers are under target/<target>/release/build/expo-rust-jsi-*/out/cxxbridge/
  # We add a wildcard search path so the compiler can find rust/cxx.h and the bridge header.
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule',
    'HEADER_SEARCH_PATHS' => [
      '"${PODS_ROOT}/Headers/Public/React-jsi"',
      '"${PODS_TARGET_SRCROOT}/../target/*/release/build/expo-rust-jsi-*/out/cxxbridge/include"',
      '"${PODS_TARGET_SRCROOT}/../target/*/release/build/expo-rust-jsi-*/out/cxxbridge/crate"',
    ].join(' '),
    'OTHER_LDFLAGS' => '-lresolv -lexpo_rust_jsi',
    'LIBRARY_SEARCH_PATHS' => '"${BUILT_PRODUCTS_DIR}"',
  }

  # Build Rust library as part of the Xcode build.
  # We source .xcode.env to pick up the user's cargo/rustup PATH,
  # similar to how React Native sources it for the node binary.
  s.script_phase = {
    name: 'Build Rust Library',
    script: <<~SCRIPT,
      set -e

      # Source Xcode environment files to pick up cargo/rustup PATH.
      # This mirrors how React Native sources these files for node.
      ENV_PATH="$PODS_ROOT/../.xcode.env"
      if [ -f "$ENV_PATH" ]; then
        source "$ENV_PATH"
      fi
      if [ -f "${ENV_PATH}.local" ]; then
        source "${ENV_PATH}.local"
      fi

      # Also try common rustup locations if cargo is still not found
      if ! command -v cargo &> /dev/null; then
        if [ -f "$HOME/.cargo/env" ]; then
          source "$HOME/.cargo/env"
        fi
      fi

      if ! command -v cargo &> /dev/null; then
        echo "error: cargo not found. Install Rust via https://rustup.rs or add CARGO_HOME to .xcode.env.local"
        echo "  Example .xcode.env.local:"
        echo "    export PATH=\\\"\\$HOME/.cargo/bin:\\$PATH\\\""
        exit 1
      fi

      # Move to the package root (one level up from ios/)
      cd "${PODS_TARGET_SRCROOT}/.."

      # Determine Rust target based on platform and architecture
      if [ "${PLATFORM_NAME}" = "iphonesimulator" ]; then
        if [ "${ARCHS}" = "arm64" ]; then
          RUST_TARGET="aarch64-apple-ios-sim"
        else
          RUST_TARGET="x86_64-apple-ios"
        fi
      else
        RUST_TARGET="aarch64-apple-ios"
      fi

      echo "Building Rust library for target: ${RUST_TARGET}"
      cargo build --release --target "${RUST_TARGET}" --lib

      # Copy built static library to Xcode's build products directory
      mkdir -p "${BUILT_PRODUCTS_DIR}"
      cp "target/${RUST_TARGET}/release/libexpo_rust_jsi.a" "${BUILT_PRODUCTS_DIR}/"
    SCRIPT
    execution_position: :before_compile,
  }
end
