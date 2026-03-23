import { SharedObject } from 'expo-modules-core';
import type { DependencyList } from 'react';
type ToggleStateEvents = {
    isOnChange: (payload: {
        isOn: boolean;
    }) => void;
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
export declare function useToggleState(initialValue?: boolean): ToggleState;
/**
 * Extracts the native shared object ID from a SharedObject instance.
 * Used internally to pass SharedObject references as view props.
 */
export declare function getStateId(state?: object): number | undefined;
/**
 * Creates a shared state that is automatically cleaned up when the component unmounts.
 * Generic hook for creating any ObservableState subclass registered in the module.
 */
export declare function useSharedState<T extends InstanceType<typeof SharedObject>>(factory: () => T, deps?: DependencyList): T;
export {};
//# sourceMappingURL=index.d.ts.map