import { html, createContext, useComputed, useContext } from "../lib/preact.js";
import { useSettings } from "./hook-settings.js";
import { hexToRgb, themes, pickContrast } from "../lib/theme.js";

const ThemeContext = createContext({});

export const withTheme = Component => props => {
  const { themeName } = useSettings();
  const defaults = () => themes[themeName.value] || themes.monotone;

  const foreground = useComputed(() => defaults().foreground);
  const background = useComputed(() => defaults().background);

  const primary = useComputed(() => defaults().primary);
  const secondary = useComputed(() => defaults().secondary);
  const tertiary = useComputed(() => defaults().tertiary);

  const textOnPrimary = useComputed(() => pickContrast(primary.value, foreground.value, background.value));
  const textOnSecondary = useComputed(() => pickContrast(secondary.value, foreground.value, background.value));
  const textOnTertiary = useComputed(() => pickContrast(tertiary.value, foreground.value, background.value));

  return html`<style>
    :root {
      --foreground: ${foreground.value};
      --background: ${background.value};
    }

    html,
    body {
      margin: 0;
      padding: 0;
      color: var(--foreground);
      background-color: var(--background);
      font-family: system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    }

    * {
      box-sizing: border-box;
    }
  </style>
  <${ThemeContext.Provider} value=${{
    foreground, background,
    primary, secondary, tertiary,
    textOnPrimary, textOnSecondary, textOnTertiary
  }}>
    <${Component} ...${props} />
  <//>`;
};

export const useTheme = () => {
  const {
    foreground, background,
    primary, secondary, tertiary,
    textOnPrimary, textOnSecondary, textOnTertiary
  } = useContext(ThemeContext);

  return {
    foreground: foreground.value,
    background: background.value,
    primary: primary.value,
    secondary: secondary.value,
    tertiary: tertiary.value,
    textOnPrimary: textOnPrimary.value,
    textOnSecondary: textOnSecondary.value,
    textOnTertiary: textOnTertiary.value
  };
};

export const opacity = (color, alpha) => {
  const { r, g, b } = hexToRgb(color);
  return `rgba(${r},${g},${b},${alpha})`;
};

export const styled = (elem, style) =>
  ({ style: override = {}, ...props } = {}) => {
    const color = useTheme();
    const _style = typeof style === 'function' ? style({ color }) : style;

    return html`<${elem} ...${props} style=${{ ..._style, ...override }} />`;
  };
