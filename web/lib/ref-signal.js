import { useSignal } from "./preact.js";

export const useRefSignal = (value) => {
  const internalSignal = useSignal(value);
  const ref = useSignal(Object.defineProperty({}, 'current', {
    get() {
      return internalSignal.value;
    },
    set(value) {
      internalSignal.value = value;
    }
  }));

  return ref.value;
};
