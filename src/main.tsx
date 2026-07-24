import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeNativeFeatures, isNativePlatform } from "./lib/capacitorPlugins";
import { registerAppPWA } from "./lib/registerPWA";

// Initialize native features if running on mobile
if (isNativePlatform()) {
  initializeNativeFeatures();
}

// Register the PWA service worker in production web builds (guarded against Lovable preview/dev/iframe)
if (!isNativePlatform()) {
  registerAppPWA();
}

createRoot(document.getElementById("root")!).render(<App />);


