import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, BookOpen, Trophy, Calendar } from "lucide-react";
import { userAPI } from "@/services/api"; // <--- Import the API

export default function Dashboard() {
  const [stats, setStats] = useState({
    username: "Student",
    joined_groups: 0,
    created_groups: 0,
    study_hours: 0,
    points: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        console.log("📡 Fetching Dashboard Stats...");
        const data = await userAPI.getDashboardStats();
        console.log("✅ Stats received:", data);
        setStats(data);
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
      {/* 1. Welcome Section */}
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

      {/* 2. Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Active Groups Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "-" : stats.joined_groups + stats.created_groups}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.created_groups} created, {stats.joined_groups} joined
            </p>
          </CardContent>
        </Card>

        {/* Study Hours Card (Placeholder for now) */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Hours</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.study_hours}</div>
            <p className="text-xs text-muted-foreground">
              +0 this week (Timer coming soon!)
            </p>
          </CardContent>
        </Card>

        {/* Quizzes Card (Placeholder) */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Quizzes</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Start a quiz to see stats
            </p>
          </CardContent>
        </Card>

        {/* Gamification Points Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievement Points</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.points}</div>
            <p className="text-xs text-muted-foreground">
              Rank: Beginner
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Recent Activity (Placeholder until we build more features) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
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
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mb-2 opacity-20" />
                <p>No sessions scheduled</p>
             </div>
             <p className="text-xs text-center text-muted-foreground">
                Go to "Schedule" to create one.
             </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}