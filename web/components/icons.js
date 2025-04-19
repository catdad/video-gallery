import { html } from "../lib/preact.js";

export const Left = ({  thickness = 2, ...props } = {}) => html`<svg viewBox="0 0 24 24" ...${props}>
  <path d="M16 0 L6 12 L16 24" stroke="currentColor" fill="none" stroke-width=${thickness} />
</svg>`;

export const Right = ({  thickness = 2, ...props } = {}) => html`<svg viewBox="0 0 24 24" ...${props}>
  <path d="M6 0 L16 12 L6 24" stroke="currentColor" fill="none" stroke-width=${thickness} />
</svg>`;

export const X = ({  thickness = 2, ...props } = {}) => html`<svg viewBox="0 0 24 24" ...${props}>
  <path d="M2 2 L22 22 M2 22 L 22 2" stroke="currentColor" fill="none" stroke-width=${thickness} />
</svg>`;
