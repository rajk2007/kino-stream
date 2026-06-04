import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { Toaster } from "sonner";
import { AppProvider } from "./lib/store";

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: { queryClient },
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <RouterProvider router={router} />
        <Toaster 
          theme="dark" 
          position="top-center" 
          toastOptions={{ 
            style: { 
              background: "rgba(20,20,20,0.95)", 
              color: "white", 
              border: "1px solid rgba(255,255,255,0.1)", 
              backdropFilter: "blur(20px)" 
            } 
          }} 
        />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
