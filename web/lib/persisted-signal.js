import { effect, useSignal } from "./preact.js";

export const usePersistedSignal = (name, defaultValue) => {
  const key = `catdad.video-gallery/${name}`;
  const value = localStorage.getItem(key) || defaultValue;

  const signal = useSignal(value);

  effect(() => {
    localStorage.setItem(key, signal.value);
  });

  return signal;
};
