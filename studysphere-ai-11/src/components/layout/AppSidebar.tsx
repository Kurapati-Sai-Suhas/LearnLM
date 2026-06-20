import { useEffect, useState } from "react";
import {
  Home, Users, Calendar, MessageSquare, Layers, ListChecks,
  Bell, Settings, LogOut, FolderOpen, UserPlus, Terminal,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { authAPI, userAPI } from "@/services/api";

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Study Groups", url: "/groups", icon: Users },
  { title: "Coding Hub", url: "/coding-hub", icon: Terminal },
  { title: "Friends", url: "/friends", icon: UserPlus },
  { title: "Flashcards", url: "/flashcards", icon: Layers },
  { title: "Quizzes", url: "/quiz", icon: ListChecks },
  { title: "Doubt Solver", url: "/doubt-solver", icon: MessageSquare },
  { title: "Schedule", url: "/schedule", icon: Calendar },
  { title: "File Library", url: "/files", icon: FolderOpen },
];

const bottomMenuItems = [
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [user, setUser] = useState({ username: "Loading...", role: "Student" });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        if (response.data && response.data.username) {
          setUser(response.data);
        }
      } catch (error) {
        setUser({ username: "Guest", role: "Student" });
      }
    };
    loadProfile();
  }, []);

  const handleLogout = () => {
    authAPI.logout();
  };

  const userInitials =
    user.username && user.username !== "Loading..."
      ? user.username.charAt(0).toUpperCase()
      : "?";

  const renderNavItem = (item: { title: string; url: string; icon: any }) => (
    <NavLink
      key={item.title}
      to={item.url}
      end={item.url === "/"}
      data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 h-9 px-3 rounded-md text-[13px] font-medium
         border-l-2 transition-all duration-150
         ${
           isActive
             ? "border-primary bg-primary/10 text-primary shadow-[inset_0_0_18px_rgba(59,130,246,0.08)]"
             : "border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground"
         }`
      }
    >
      <item.icon
        className={`h-[17px] w-[17px] shrink-0 transition-all duration-150
          group-hover:scale-[1.05]`}
      />
      <span className="truncate">{item.title}</span>
    </NavLink>
  );

  return (
    <aside
      data-testid="app-sidebar"
      className="h-screen w-64 flex-shrink-0 flex flex-col bg-[#0a0a0a] border-r border-border/40"
    >
      {/* BRAND */}
      <div className="h-14 flex items-center px-5 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative h-7 w-7 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.35)]">
            <span className="text-primary text-[13px] font-bold tracking-tight">L</span>
            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(59,130,246,0.9)]" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold text-foreground tracking-tight">LearnLM</span>
            <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-muted-foreground mt-0.5">
              Adaptive
            </span>
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <p className="px-3 mb-2 text-[10px] font-medium tracking-[0.22em] text-muted-foreground/70 uppercase">
          Workspace
        </p>
        <div className="space-y-0.5">{menuItems.map(renderNavItem)}</div>

        <p className="px-3 mt-6 mb-2 text-[10px] font-medium tracking-[0.22em] text-muted-foreground/70 uppercase">
          Account
        </p>
        <div className="space-y-0.5">{bottomMenuItems.map(renderNavItem)}</div>
      </nav>

      {/* PROFILE FOOTER */}
      <div className="border-t border-border/40 p-3 shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-white/5 transition-colors">
          <Avatar className="h-8 w-8 ring-1 ring-primary/30 shadow-[0_0_10px_rgba(59,130,246,0.25)]">
            <AvatarFallback className="bg-primary/15 text-primary font-semibold text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p
              data-testid="sidebar-username"
              className="text-[13px] font-medium text-foreground capitalize truncate leading-tight"
            >
              {user.username}
            </p>
            <p className="text-[10px] text-muted-foreground capitalize truncate">
              {user.role || "Student"}
            </p>
          </div>

          <button
            data-testid="logout-btn"
            onClick={handleLogout}
            aria-label="Logout"
            className="group h-8 w-8 rounded-md flex items-center justify-center
              text-muted-foreground hover:text-rose-300 hover:bg-rose-500/10
              transition-all duration-150"
          >
            <LogOut className="h-4 w-4 group-hover:drop-shadow-[0_0_6px_rgba(244,63,94,0.7)] transition-all" />
          </button>
        </div>
      </div>
    </aside>
  );
}