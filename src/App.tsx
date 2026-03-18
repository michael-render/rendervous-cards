import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Security } from "@okta/okta-react";
import { toRelativeUrl } from "@okta/okta-auth-js";
import RequireAuth from "./components/RequireAuth";
import { isOktaConfigured, oktaAuth } from "./lib/okta";

const Index = lazy(() => import("./pages/Index"));
const CreateCard = lazy(() => import("./pages/CreateCard"));
const CardPreview = lazy(() => import("./pages/CardPreview"));
const Gallery = lazy(() => import("./pages/Gallery"));
const GalleryManage = lazy(() => import("./pages/GalleryManage"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const MissingOktaConfig = () => (
  <div className="min-h-screen flex items-center justify-center px-4">
    <div className="text-center max-w-xl">
      <h1 className="card-font-display text-2xl text-foreground mb-3">Okta is not configured</h1>
      <p className="card-font-body text-muted-foreground">
        Set <code>VITE_OKTA_ISSUER</code> and <code>VITE_OKTA_CLIENT_ID</code> to enable OAuth.
      </p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {!isOktaConfigured || !oktaAuth ? (
          <MissingOktaConfig />
        ) : (
          <Security
            oktaAuth={oktaAuth}
            restoreOriginalUri={async (_auth, originalUri) => {
              window.location.replace(
                toRelativeUrl(originalUri || "/", window.location.origin),
              );
            }}
          >
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center px-4">
                  <p className="card-font-display text-muted-foreground">Loading...</p>
                </div>
              }
            >
              <Routes>
                <Route path="/login/callback" element={<AuthCallback />} />
                <Route path="/" element={<RequireAuth><Index /></RequireAuth>} />
                <Route path="/create" element={<RequireAuth><CreateCard /></RequireAuth>} />
                <Route path="/preview" element={<RequireAuth><CardPreview /></RequireAuth>} />
                <Route path="/gallery" element={<RequireAuth><Gallery /></RequireAuth>} />
                <Route path="/gallery/manage" element={<RequireAuth><GalleryManage /></RequireAuth>} />
                <Route path="*" element={<RequireAuth><NotFound /></RequireAuth>} />
              </Routes>
            </Suspense>
          </Security>
        )}
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
