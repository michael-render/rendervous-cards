import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import Index from "./pages/Index";
import CreateCard from "./pages/CreateCard";
import CardPreview from "./pages/CardPreview";
import Gallery from "./pages/Gallery";
import GalleryManage from "./pages/GalleryManage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <nav className="fixed top-4 right-4 z-50">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-1.5 rounded-lg bg-card/80 backdrop-blur px-3 py-1.5 font-display text-sm font-semibold text-muted-foreground hover:text-foreground border border-card-border/50 shadow-sm transition-colors"
          >
            <LayoutGrid className="w-4 h-4" /> Gallery
          </Link>
        </nav>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/create" element={<CreateCard />} />
          <Route path="/preview" element={<CardPreview />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/gallery/manage" element={<GalleryManage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
