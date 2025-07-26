import { html, batch, createContext, useContext, useEffect, useComputed, useSignal } from "../lib/preact.js";
import * as urls from './urls.js';
import { useSettings } from "./hook-settings.js";

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
  const response = useSignal([]);
  const names = useSignal([]);
  const loaded = useSignal(false);
  const timeout = useSignal();

  const { resizeWidth } = useSettings();

  const list = useComputed(() => {
    const resize = Number(resizeWidth.value) || 0;
    
    return response.value.map(d => ({
      ...d,
      thumbnail: urls.resource(d.thumbnail),
      // TODO don't resolve videos here, resolve at use-time
      video: d.file ?
        resize ?
          urls.resizedVideo(d.file, resize) :
          urls.video(d.file) :
        urls.resource(d.video),
      // TODO resize based on dynamic calculated value
      resizedVideo: urls.resizedVideo(d.file, 600),
      date: new Date(d.date || '1970-01-01'),
      // TODO use a formatting library for this
      duration: `${Math.round(d.duration)}s`
    })).sort((a, b) => b.date - a.date);
  });

  useEffect(function performSync() {
    const url = `${urls.list}${offset.peek() === null ? '' : `?date=${format(offset.peek())}`}`;

    fetch(url).then(async res => {
      if (!res.ok) {
        throw new Error(`GET list ${res.status}`);
      }

      const { list: listData, names: namesData } = await res.json();

      batch(() => {
        loaded.value = true;
        response.value = listData;
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
