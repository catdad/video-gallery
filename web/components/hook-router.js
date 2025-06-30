import {
  html, effect,
  createContext, useContext, useSignal
} from "../lib/preact.js";

const RouterContext = createContext({});

const encode = (data) => encodeURIComponent(btoa(JSON.stringify(data)));
const decode = (str) => JSON.parse(atob(decodeURIComponent(str)));

const getHashData = (hash = window.location.hash) => {
  if (/#video/.test(hash)) {
    const data = hash.replace(/^#video\//, '');
    return { route: 'video', hash, data: decode(data)};
  }

  if (/#debug/.test(hash)) {
    return { route: 'debug', hash };
  }

  return { route: 'list', hash, data: {} };
};

export const withRouter = Component => ({ children, ...props }) => {
  const routeData = useSignal(getHashData());

  effect(() => {
    const { hash } = routeData.value;

    // only push to history if we are at a new url
    if (window.location.hash !== hash) {
      history.pushState({}, '', hash);
    }

    const handler = () => {
      routeData.value = getHashData();
    };

    window.addEventListener('popstate', handler);

    return () => {
      window.removeEventListener('popstate', handler);
    };
  });

  const goToList = () => {
    routeData.value = getHashData('');
  };

  const goToVideo = (video) => {
    routeData.value = getHashData(`#video/${encode({ video })}`);
  };

  const goToDebug = () => {
    routeData.value = getHashData('#debug');
  };

  const api = {
    getRouteData: () => routeData.value,
    goToVideo,
    goToList,
    goToDebug,
    back: () => {
      if (history.length > 1) {
        history.back()
      } else {
        goToList();
      }
    }
  };

  return html`
    <${RouterContext.Provider} value=${api}>
      <${Component} ...${props}>${children}<//>
    <//>
  `;
};

export const useRoute = () => useContext(RouterContext);
