import { createRoot } from "react-dom/client";
import Main from "./components/Main";
import "./app.global.scss";

const container = document.getElementById("root");
if (!container) throw new Error("Root container not found");
const root = createRoot(container);
root.render(<Main />);

/* eslint-disable @typescript-eslint/no-explicit-any */
if ((module as any).hot) {
  (module as any).hot.accept("./components/Main", () => {
    const NextMain = require("./components/Main").default;
    root.render(<NextMain />);
  });
}
