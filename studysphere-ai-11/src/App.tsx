import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // <--- Added Navigate
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import StudyGroups from "./pages/StudyGroups";
import GroupDetail from "./pages/GroupDetail";
import AIFlashcards from "./pages/AIFlashcards";
import AIQuiz from "./pages/AIQuiz";
import QuizTaking from "./pages/QuizTaking";
import DoubtSolver from "./pages/DoubtSolver";
import AITutor from "./pages/AITutor";
import Schedule from "./pages/Schedule";
import FileLibrary from "./pages/FileLibrary";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// --- NEW SECURITY GUARD COMPONENT ---
// This checks if the user has a token. 
// If YES: Renders the Dashboard.
// If NO: Kicks them back to /auth.
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken'); // Check our specific key
  
  if (!token) {
    // Redirect to login if no token found
    return <Navigate to="/auth" replace />;
  }

  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
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
                  <Route path="/groups/:groupId" element={<GroupDetail />} />
                  <Route path="/flashcards" element={<AIFlashcards />} />
                  <Route path="/quiz" element={<AIQuiz />} />
                  <Route path="/quiz/take/:quizId" element={<QuizTaking />} />
                  <Route path="/doubt-solver" element={<DoubtSolver />} />
                  <Route path="/ai-tutor" element={<AITutor />} />
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
  </QueryClientProvider>
);

export default App;