// Copyright 2025-present 650 Industries. All rights reserved.

import ExpoModulesCore

/**
 Observable state for Toggle, created from JavaScript and observed by SwiftUI.
 Replaces the @State + onChange synchronization pattern with a direct binding.
 */
internal final class ToggleState: ObservableState {
  @Published var isOn: Bool = false {
    didSet {
      if oldValue != isOn {
        safeEmit(event: "isOnChange", arguments: ["isOn": isOn])
      }
    }
  }
}
