import { html } from "../lib/preact.js";

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

const c = `#6BC9FF`;
const m = `#D53C9F`;
const y = `#FCE54D`;
const k = `#0E0B01`;
const w = `#eceff1`;

export const opacity = (color, alpha) => {
  const { r, g, b } = hexToRgb(color);
  return `rgba(${r},${g},${b},${alpha})`;
};

export const styled = (elem, style) =>
  ({ style: override = {}, ...props } = {}) =>
    html`<${elem} ...${props} style=${{ ...style, ...override }} />`;

export const color = { c, m, y, k, w };

export const withTheme = Component => props => html`<style>
  :root {
    --darkest: #111111;
    --dark: #222222;
    --darkish: #444444;
    --middle: #8b8b8b;
    --light: #bbbbbb;
    --lightest: #dddddd;

    --background: ${k};
    --bg-card: var(--dark);
    --foreground: rgba(255, 255, 255, .86);
    --accent: rgba(255, 255, 255, 0.05);
    --accent-light: rgba(255, 255, 255, 0.15);
  }

  html,
  body {
    margin: 0;
    padding: 0;
    color: ${w};
    background-color: var(--background);
    font-family: system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  }

  * {
    box-sizing: border-box;
  }
</style>
<${Component} ...${props} />`;
