import { html, useSignal, useState } from "../lib/preact.js";
import { useList, format } from "./hook-list.js";
import { useRoute } from "./hook-router.js";

const dateLabel = date => new Intl.DateTimeFormat(navigator.language, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric'
}).format(date);

const groupKeys = {
  hour: date => new Intl.DateTimeFormat(navigator.language, {
    weekday: 'long',
    month: 'short',
    year: 'numeric',
    day: 'numeric',
    hour: 'numeric',
  }).format(date),
  day: date => new Intl.DateTimeFormat(navigator.language, {
    weekday: 'long',
    month: 'short',
    year: 'numeric',
    day: 'numeric',
    year: 'numeric',
  }).format(date),
  none: () => 'All'
};

const Card = ({ thumbnail, video, duration, date }) => {
  const { goToVideo } = useRoute();

  return html`
    <div style=${{
      borderRadius: '0.5rem',
      border: `1px solid var(--accent)`,
      background: 'var(--bg-card)',
      display: 'inline-block',
      overflow: 'hidden'
    }} onClick=${() => {
      goToVideo(video);
    }}>
      <img src="${thumbnail}" loading="lazy" style="width: 100%" />
      <div style=${{
        padding: '0 0.5rem 0.5rem',
        fontSize: '0.8rem',
        display: 'flex',
        gap: '1rem',
        justifyContent: 'space-between'
      }}>
        <span>${dateLabel(date)}<//>
        <span>${duration}<//>
      </div>
    </div>
  `;
};

export const List = () => {
  const { list, setOffset } = useList(0);
  const group = 'hour';

  const groups = list.value.reduce((memo, item) => {
    const key = groupKeys[group](item.date);
    memo[key] = memo[key] || [];

    memo[key].push(item);

    return memo;
  }, {});

  return html`
    <div style="margin: 1rem auto; max-width: 1000px; padding: 0 1rem;">
      <div style="display: flex; margin: 1rem 0; flex-direction: row; justify-content: center; gap: 0.25rem;">
        <button onClick=${() => { setOffset(0); }}>${format(0)}</button>
        <button onClick=${() => { setOffset(-1); }}>${format(-1)}</button>
        <button onClick=${() => { setOffset(-2); }}>${format(-2)}</button>
        <button onClick=${() => { setOffset(-3); }}>${format(-3)}</button>
        <button onClick=${() => { setOffset(-4); }}>${format(-4)}</button>
        <button onClick=${() => { setOffset(-5); }}>${format(-5)}</button>
        <button onClick=${() => { setOffset(null); }}>all</button>
      </div>
      ${list.value.length === 0 ?
        html`<div style="text-align: center">There are no recordings in this view.</div>` :
        Object.entries(groups).map(([key, list]) => html`
          <div>
            <div style=${{
              textAlign: 'center',
              fontWeight: 'bold',
              margin: '2rem auto 1rem',
              position: 'relative'
            }}>
              <div style=${{
                position: 'absolute',
                top: '50%',
                borderTop: '1px solid white',
                opacity: 0.2,
                width: '100%',
                zIndex: 1
              }} />
              <span style=${{
                padding: '0.25rem 1rem',
                border: '1px solid var(--accent)',
                borderRadius: '1.5rem',
                background: 'var(--bg-card)',
                position: 'relative',
                zIndex: 2
              }}>${key}</span>
            </div>

            <div style=${{
              display: 'grid',
              gap: '0.75rem',
              gridTemplateColumns: `repeat(auto-fill, minmax(min(100%/2, max(120px, 100%/5)), 1fr))`,
            }}>
              ${list.map(item => html`<${Card} ...${item} />`)}
            </div>
          </div>
        `)
      }
    <//>
  `;
};
