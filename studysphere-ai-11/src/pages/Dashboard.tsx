import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Clock,
  BookOpen,
  Trophy,
  Calendar,
  
  TrendingUp,
  Activity,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import api, { userAPI } from "@/services/api";

// Dummy shape data for the Study Hours sparkline (the BIG number stays = stats.study_hours)
const STUDY_TREND = [
  { v: 2 }, { v: 4 }, { v: 3 }, { v: 6 },
  { v: 5 }, { v: 8 }, { v: 7 }, { v: 10 },
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    username: "Student",
    active_groups: 0,
    study_hours: 0,
    quizzes_taken: 0,
    achievement_points: 0,
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

        const groupsRes = await api.get("/groups/");
        const fetchedGroups = groupsRes.data.results || groupsRes.data || [];

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
          achievement_points: statsData.achievement_points || 0,
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

  // Premium card base — uses theme tokens + glass + subtle inner ring
  const cardBase =
    "relative overflow-hidden border-border/60 bg-card/40 backdrop-blur-md " +
    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] hover:border-border " +
    "transition-all duration-300";

  return (
    <div
      data-testid="dashboard-page"
      className="relative space-y-8 max-w-7xl mx-auto w-full p-6 md:p-8 pb-10"
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-20 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-20 right-0 h-[320px] w-[320px] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      {/* HERO */}
      <div
        data-testid="dashboard-hero"
        className="animate-in slide-in-from-bottom-4 fade-in duration-500 relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md p-8"
      >
        {/* faint grid */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 backdrop-blur px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              Live session ready
            </div>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
                {loading ? "…" : stats.username}
              </span>
              
            </h1>
            <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-2xl">
              {getMotivationalQuote(stats.achievement_points)}
            </p>
          </div>

          <Button
            data-testid="hero-cta-continue"
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_25px_rgba(59,130,246,0.45)] hover:shadow-[0_0_35px_rgba(59,130,246,0.65)] transition-all duration-300 group h-11 px-5 rounded-xl"
          >
            <Link to="/groups">
              Continue Learning
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {/* Active Groups */}
        <Card
          data-testid="stat-active-groups"
          className={`animate-in slide-in-from-bottom-6 fade-in duration-500 delay-100 ${cardBase}`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Active Groups
            </CardTitle>
            <div className="h-9 w-9 rounded-lg border border-border/60 bg-background/40 backdrop-blur flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-5xl font-semibold tracking-tight text-foreground tabular-nums">
              {loading ? "—" : stats.active_groups}
            </div>
            <p className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-400/90 font-medium">
              <TrendingUp className="h-3 w-3" /> Keep networking
            </p>
          </CardContent>
        </Card>

        {/* Study Hours — with sparkline */}
        <Card
          data-testid="stat-study-hours"
          className={`animate-in slide-in-from-bottom-6 fade-in duration-500 delay-150 ${cardBase}`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Study Hours
            </CardTitle>
            <div className="h-9 w-9 rounded-lg border border-border/60 bg-background/40 backdrop-blur flex items-center justify-center">
              <Clock className="h-4 w-4 text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-0">
            <div className="text-5xl font-semibold tracking-tight text-foreground tabular-nums">
              {loading ? "—" : stats.study_hours}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Total time invested</p>

            <div className="-mx-6 -mb-4 h-16 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={STUDY_TREND} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="studyArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="hsl(217 91% 60%)"
                    strokeWidth={2}
                    fill="url(#studyArea)"
                    isAnimationActive
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quizzes Passed */}
        <Card
          data-testid="stat-quizzes-passed"
          className={`animate-in slide-in-from-bottom-6 fade-in duration-500 delay-200 ${cardBase}`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Quizzes Passed
            </CardTitle>
            <div className="h-9 w-9 rounded-lg border border-border/60 bg-background/40 backdrop-blur flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-5xl font-semibold tracking-tight text-foreground tabular-nums">
              {loading ? "—" : stats.quizzes_taken}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Knowledge verified</p>
          </CardContent>
        </Card>

        {/* Achievement Points */}
        <Card
          data-testid="stat-achievement-points"
          className={`animate-in slide-in-from-bottom-6 fade-in duration-500 delay-300 ${cardBase}`}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Points
            </CardTitle>
            <div className="h-9 w-9 rounded-lg border border-border/60 bg-background/40 backdrop-blur flex items-center justify-center">
              <Trophy className="h-4 w-4 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-5xl font-semibold tracking-tight text-foreground tabular-nums">
              {loading ? "—" : stats.achievement_points}
            </div>
            <p className="mt-2 text-xs font-medium text-amber-400/90">Rank · Scholar</p>
          </CardContent>
        </Card>
      </div>

      {/* BOTTOM GRID */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* My Study Groups */}
        <Card
          data-testid="study-groups-card"
          className={`md:col-span-7 animate-in slide-in-from-bottom-8 fade-in duration-500 delay-300 ${cardBase}`}
        >
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-foreground text-base font-medium">
                <Activity className="h-4 w-4 text-primary" />
                My Study Groups
              </CardTitle>
              <Button
                data-testid="explore-groups-btn"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-muted/40 group"
                asChild
              >
                <Link to="/groups">
                  Explore all
                  <ArrowUpRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {realGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="h-12 w-12 rounded-xl border border-dashed border-border flex items-center justify-center mb-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  You haven't joined any groups yet.
                </p>
                <Button
                  data-testid="empty-state-find-group"
                  asChild
                  variant="link"
                  className="text-primary mt-1"
                >
                  <Link to="/groups">Find your first group →</Link>
                </Button>
              </div>
            ) : (
              realGroups.map((group, idx) => {
                const accents = [
                  "bg-blue-500",
                  "bg-indigo-500",
                  "bg-purple-500",
                  "bg-emerald-500",
                ];
                const accent = accents[idx % accents.length];
                const membersCount = group.members ? group.members.length : 0;
                const capacity = group.capacity || 10;
                const pct = Math.min(100, (membersCount / capacity) * 100);

                return (
                  <div
                    key={group.id}
                    data-testid={`group-row-${group.id}`}
                    className="space-y-2 group"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`h-2 w-2 rounded-full ${accent} shadow-[0_0_10px_currentColor]`} />
                        <span className="font-medium text-foreground truncate">
                          {group.name}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {membersCount} / {capacity}
                      </span>
                    </div>
                    <Progress
                      value={pct}
                      className="h-1.5 bg-muted/40 [&>div]:bg-primary [&>div]:shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                    />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="md:col-span-5 space-y-6">
          {/* Recent Activity */}
          <Card
            data-testid="recent-activity-card"
            className={`animate-in slide-in-from-bottom-8 fade-in duration-500 delay-500 ${cardBase}`}
          >
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-foreground text-base font-medium">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="relative space-y-5">
                {/* vertical timeline line */}
                <li className="absolute left-[5px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-border to-transparent" />

                <li className="relative flex items-start gap-4 pl-1">
                  <span className="relative mt-1.5 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(59,130,246,0.8)] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">
                      Logged in to{" "}
                      <span className="font-medium">Virtual Study Space</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Just now</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Upcoming Sessions — premium redesign */}
          <Card
            data-testid="upcoming-sessions-card"
            className={`relative overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-500 delay-700 ${cardBase}`}
          >
            {/* spotlight */}
            <div className="absolute -top-24 -right-16 h-56 w-56 rounded-full bg-primary/25 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

            <CardContent className="relative p-6">
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl border border-border/60 bg-background/40 backdrop-blur flex items-center justify-center shadow-[0_0_18px_rgba(59,130,246,0.25)]">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-foreground">
                    Upcoming Sessions
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    No study sessions scheduled for today.
                  </p>
                </div>
              </div>

              <Button
                data-testid="schedule-now-btn"
                asChild
                className="mt-5 w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_18px_rgba(59,130,246,0.45)] hover:shadow-[0_0_28px_rgba(59,130,246,0.65)] transition-all duration-300 group font-medium"
              >
                <Link to="/schedule">
                  Schedule Now
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}