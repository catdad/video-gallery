import { html } from "../lib/preact.js";

const merge = (...list) => list.reduce((memo, l) => ({ ...memo, ...l }));

const border = '1px solid var(--accent)';

const buttonStyle = {
  background: 'var(--bg-card)',
  border,
  borderLeft: 'none',
  color: 'white',
  padding: '0.5rem',
};

const buttonFirst = {
  borderLeft: border,
  borderTopLeftRadius: '0.5rem',
  borderBottomLeftRadius: '0.5rem',
};

const buttonLast = {
  borderTopRightRadius: '0.5rem',
  borderBottomRightRadius: '0.5rem',
};

const buttonSelected = {
  background: 'var(--accent-light)',
};

export const Button = ({ onClick, children }) => {
  return html`<button
    onClick=${onClick}
    style=${merge(buttonStyle, buttonFirst, buttonLast)}
  >
    ${children}
  </button>`;
};

export const Toggle = ({ label, options, onChange, value }) => {
  return html`<div style=${{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  }}>
  ${label ? html`<span style="margin-right: 0.5rem">${label}:</span>` : ''}
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
    >${option.label || option.value}</button>
  `)}
  </div>`
};
