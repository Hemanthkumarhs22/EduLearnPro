import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./providers/AuthProvider";

const queryClient = new QueryClient();

// Ensure theme is applied immediately
if (typeof document !== "undefined") {
  document.documentElement.setAttribute("data-theme", "fantasy");
}

// Ensure theme is applied
function ThemeInitializer() {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "fantasy");
    // Force a reflow to ensure CSS is applied
    document.documentElement.offsetHeight;
  }, []);
  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeInitializer />
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
