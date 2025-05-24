import { html, useMemo } from "../lib/preact.js";
import { color, opacity, styled } from "./theme.js";

const merge = (...list) => list.reduce((memo, l) => ({ ...memo, ...l }));

const buttonStyle = {
  border: 'none',
  background: opacity(color.w, 0.125),
  color: color.w,
  padding: '0.5rem',
};

const buttonFirst = {
  borderTopLeftRadius: '0.5rem',
  borderBottomLeftRadius: '0.5rem',
};

const buttonLast = {
  borderTopRightRadius: '0.5rem',
  borderBottomRightRadius: '0.5rem',
};

const buttonSelected = {
  background: color.m,
  color: color.k,
};

const GroupButton = styled('button', buttonStyle);
const StandaloneButton = styled(GroupButton, merge(buttonFirst, buttonLast));

export const Button = ({ onClick, icon, children, disabled = false }) => {
  const className = useMemo(() => `b${Math.random().toString(36).slice(2)}`, []);

  return html`
    <style>
      ${`.${className}[disabled]`} {
        opacity: 0.5;
      }

      ${`.${className} > span`} {
        display: flex;
        gap: 0.25rem;
        align-items: center;
      }
    </style>
    <${StandaloneButton}
      className=${className}
      onClick=${onClick}
      disabled=${disabled}
    >
      <span>
        ${icon}
        ${children ? html`<span>${children}</span>` : ''}
      </span>
    <//>
  `;
};

export const Toggle = ({ label, options, onChange, value, disabled = false }) => {
  return html`<div style=${{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch'
  }}>
    ${label ? html`<span style="margin-right: 0.25rem; font-size: 0.9rem; line-height: 1; padding: 0.5rem 0;">${label}:</span>` : ''}
    ${options.map((option, idx) => html`
      <${GroupButton}
        key=${option.value}
        disabled=${disabled}
        onClick=${() => onChange(option.value)}
        style=${merge(
          idx === 0 ? buttonFirst : {},
          idx === options.length - 1 ? buttonLast : {},
          value === option.value ? buttonSelected : {},
        )}
      >${option.label || option.value}<//>
    `)}
  </div>`
};
