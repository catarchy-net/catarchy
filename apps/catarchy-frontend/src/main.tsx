import "@/styles/_root.css";

import renderApp from "./app";

window.addEventListener("unhandledrejection", (e) => {
  if (e.reason?.name === "ChunkLoadError") {
    window.location.reload();
  }
});

const rootElement = document.getElementById("root")!;

renderApp(rootElement);
