import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, BookOpen, Trophy, Calendar } from "lucide-react";
import { userAPI } from "@/services/api"; 

export default function Dashboard() {
  const [stats, setStats] = useState({
    username: "Student",
    active_groups: 0,
    study_hours: 0,
    quizzes_taken: 0,
    achievement_points: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        console.log("📡 Fetching Dashboard Stats...");
        
        // 1. Get Stats from API
        const statsRes = await userAPI.getDashboardStats();
        const statsData = statsRes.data || {};

        // 2. Get Profile from API
        const profileRes = await userAPI.getProfile();
        const profileData = profileRes.data || {};

        // 3. CALCULATE TOTAL GROUPS (Sum of all group types to be safe)
        const totalGroups = (statsData.active_groups || 0) + 
                           (statsData.created_groups || 0) + 
                           (statsData.joined_groups || 0);

        // 4. Update State
        setStats({
            username: profileData.username || "Student",
            active_groups: totalGroups,
            // 👇 Reads Study Hours & Quizzes from API now
            study_hours: statsData.study_hours || 0,     
            quizzes_taken: statsData.quizzes_taken || 0, 
            achievement_points: statsData.achievement_points || 0
        });

      } catch (error) {
        console.error("❌ Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {loading ? "..." : stats.username}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here is your study overview for today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Active Groups */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "-" : stats.active_groups}
            </div>
            <p className="text-xs text-muted-foreground">created or joined</p>
          </CardContent>
        </Card>

        {/* Study Hours */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Hours</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {loading ? "-" : stats.study_hours}
            </div>
            <p className="text-xs text-muted-foreground">+0 this week</p>
          </CardContent>
        </Card>

        {/* Completed Quizzes */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Quizzes</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {loading ? "-" : stats.quizzes_taken}
            </div>
            <p className="text-xs text-muted-foreground">Start a quiz to see stats</p>
          </CardContent>
        </Card>

        {/* Achievement Points */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievement Points</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {loading ? "-" : stats.achievement_points}
            </div>
            <p className="text-xs text-muted-foreground">Rank: Beginner</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <p className="text-sm">You joined <strong>Python Masters</strong></p>
                <span className="ml-auto text-xs text-muted-foreground">Today</span>
              </div>
              <p className="text-sm text-muted-foreground text-center py-4">
                More activity will appear here as you use the app!
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader><CardTitle>Upcoming Sessions</CardTitle></CardHeader>
          <CardContent>
             <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mb-2 opacity-20" />
                <p>No sessions scheduled</p>
             </div>
             <p className="text-xs text-center text-muted-foreground">Go to "Schedule" to create one.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}