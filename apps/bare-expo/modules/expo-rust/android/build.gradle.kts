import org.gradle.api.tasks.Exec

plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "expo.modules.rust"
    compileSdk = 34

    defaultConfig {
        minSdk = 24

        externalNativeBuild {
            cmake {
                cppFlags("-std=c++20", "-fexceptions")
                arguments(
                    "-DANDROID_STL=c++_shared"
                )
            }
        }

        ndk {
            abiFilters += listOf("armeabi-v7a", "arm64-v8a", "x86", "x86_64")
        }
    }

    externalNativeBuild {
        cmake {
            path = file("CMakeLists.txt")
            version = "3.22.1"
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

// Resolve the expo-modules-rs npm package path.
// This works with all package managers (npm, yarn, pnpm, bun).
val resolveRustCorePath: String by lazy {
    val result = providers.exec {
        commandLine("node", "${project.projectDir}/../scripts/resolve-rust-core.js", "--print-path")
    }
    result.standardOutput.asText.get().trim()
}

// Map Android ABI to Rust target triple
val abiToRustTarget = mapOf(
    "armeabi-v7a" to "armv7-linux-androideabi",
    "arm64-v8a" to "aarch64-linux-android",
    "x86" to "i686-linux-android",
    "x86_64" to "x86_64-linux-android"
)

// Task to resolve expo-modules-rs and generate .cargo/config.toml
// This must run before any cargo build task.
val resolveRustCore = tasks.register<Exec>("resolveRustCore") {
    description = "Resolve expo-modules-rs path and generate .cargo/config.toml"
    workingDir = file("${project.projectDir}/..")
    commandLine("node", "scripts/resolve-rust-core.js")
}

// Task to build the Rust library for all target architectures
android.defaultConfig.ndk.abiFilters.forEach { abi ->
    val rustTarget = abiToRustTarget[abi] ?: return@forEach
    val taskName = "cargoBuild${abi.replace("-", "_").replaceFirstChar { it.uppercase() }}"

    tasks.register<Exec>(taskName) {
        description = "Build Rust library for $abi ($rustTarget)"
        workingDir = file("${project.projectDir}/..")

        // Ensure core path is resolved and .cargo/config.toml is generated first
        dependsOn(resolveRustCore)

        commandLine(
            "cargo", "build",
            "--release",
            "--target", rustTarget,
            "--lib"
        )
        // Tell Rust build.rs where JSI headers live so it compiles
        // real JSI bindings instead of standalone no-op stubs.
        val reactNativeDir = file("${project.projectDir}/../../react-native")
        environment("JSI_INCLUDE_PATH", "${reactNativeDir}/ReactCommon/jsi")

        // Copy the output to where CMake expects it
        doLast {
            val src = file("${project.projectDir}/../target/$rustTarget/release/libexpo_rust.a")
            val dst = file("${project.projectDir}/../target/$abi/libexpo_rust.a")
            dst.parentFile.mkdirs()
            src.copyTo(dst, overwrite = true)
        }
    }
}

// Ensure Rust is built before CMake
tasks.matching { it.name.startsWith("externalNativeBuild") }.configureEach {
    android.defaultConfig.ndk.abiFilters.forEach { abi ->
        val taskName = "cargoBuild${abi.replace("-", "_").replaceFirstChar { it.uppercase() }}"
        dependsOn(taskName)
    }
}

dependencies {
    implementation("expo.modules:expo-modules-core:+")
}
