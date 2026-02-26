import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, Clock, BookOpen, Trophy, Calendar, Sparkles, TrendingUp, Activity, ArrowRight } from "lucide-react";
import api, { userAPI } from "@/services/api"; 

export default function Dashboard() {
  const [stats, setStats] = useState({
    username: "Student",
    active_groups: 0,
    study_hours: 0,
    quizzes_taken: 0,
    achievement_points: 0
  });
  
  const [realGroups, setRealGroups] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const statsRes = await userAPI.getDashboardStats();
        const statsData = statsRes.data || {};
        const profileRes = await userAPI.getProfile();
        const profileData = profileRes.data || {};

        const groupsRes = await api.get('/groups/');
        const fetchedGroups = groupsRes.data.results || groupsRes.data || [];

        // 👇 THE FIX: Trust the backend's math, stop adding things together!
        const totalGroups = statsData.active_groups || 0;

        if (totalGroups === 0) {
            setRealGroups([]);
        } else {
            setRealGroups(fetchedGroups.slice(0, 4));
        }

        setStats({
            username: profileData.username || "Student",
            active_groups: totalGroups, 
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

  const getMotivationalQuote = (points: number) => {
    if (points < 20) return "You're just getting started. Every big journey begins with a single step!";
    if (points < 50) return "Building momentum! Keep pushing, you are doing great.";
    if (points < 100) return "You're on a great learning streak. Keep up the momentum and crush your goals!";
    if (points < 200) return "You are an absolute machine! Your dedication is really paying off.";
    if (points < 350) return "Unstoppable! You're making incredible progress this week.";
    if (points < 500) return "Outstanding work. Your study habits are elite level right now.";
    if (points < 800) return "Master class! You are dominating your study goals.";
    return "Legendary status! You are in the top tier of learners.";
  };

  const cardClass = "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all";

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full p-6 md:p-8 pb-10">
      
      {/* 🚀 HERO SECTION */}
      <div className="animate-in slide-in-from-top-4 fade-in duration-700 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
            <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
                Welcome back, {loading ? "..." : stats.username}! <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse"/>
            </h1>
            <p className="text-blue-100 mt-2 text-lg max-w-xl">
                {getMotivationalQuote(stats.achievement_points)}
            </p>
            </div>
        </div>
      </div>

      {/* 📊 STATS GRID */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className={`animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100 group ${cardClass}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Groups</CardTitle>
            <div className="h-10 w-10 rounded-full bg-blue-100/80 dark:bg-blue-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-800 dark:text-white">
              {loading ? "-" : stats.active_groups}
            </div>
            <p className="text-sm text-emerald-500 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3"/> Keep networking!
            </p>
          </CardContent>
        </Card>

        <Card className={`animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200 group ${cardClass}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Study Hours</CardTitle>
            <div className="h-10 w-10 rounded-full bg-indigo-100/80 dark:bg-indigo-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-800 dark:text-white">
                {loading ? "-" : stats.study_hours}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Total time invested</p>
          </CardContent>
        </Card>

        <Card className={`animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300 group ${cardClass}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quizzes Passed</CardTitle>
            <div className="h-10 w-10 rounded-full bg-purple-100/80 dark:bg-purple-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-800 dark:text-white">
                {loading ? "-" : stats.quizzes_taken}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Knowledge verified</p>
          </CardContent>
        </Card>

        <Card className={`animate-in slide-in-from-bottom-8 fade-in duration-700 delay-500 group relative overflow-hidden ${cardClass}`}>
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-400 opacity-20 rounded-bl-full"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Points</CardTitle>
            <div className="h-10 w-10 rounded-full bg-yellow-100/80 dark:bg-yellow-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-800 dark:text-white">
                {loading ? "-" : stats.achievement_points}
            </div>
            <p className="text-sm font-bold text-yellow-600 mt-1">Rank: Scholar</p>
          </CardContent>
        </Card>
      </div>

      {/* 📈 BOTTOM SECTION */}
      <div className="grid gap-6 md:grid-cols-12">
        
        <Card className={`md:col-span-7 animate-in slide-in-from-bottom-10 fade-in duration-700 delay-700 ${cardClass}`}>
          <CardHeader className="border-b border-slate-100 dark:border-slate-700/50 pb-4">
              <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-white">
                      <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400"/> My Study Groups
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800" asChild>
                      <Link to="/groups">Explore All</Link>
                  </Button>
              </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
              {realGroups.length === 0 ? (
                  <p className="text-center text-slate-500 py-4 font-medium">You haven't joined any groups yet!</p>
              ) : (
                  realGroups.map((group, idx) => {
                      const colors = ["bg-blue-500", "bg-indigo-500", "bg-purple-500", "bg-emerald-500"];
                      const color = colors[idx % colors.length];
                      const membersCount = group.members ? group.members.length : 0;
                      const capacity = group.capacity || 10;
                      
                      return (
                          <div key={group.id} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                  <span className="font-bold text-slate-700 dark:text-slate-300">{group.name}</span>
                                  <span className="text-slate-500 dark:text-slate-400 font-medium">{membersCount} / {capacity} Members</span>
                              </div>
                              <Progress value={(membersCount / capacity) * 100} className={`h-2.5 ${color}`} />
                          </div>
                      );
                  })
              )}
          </CardContent>
        </Card>

        <div className="md:col-span-5 space-y-6">
            <Card className={`animate-in slide-in-from-bottom-10 fade-in duration-700 delay-1000 ${cardClass}`}>
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-700/50">
                <CardTitle className="text-slate-800 dark:text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="space-y-4">
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                    <div className="h-2 w-2 mt-2 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                    <div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">You logged in to <strong className="text-slate-900 dark:text-white">Virtual Study Space</strong></p>
                        <p className="text-xs text-slate-500 mt-0.5">Just now</p>
                    </div>
                </div>
                </div>
            </CardContent>
            </Card>

            <Card className="animate-in slide-in-from-bottom-10 fade-in duration-700 delay-1000 border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white hover:shadow-2xl transition-all">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mb-4 shadow-inner">
                    <Calendar className="h-6 w-6 text-blue-300" />
                </div>
                <h3 className="text-lg font-bold mb-1">Upcoming Sessions</h3>
                <p className="text-sm text-slate-400 mb-5">No study sessions scheduled for today.</p>
                <Button className="w-full bg-blue-600 hover:bg-blue-500 border-0 shadow-lg group font-bold tracking-wide" asChild>
                    <Link to="/schedule">
                        Schedule Now <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"/>
                    </Link>
                </Button>
            </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}