import { html, createContext, useComputed, useSignal, useContext } from "./preact.js";

function hexToRgb(str) {
  let val = String(str).replace(/[^0-9a-f]/gi, '');

  if (val.length < 6) {
    val = val[0] + val[0] + val[1] + val[1] + val[2] + val[2];
  }

  return {
    r: parseInt(val.substring(0, 2), 16),
    g: parseInt(val.substring(2, 4), 16),
    b: parseInt(val.substring(4, 6), 16)
  };
}

const distance = (rgb1, rgb2) => Math.sqrt(
  Math.pow(rgb2.r - rgb1.r, 2) +
  Math.pow(rgb2.g - rgb1.g, 2) +
  Math.pow(rgb2.b - rgb1.b, 2)
);

const pickContrast = (target, candidate1, candidate2) => {
  const rgb = hexToRgb(target);
  const rgb1 = hexToRgb(candidate1);
  const rgb2 = hexToRgb(candidate2);

  const distanceTo1 = distance(rgb, rgb1);
  const distanceTo2 = distance(rgb, rgb2);

  return distanceTo1 > distanceTo2 ? candidate1 : candidate2;
};

const themes = {
  cmyk: {
    foreground: '#eceff1', // w
    background: '#06010e', // k, indigo based
    primary: '#D53C9F', // m
    secondary: '#FCE54D', // y
    tertiary: '#6BC9FF', // c
  },
  dark: {
    foreground: '#eceff1',
    background: '#06010e',
    primary: '#633c73',
    secondary: '#2a2532',
    tertiary: '#2a2532'
  },
  monotone: {
    foreground: '#eceff1',
    background: '#111111', // match home assistant
    primary: '#4b484f',
    secondary: '#4b484f',
    tertiary: '#4b484f'
  }
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

const ThemeContext = createContext({});

export const withTheme = Component => props => {
  const defaults = themes.monotone;

  const foreground = useSignal(defaults.foreground);
  const background = useSignal(defaults.background);

  const primary = useSignal(defaults.primary);
  const secondary = useSignal(defaults.secondary);
  const tertiary = useSignal(defaults.tertiary);

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
