import { useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import NotFound from "./pages/NotFound";

import bgMusic from "@/assets/music/background.mp3";

const queryClient = new QueryClient();

// This component manages global music
function MusicController() {
  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create audio once
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio(bgMusic);
      audio.loop = true;
      audio.volume = 1; // high volume
      audioRef.current = audio;
    }

    const startMusic = () => {
      if (location.pathname !== "/admin") {
        audioRef.current?.play().catch(() => {});
      }
    };

    // Browsers require user interaction before playing sound
    document.addEventListener("click", startMusic, { once: true });

    return () => {
      document.removeEventListener("click", startMusic);
    };
  }, [location.pathname]);

  // Control music on route change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (location.pathname === "/admin") {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, [location.pathname]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MusicController />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;