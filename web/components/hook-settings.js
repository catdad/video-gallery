import { html, createContext, useContext } from "../lib/preact.js";
import { usePersistedSignal } from "../lib/persisted-signal.js";

const SettingsContext = createContext();

export const withSettings = Component => ({ children, ...props }) => {
  const resizeWidth = usePersistedSignal('setting-resize-width', 0);

  return html`
    <${SettingsContext.Provider} value=${{ resizeWidth }}>
      <${Component} ...${props}>${children}<//>
    <//>
  `;
};

export const useSettings = () => useContext(SettingsContext);
