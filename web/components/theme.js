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

const c = '#6BC9FF';
const m = '#D53C9F';
const y = '#FCE54D';
// const k = '#0E0B01'; // yellow-based
const k = '#06010e'; // indigo-based
const w = '#eceff1';

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
    --foreground: ${w};
    --background: ${k};
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
<${Component} ...${props} />`;
