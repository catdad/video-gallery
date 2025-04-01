import { html } from "../lib/preact.js";

const merge = (...list) => list.reduce((memo, l) => ({ ...memo, ...l }));

const border = '2px solid var(--bg-card)';

const buttonStyle = {
  background: 'none',
  border,
  borderLeft: 'none',
  color: 'white',
  padding: '0.5rem',
};

const buttonFirst = {
  borderLeft: border,
  borderRadius: '0.5rem 0 0 0.5rem',
};

const buttonLast = {
  borderRadius: '0 0.5rem 0.5rem 0'
};

const buttonSelected = {
  background: 'var(--bg-card)',
};

export const Toggle = ({ options, onChange, value }) => {
  return html`<div style="display: flex; margin: 1rem auto; flex-direction: row; justify-content: center;">
  ${options.map((option, idx) => html`
    <button
      key=${option.value}
      onClick=${() => onChange(option.value)}
      style=${merge(
        buttonStyle,
        idx === 0 ? buttonFirst : {},
        idx === options.length - 1 ? buttonLast : {},
        value === option.value ? buttonSelected : {},
      )}
    >${option.label || option.value }</button>
  `)}
  </div>`
};
