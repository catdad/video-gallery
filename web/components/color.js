import { html } from "../lib/preact.js";

const c = `#6BC9FF`;
const m = `#D53C9F`;
const y = `#FCE54D`;
const k = `#0E0B01`;
const w = `#eceff1`;

export const color = { c, m, y, k, w };

export const text = w;
export const background = k;

export const withTheme = Component => props => html`<style>
  :root {
    --darkest: #111111;
    --dark: #222222;
    --darkish: #444444;
    --middle: #8b8b8b;
    --light: #bbbbbb;
    --lightest: #dddddd;

    --background: var(--darkest);
    --bg-card: var(--dark);
    --foreground: rgba(255, 255, 255, .86);
    --accent: rgba(255, 255, 255, 0.05);
    --accent-light: rgba(255, 255, 255, 0.15);
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
