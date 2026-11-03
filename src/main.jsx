import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Toaster } from "@/components/ui/sonner";
import { AdminProvider } from "@/lib/AdminContext";
import { RouterProvider } from "@/lib/router";
import App from "@/App";
import "@/index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AdminProvider>
      <RouterProvider>
        <App />
        <Toaster />
      </RouterProvider>
    </AdminProvider>
  </StrictMode>,
);
