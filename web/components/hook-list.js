import { html, batch, createContext, useContext, useEffect, useSignal } from "../lib/preact.js";
import * as urls from './urls.js';

const ListContext = createContext({
  refreshed: new Date(),
  list: []
});

export const withList = Component => ({ children, ...props }) => {
  const refreshed = useSignal(new Date());
  const list = useSignal([]);
  const loaded = useSignal(false);

  useEffect(() => {
    fetch(urls.list).then(async res => {
      if (!res.ok) {
        throw new Error(`GET list ${res.status}`);
      }

      const data = await res.json();

      batch(() => {
        refreshed.value = new Date();
        loaded.value = true;

        list.value = data.map(d => ({
          ...d,
          thumbnail: urls.resource(d.thumbnail),
          video:urls.resource(d.video),
          date: new Date(d.date || '1970-01-01'),
          // TODO use a formatting library for this
          duration: `${Math.round(d.duration)}s`
        })).sort((a, b) => b.date - a.date);
      });
    }).catch(err => {
      // TODO handle this error
      console.error('failed to laod list', err);
    });
  }, []);

  // TODO show loading spinner until we have data

  const data = {
    refreshed, list
  };

  return html`
    <${ListContext.Provider} value=${data}>
      <${Component} ...${props}>${children}<//>
    <//>
  `;
};

export const useList = () => useContext(ListContext);
