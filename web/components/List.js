import { html, useEffect, useRef } from "../lib/preact.js";
import { usePersistedSignal } from "../lib/persisted-signal.js";
import { useList, withList, format } from "./hook-list.js";
import { useRoute } from "./hook-router.js";
import { useTheme, styled, opacity } from "./hook-theme.js";
import { Button, LinkButton, Toggle } from './Buttons.js';
import { PrimaryLabel, TertiaryLabel } from "./Label.js";

const humanize = (offset) => {
  const date = new Date(format(offset));

  const month = new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' }).format(date);
  const day = new Intl.DateTimeFormat('en', { day: 'numeric', timeZone: 'UTC' }).format(date);

  return html`<span>${month} ${day}</span>`;
};

const dateLabel = date => new Intl.DateTimeFormat(navigator.language, {
  // weekday: 'short',
  // month: 'short',
  // day: 'numeric',
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

const Image = styled('img', {
  width: '100%',
  borderRadius: '0.5rem 0.5rem 0.25rem 0.25rem'
});

const Card = ({ thumbnail, video, duration, date }) => {
  const { goToVideo } = useRoute();

  return html`
    <div style=${{
      display: 'inline-block',
      position: 'relative',
      fontSize: 0,
    }} onClick=${() => {
      goToVideo(video);
    }}>
      <${Image} src="${thumbnail}" loading="lazy" />
      <div style=${{
        display: 'flex',
        gap: '1rem',
        justifyContent: 'space-between',
        marginTop: '0.25rem',
      }}>
        <${TertiaryLabel}>${dateLabel(date)}<//>
        <${PrimaryLabel}>${duration}<//>
      </div>
    </div>
  `;
};

const Section = ({ title }) => {
  const color = useTheme();

  return html`<div style=${{
    textAlign: 'center',
    margin: '2rem auto 1rem',
    position: 'relative'
  }}>
    <div style=${{
      position: 'absolute',
      top: 'calc(50% + 1px)',
      height: '1px',
      background: color.secondary,
      width: '100%',
      zIndex: 1
    }} />
    <span style=${{
      padding: '0.25rem 0.5rem',
      fontSize: '0.75rem',
      borderRadius: '1rem',
      background: color.secondary,
      color: color.textOnSecondary,
      position: 'relative',
      zIndex: 2
    }}>${title}</span>
  </div>`;
};

export const List = withList(() => {
  const color = useTheme();
  const { goToSettings } = useRoute();
  const cameraFilter = usePersistedSignal('camera-filter', '*');
  const { list, names, offset, setOffset } = useList();
  const group = 'hour';

  const listRef = useRef();
  const filtersRef = useRef();

  useEffect(() => {
    const onResize = () => {
      if (listRef.current && filtersRef.current) {
        listRef.current.style.setProperty('--controls', `${filtersRef.current.getBoundingClientRect().bottom}px`);
      }
    };

    onResize();

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [listRef.current, filtersRef.current]);

  const groups = list.value.filter(item => {
    if (cameraFilter.value === '*') {
      return true;
    }

    return cameraFilter.value === item.cameraName;
  }).reduce((memo, item) => {
    const key = groupKeys[group](item.date);
    memo[key] = memo[key] || [];

    memo[key].push(item);

    return memo;
  }, {});

  return html`
    <style>
      .list {
        --controls: 0;
        --footer: 2rem;

        display: flex;
        flex-direction: column;
        min-height: 100dvh;
        max-width: 1000px;
        margin: 0 auto;
      }

      .list .filters {
        position: fixed;
        z-index: 3;
        top: -1rem;
        left: 0;
        right: 0;
        padding: 2rem 1rem 1rem;

        display: flex;
        align-items: center;
        justify-content: center;

        --opacity: 0.9;
        background: ${opacity(color.background, 'var(--opacity)')};
        box-shadow: 0 0 5px 6px ${opacity(color.background, 'var(--opacity)')};
        backdrop-filter: blur(2px);
      }

      .list .content {
        padding: var(--controls, 0) 1rem 1rem;
        flex-grow: 1;
      }

      .list .footer {
        max-width: 1000px;
        height: var(--footer);
        background: ${opacity(color.primary, 0.5)};
        display: flex;
        align-items: center;
        justify-content: center;

        border-radius: 5px 5px 0 0;
        font-size: 0.85rem;
      }

      @media screen and (orientation: landscape) {
        .list .filters {
          flex-direction: row;
          gap: 0.75rem;
        }
      }

      @media screen and (orientation: portrait) {
        .list .filters {
          flex-direction: column;
          gap: 1rem;
        }
      }
    </style>
    <div className="list" ref=${listRef}>
      <div className="filters" ref=${filtersRef}>
        <${Toggle}
          style="margin-top: 1rem;"
          options=${[
            { value: 0, label: humanize(0) },
            { value: -1, label: humanize(-1) },
            { value: -2, label: humanize(-2) },
            { value: -3, label: humanize(-3) },
            { value: -4, label: humanize(-4) },
            { value: -5, label: humanize(-5) },
            { value: null, label: 'all' },
          ]}
          value=${offset}
          onChange=${(value) => setOffset(value)}
        />
        ${names.value.length ? html`<${Toggle}
          options=${
            names.value
              .map(n => ({ value: n }))
              .concat([{ value: '*', label: 'all' }])
          }
          value=${cameraFilter.value}
          onChange=${(value) => { cameraFilter.value = value; }}
          label="Camera"
        />`: ''}
        ${!names.value.includes(cameraFilter.value) && cameraFilter.value !== '*'
          ? html`<${Button} onClick=${() => { cameraFilter.value = '*'; }} >reset camera filters<//>` : ''}
      </div>
      <div className="content">
        ${Object.keys(groups).length === 0 ?
          html`<div style="text-align: center; margin: 1rem auto; flex-grow: 1;">There are no clips in this view.</div>` :
          Object.entries(groups).map(([key, list]) => html`
            <div key=${key}>
              <${Section} title=${key} />

              <div style=${{
                display: 'grid',
                gap: '0.75rem',
                gridTemplateColumns: `repeat(auto-fill, minmax(min(100%/2, max(120px, 100%/5)), 1fr))`,
              }}>
                ${list.map(item => html`<${Card} key=${item.video} ...${item} />`)}
              </div>
            </div>
          `)
        }
      </div>
      <div className="footer">
        created by catdad${`\u00A0•\u00A0`}
        <${LinkButton} onClick=${(ev) => {
          ev.preventDefault();
          goToSettings();
        }}>settings<//>
      </div>
    <//>
  `;
});
