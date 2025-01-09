import { html, render } from "./lib/preact.js";
import { App } from "./components/App.js";

export default () => {
  render(html`<${App} />`, document.querySelector('#root'));
};
