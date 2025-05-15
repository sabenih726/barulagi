import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "next-themes";

// Add Material Icons link to head
const iconLink = document.createElement("link");
iconLink.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
iconLink.rel = "stylesheet";
document.head.appendChild(iconLink);

// Add Roboto font link to head
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class">
    <App />
  </ThemeProvider>
);
