import { createRoot } from "react-dom/client";
import Main from "./components/main";

const container = document.getElementById("root");
if (!container) throw new Error("Root container not found");
const root = createRoot(container);
root.render(<Main />);
