import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; 
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import StudyGroups from "./pages/StudyGroups";
import GroupDetail from "./pages/GroupDetail";
import AIFlashcards from "./pages/AIFlashcards";
import AIQuiz from "./pages/AIQuiz";
import QuizTaking from "./pages/QuizTaking";
import DoubtSolver from "./pages/DoubtSolver";
import CodingPortal from "./components/CodingPortal"; 
import AdaptiveCodingPortal from "./pages/AdaptiveCodingPortal"; // 👈 1. ADDED OUR NEW IMPORT HERE!
// 🗑️ Removed AITutor import!
import Schedule from "./pages/Schedule";
import FileLibrary from "./pages/FileLibrary";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "@/components/theme-provider"
import Friends from "./pages/Friends";

const queryClient = new QueryClient();

// --- SECURITY GUARD COMPONENT ---
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // 👇 Upgraded to check all common token names so you never get locked out
  const token = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('access'); 
  
  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* 👇 WRAPPED THE ENTIRE APP IN THE THEME PROVIDER 👇 */}
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* 1. PUBLIC ROUTE: Login/Signup (Anyone can see this) */}
            <Route path="/auth" element={<Auth />} />
            
            {/* 2. PROTECTED ROUTES: Only logged-in users can enter */}
            <Route path="/*" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/groups" element={<StudyGroups />} />
                    <Route path="/friends" element={<Friends />} />
                    <Route path="/groups/:groupId" element={<GroupDetail />} />
                    <Route path="/flashcards" element={<AIFlashcards />} />
                    <Route path="/quiz" element={<AIQuiz />} />
                    <Route path="/quiz/take/:quizId" element={<QuizTaking />} />
                    <Route path="/doubt-solver" element={<DoubtSolver />} />
                    
                    {/* Your old standard coding portal */}
                    <Route path="/code" element={<CodingPortal />} />

                    {/* 👇 2. ADDED THE NEW ADAPTIVE PORTAL ROUTE HERE 👇 */}
                    <Route path="/coding-portal" element={<AdaptiveCodingPortal />} />

                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="/files" element={<FileLibrary />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/settings" element={<Settings />} />
                    {/* Catch-all for 404s inside the dashboard */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;