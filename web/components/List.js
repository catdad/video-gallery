import { html } from "../lib/preact.js";
import { useList } from "./hook-list.js";
import { routes, useRoute } from "./hook-router.js";

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
  const { navigate } = useRoute();

  return html`
    <div style=${{
      width: `200px`,
      borderRadius: '0.5rem',
      border: `1px solid gray`,
      display: 'inline-block',
      overflow: 'hidden'
    }} onClick=${() => {
      navigate(routes.video, { video });
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
  const { list, refreshed } = useList();
  const group = 'hour';

  const groups = list.value.reduce((memo, item) => {
    const key = groupKeys[group](item.date);
    memo[key] = memo[key] || [];

    memo[key].push(item);

    return memo;
  }, {});

  return html`
    <div>
      <div>last refreshed: ${dateLabel(refreshed.value)}</div>

      ${Object.entries(groups).map(([key, list]) => {
        return html`
          <div>
            <div style="text-align: center; font-weight: bold">----- ${key} -----</div>

            <div style=${{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              margin: '1rem auto',
              gap: '1rem'
            }}>
              ${list.map(item => html`<${Card} ...${item} />`)}
            </div>
          </div>
        `;
      })}
    <//>
  `;
};
