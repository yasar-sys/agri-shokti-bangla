import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeNativeFeatures, isNativePlatform } from "./lib/capacitorPlugins";

// Initialize native features if running on mobile
if (isNativePlatform()) {
  initializeNativeFeatures();
}

createRoot(document.getElementById("root")!).render(<App />);
