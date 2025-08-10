export const normalizeSeconds = seconds => ({
  days: Math.trunc(seconds / 86400),
  hours: (Math.trunc(seconds / 3600) % 24),
  minutes: (Math.trunc(seconds / 60) % 60),
  seconds: (Math.trunc(seconds) % 60),
});

export const formatDuration = seconds => {
  const { days: d, hours: h, minutes: m, seconds: s } = normalizeSeconds(seconds);

  const dd = d === 0 ? '' : `${d}d `;
  const hh = h === 0 ? '' : `${h}h `;
  const mm = m === 0 ? '' : `${m}m `;
  const ss = `${s}s`;

  return `${dd}${hh}${mm}${ss}`;
};

export const formatTime = date => new Intl.DateTimeFormat(navigator.language, {
  // weekday: 'short',
  // month: 'short',
  // day: 'numeric',
  hour: 'numeric',
  minute: 'numeric'
}).format(date);
