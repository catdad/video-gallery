import { html, batch, createContext, useContext, useEffect, useSignal } from "../lib/preact.js";
import * as urls from './urls.js';

const formatDateFilter = date => [
  new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date),
  new Intl.DateTimeFormat('en', { month: '2-digit' }).format(date),
  new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date),
].join('-');

export const format = (offset) => {
  const today = new Date();
  today.setDate(today.getDate() + offset);

  return formatDateFilter(today);
};

const ListContext = createContext({
  list: [],
  setOffset: () => {}
});

export const withList = Component => ({ children, ...props }) => {
  const offset = useSignal(0);
  const list = useSignal([]);
  const names = useSignal([]);
  const loaded = useSignal(false);
  const timeout = useSignal();

  useEffect(function performSync() {
    const url = `${urls.list}${offset.peek() === null ? '' : `?date=${format(offset.peek())}`}`;

    fetch(url).then(async res => {
      if (!res.ok) {
        throw new Error(`GET list ${res.status}`);
      }

      const { list: data, names: namesData } = await res.json();

      batch(() => {
        loaded.value = true;

        list.value = data.map(d => ({
          ...d,
          thumbnail: urls.resource(d.thumbnail),
          video: urls.resource(d.video),
          date: new Date(d.date || '1970-01-01'),
          // TODO use a formatting library for this
          duration: `${Math.round(d.duration)}s`
        })).sort((a, b) => b.date - a.date);

        names.value = namesData.sort((a, b) => a.localeCompare(b));
      });
    }).catch(err => {
      // TODO handle this error
      console.error('failed to laod list', err);
    });

    clearTimeout(timeout.value);

    timeout.value = setTimeout(() => {
      performSync();
    }, 60 * 1000);

    return () => {
      clearTimeout(timeout.value);
    }
  }, [offset.value]);

  if (loaded.value === false) {
    return html`<div style=${{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>Loading...</div>`;
  }

  const data = {
    list, names, loaded, offset
  };

  return html`
    <${ListContext.Provider} value=${data}>
      <${Component} ...${props}>${children}<//>
    <//>
  `;
};

export const useList = () => {
  const { list, names, loaded, offset } = useContext(ListContext);

  return {
    list,
    names,
    get offset() {
      return offset.value;
    },
    setOffset: offsetDays => {
      if (offset.peek() !== offsetDays) {
        batch(() => {
          loaded.value = false;
          offset.value = offsetDays;
        });
      }
    }
  };
};
