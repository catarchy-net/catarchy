import "@/styles/_root.css";

import renderApp from "./app";

const rootElement = document.getElementById("root")!;

const windowLoaded = new Promise<void>((resolve) => {
  if (document.readyState === "complete") resolve();
  else window.addEventListener("load", () => resolve(), { once: true });
});

Promise.all([document.fonts.ready, windowLoaded]).then(() => {
  return renderApp(rootElement);
});
