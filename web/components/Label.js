import { styled } from "./theme.js";

const Label = styled('span', {
  fontSize: '0.75rem',
  borderRadius: '0.25rem',
  padding: `${0.25/2}rem 0.25rem`
});

export const PrimaryLabel = styled(Label, ({ color }) => ({
  background: color.primary,
  color: color.textOnPrimary
}));

export const SecondaryLabel = styled(Label, ({ color }) => ({
  background: color.secondary,
  color: color.textOnSecondary
}));

export const TertiaryLabel = styled(Label, ({ color }) => ({
  background: color.tertiary,
  color: color.textOnTertiary,
}));
