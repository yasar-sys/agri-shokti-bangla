import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeNativeFeatures, isNativePlatform } from "./lib/capacitorPlugins";
import { registerSW } from "virtual:pwa-register";

// Initialize native features if running on mobile
if (isNativePlatform()) {
  initializeNativeFeatures();
}

// Register the PWA service worker in web builds (production)
if (!isNativePlatform() && "serviceWorker" in navigator) {
  registerSW({
    immediate: true,
  });
}

createRoot(document.getElementById("root")!).render(<App />);

