/**
 * Extracts the native shared object ID from a SharedObject instance.
 * Used internally to pass SharedObject references as view props.
 */
export declare function getStateId(state?: object): number | undefined;
/**
 * Registers a custom serializer so SharedObjects automatically work in worklets.
 * Call once after `installOnUIRuntime()`. After registration, SharedObjects captured
 * by worklet closures are automatically packed/unpacked — no manual wrapping needed.
 *
 * @example
 * ```tsx
 * import { installOnUIRuntime } from 'expo-modules-core';
 * installOnUIRuntime();
 * registerSharedObjectSerializer();
 *
 * // Now SharedObjects just work in worklets:
 * const state = useToggleState(false);
 * runOnUI(() => {
 *   'worklet';
 *   state.isOn = true;
 * })();
 * ```
 */
export declare function registerSharedObjectSerializer(): void;
//# sourceMappingURL=index.d.ts.map