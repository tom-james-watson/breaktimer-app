import * as React from "react";
import { render } from "react-dom";
import { AppContainer } from "react-hot-loader";
import Main from "./components/Main";
import "./app.global.scss";

render(
  <AppContainer>
    <Main />
  </AppContainer>,
  document.getElementById("root")
);

/* eslint-disable @typescript-eslint/no-explicit-any */
if ((module as any).hot) {
  (module as any).hot.accept("./components/Main", () => {
    // eslint-disable-next-line global-require
    const NextMain = require("./components/Main").default;
    render(
      <AppContainer>
        <NextMain />
      </AppContainer>,
      document.getElementById("root")
    );
  });
}
