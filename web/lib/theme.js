export function hexToRgb(str) {
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

export const pickContrast = (target, candidate1, candidate2) => {
  const rgb = hexToRgb(target);
  const rgb1 = hexToRgb(candidate1);
  const rgb2 = hexToRgb(candidate2);

  const distanceTo1 = distance(rgb, rgb1);
  const distanceTo2 = distance(rgb, rgb2);

  return distanceTo1 > distanceTo2 ? candidate1 : candidate2;
};

export const defaultTheme = 'home assistant dark';

export const themes = {
  'dark purple': {
    foreground: '#eceff1',
    background: '#06010e',
    primary: '#633c73',
    secondary: '#2a2532',
    tertiary: '#2a2532'
  },
  'light purple': {
    foreground: '#111111',
    background: '#eceff1',
    primary: '#cec3db',
    secondary: '#cec3db',
    tertiary: '#cec3db'
  },
  'cmyk dark': {
    foreground: '#eceff1', // w
    background: '#06010e', // k, indigo based
    primary: '#D53C9F', // m
    secondary: '#FCE54D', // y
    tertiary: '#6BC9FF', // c
  },
  'home assistant dark': {
    foreground: '#eceff1',
    background: '#111111', // match home assistant
    primary: '#4b484f',
    secondary: '#4b484f',
    tertiary: '#4b484f'
  },
};
