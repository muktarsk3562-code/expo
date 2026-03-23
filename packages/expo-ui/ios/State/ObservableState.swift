// Copyright 2025-present 650 Industries. All rights reserved.

import ExpoModulesCore
import SwiftUI

/**
 A SharedObject that conforms to ObservableObject, enabling SwiftUI views
 to observe state changes that originate from JavaScript.

 Subclass this to create typed state objects:

     class ToggleState: ObservableState {
         @Published var isOn: Bool = false {
             didSet {
                 if oldValue != isOn {
                     safeEmit(event: "isOnChange", arguments: ["isOn": isOn])
                 }
             }
         }
     }

 Register in the module via `Class()`:

     Class(ToggleState.self) {
         Constructor { ToggleState() }
         Property("isOn") { $0.isOn }
             .set { $0.isOn = $1 }
         Events("isOnChange")
     }

 Use in SwiftUI views by resolving from props:

     struct MyToggle: View {
         @ObservedObject var state: ToggleState
         var body: some View {
             Toggle(isOn: $state.isOn) { Text("Label") }
         }
     }
 */
open class ObservableState: SharedObject, ObservableObject {
  /**
   Emits an event to the paired JavaScript object.
   Safely handles cases where the JS runtime is unavailable.
   */
  public func safeEmit(event: String, arguments: [String: Any]) {
    if self.appContext != nil {
      self.emit(event: event, arguments: arguments)
    }
  }
}

// MARK: - ViewProps helpers

public extension ExpoSwiftUI.ViewProps {
  /**
   Resolves a native SharedObject by its ID from the shared object registry.
   Use this to retrieve an `ObservableState` instance passed from JavaScript as an integer ID prop.

       // In props:
       @Field var stateId: Int?

       // In view body:
       if let state: ToggleState = props.resolveSharedObject(props.stateId) {
           ObservedToggle(state: state)
       }
   */
  func resolveSharedObject<T: SharedObject>(_ id: Int?) -> T? {
    guard let id else { return nil }
    return appContext?.findNativeSharedObject(byId: id)
  }
}
