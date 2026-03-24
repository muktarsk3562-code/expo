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

// MARK: - Worklet support

let _serializerRegistered = false;

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
export function registerSharedObjectSerializer(): void {
  if (_serializerRegistered) {
    return;
  }
  _serializerRegistered = true;

  const { registerCustomSerializable } = require('react-native-worklets') as {
    registerCustomSerializable: (data: {
      name: string;
      determine: (value: object) => boolean;
      pack: (value: any) => any;
      unpack: (value: any) => any;
    }) => void;
  };

  registerCustomSerializable({
    name: 'ExpoSharedObject',
    determine: (value: object) => {
      'worklet';
      return (
        value != null &&
        typeof value === 'object' &&
        '__expo_shared_object_id__' in value &&
        (value as any).__expo_shared_object_id__ !== 0
      );
    },
    pack: (value: any) => {
      'worklet';
      return {
        moduleName: value.__expoModuleName,
        className: value.__expoClassName ?? value.constructor?.name,
        objectId: value.__expo_shared_object_id__,
      };
    },
    unpack: (packed: any) => {
      'worklet';
      return (globalThis as any).expo.SharedObject.__wrap(
        packed.moduleName,
        packed.className,
        packed.objectId
      );
    },
  });
}
