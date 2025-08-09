import { html, useMemo } from "../lib/preact.js";
import { useTheme, opacity, styled } from "./hook-theme.js";

const merge = (...list) => list.reduce((memo, l) => ({ ...memo, ...l }));

const buttonFirst = {
  borderTopLeftRadius: '0.5rem',
  borderBottomLeftRadius: '0.5rem',
};

const buttonLast = {
  borderTopRightRadius: '0.5rem',
  borderBottomRightRadius: '0.5rem',
};

const GroupButton = styled('button', ({ color }) => ({
  border: 'none',
  background: opacity(color.foreground, 0.125),
  color: color.foreground,
  padding: '0.6rem 0.5rem',
}));
const StandaloneButton = styled(GroupButton, merge(buttonFirst, buttonLast));

export const LinkButton = styled('span', { textDecoration: 'underline', cursor: 'pointer' });

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
  const color = useTheme();

  return html`<div style=${{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    opacity: disabled ? 0.5 : 1
  }}>
    ${label ? html`<span style="margin-right: 0.25rem; font-size: 0.9rem; align-self: center;">${label}:</span>` : ''}
    ${options.map((option, idx) => html`
      <${GroupButton}
        key=${option.value}
        disabled=${disabled}
        onClick=${() => onChange(option.value)}
        style=${merge(
          idx === 0 ? buttonFirst : {},
          idx === options.length - 1 ? buttonLast : {},
          value === option.value ? {
            background: color.primary,
            color: color.textOnPrimary,
          } : {},
        )}
      >${option.label || option.value}<//>
    `)}
  </div>`
};
