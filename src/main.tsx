import "@/i18n.ts";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import App from "./App";
import "./styles/global.css";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <TooltipProvider delayDuration={0}>
                <BrowserRouter>
                    <App/>
                    {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
                </BrowserRouter>
            </TooltipProvider>
        </QueryClientProvider>
    </StrictMode>
);
