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
import AdaptiveCodingPortal from "./pages/AdaptiveCodingPortal";
import Schedule from "./pages/Schedule";
import FileLibrary from "./pages/FileLibrary";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "@/components/theme-provider";
import Friends from "./pages/Friends";
import CodingHub from "./pages/CodingHub";
import DirectChat from "./pages/DirectChat";
import LiveCollaborativeWorkspace from "./pages/LiveCollaborativeWorkspace";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token =
    localStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("access");

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* App is permanently locked into dark mode — no toggle, no system theme */}
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/groups" element={<StudyGroups />} />
                      <Route path="/friends" element={<Friends />} />
                      <Route path="/groups/:groupId" element={<GroupDetail />} />
                      <Route path="/collab/:groupId" element={<LiveCollaborativeWorkspace />} />
                      <Route path="/flashcards" element={<AIFlashcards />} />
                      <Route path="/quiz" element={<AIQuiz />} />
                      <Route path="/quiz/take/:quizId" element={<QuizTaking />} />
                      <Route path="/doubt-solver" element={<DoubtSolver />} />
                      <Route path="/coding-hub" element={<CodingHub />} />
                      <Route path="/code" element={<CodingPortal />} />
                      <Route path="/coding-portal" element={<AdaptiveCodingPortal />} />
                      <Route path="/schedule" element={<Schedule />} />
                      <Route path="/files" element={<FileLibrary />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/chat" element={<DirectChat />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;