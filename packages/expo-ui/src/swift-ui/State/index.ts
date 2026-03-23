import { requireNativeModule } from 'expo';
import { SharedObject, useReleasingSharedObject } from 'expo-modules-core';
import type { DependencyList } from 'react';

const ExpoUI = requireNativeModule('ExpoUI');

// MARK: - ToggleState

type ToggleStateEvents = {
  isOnChange: (payload: { isOn: boolean }) => void;
};

/**
 * Observable state for a Toggle, shared between JavaScript and SwiftUI.
 *
 * Changes from either side are synchronized automatically:
 * - Setting `state.isOn` from JS updates the SwiftUI view.
 * - Toggling in the native UI emits the `isOnChange` event to JS.
 */
export declare class ToggleState extends SharedObject<ToggleStateEvents> {
  /**
   * The current on/off value of the toggle.
   */
  isOn: boolean;
}

/**
 * Creates a `ToggleState` that is automatically cleaned up when the component unmounts.
 *
 * @example
 * ```tsx
 * const state = useToggleState(false);
 *
 * state.addListener('isOnChange', ({ isOn }) => {
 *   console.log('Toggle changed:', isOn);
 * });
 *
 * return <Toggle state={state} label="Airplane Mode" />;
 * ```
 */
export function useToggleState(initialValue: boolean = false): ToggleState {
  return useReleasingSharedObject(() => {
    const state = new ExpoUI.ToggleState() as ToggleState;
    state.isOn = initialValue;
    return state;
  }, [initialValue]);
}

// MARK: - Utilities

/**
 * Extracts the native shared object ID from a SharedObject instance.
 * Used internally to pass SharedObject references as view props.
 */
export function getStateId(state?: object): number | undefined {
  if (!state) {
    return undefined;
  }
  return (state as { __expo_shared_object_id__?: number }).__expo_shared_object_id__;
}

/**
 * Creates a shared state that is automatically cleaned up when the component unmounts.
 * Generic hook for creating any ObservableState subclass registered in the module.
 */
export function useSharedState<T extends InstanceType<typeof SharedObject>>(
  factory: () => T,
  deps: DependencyList = []
): T {
  return useReleasingSharedObject(factory, deps);
}
