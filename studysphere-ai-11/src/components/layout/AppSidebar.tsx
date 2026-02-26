import { useEffect, useState } from "react";
import { 
  Home, Users, Calendar, FileText, Brain, MessageSquare, 
  BookOpen, Bell, Settings, LogOut, FolderOpen, UserPlus,
  ChevronLeft 
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authAPI, userAPI } from "@/services/api"; 

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Study Groups", url: "/groups", icon: Users },
  { title: "Friends", url: "/friends", icon: UserPlus },
  { title: "AI Flashcards", url: "/flashcards", icon: BookOpen },
  { title: "AI Quiz", url: "/quiz", icon: Brain },
  { title: "Doubt Solver", url: "/doubt-solver", icon: MessageSquare },
  { title: "Schedule", url: "/schedule", icon: Calendar },
  { title: "File Library", url: "/files", icon: FolderOpen },
];

const bottomMenuItems = [
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  // `state` tells us if it is expanded or collapsed
  const { state, toggleSidebar, isMobile } = useSidebar(); 
  const navigate = useNavigate();
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

  const userInitials = user.username && user.username !== "Loading..."
    ? user.username.charAt(0).toUpperCase() : "?";

  return (
    // 👇 Set to "icon" to minimize, and added hidden scrollbar trick
    <Sidebar collapsible="icon" className="border-r border-sidebar-border shadow-xl [&::-webkit-scrollbar]:hidden">
      
      <SidebarHeader className="border-b border-sidebar-border p-4 relative">
        <div className={`flex items-center gap-3 overflow-hidden ${state === "collapsed" ? "justify-center" : ""}`}>
          <Avatar className="h-10 w-10 border-2 border-blue-500 shadow-md shrink-0">
            <AvatarFallback className="bg-blue-600 text-white font-bold text-lg">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          {state === "expanded" && (
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Welcome</span>
              <span className="text-lg font-black text-sidebar-foreground capitalize tracking-tight truncate">
                {user.username}
              </span>
            </div>
          )}
        </div>

        {/* 🌟 CATCHY FLOATING MINIMIZE BUTTON 🌟 */}
        {!isMobile && (
          <Button 
            onClick={toggleSidebar} 
            size="icon"
            className={`absolute top-6 -right-3 h-7 w-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-transform duration-300 border-2 border-white dark:border-slate-950 z-50 ${state === "collapsed" ? "rotate-180" : ""}`}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 mt-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <SidebarGroup>
          {state === "expanded" && <SidebarGroupLabel className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-2">Main Menu</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} className="h-11 rounded-xl">
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className="font-semibold tracking-wide text-[15px] text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-slate-800 dark:hover:text-blue-400 transition-all duration-200"
                      activeClassName="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 shadow-sm"
                    >
                      <item.icon className="h-5 w-5 mr-1 shrink-0" />
                      {state === "expanded" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {bottomMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} className="h-11 rounded-xl">
                    <NavLink 
                      to={item.url}
                      className="font-semibold tracking-wide text-[15px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                      activeClassName="bg-slate-200 dark:bg-slate-700 text-slate-900 shadow-sm"
                    >
                      <item.icon className="h-5 w-5 mr-1 shrink-0" />
                      {state === "expanded" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <Button
          variant="ghost"
          className={`w-full h-11 text-red-500 font-bold tracking-wide hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition-colors rounded-xl ${state === "collapsed" ? "justify-center px-0" : "justify-start"}`}
          onClick={handleLogout}
        >
          <LogOut className={`h-5 w-5 shrink-0 ${state === "expanded" ? "mr-2" : ""}`} />
          {state === "expanded" && <span>Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}