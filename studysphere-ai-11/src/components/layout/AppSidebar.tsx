import { useEffect, useState } from "react";
import { 
  Home,
  Users,
  Calendar, 
  FileText,
  Brain,
  MessageSquare,
  BookOpen,
  Bell, 
  Settings,
  Trophy,
  LogOut,
  FolderOpen
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authAPI, userAPI } from "@/services/api"; 

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Study Groups", url: "/groups", icon: Users },
  { title: "AI Flashcards", url: "/flashcards", icon: BookOpen },
  { title: "AI Quiz", url: "/quiz", icon: Brain },
  { title: "Doubt Solver", url: "/doubt-solver", icon: MessageSquare },
  { title: "AI Tutor", url: "/ai-tutor", icon: Trophy },
  { title: "Schedule", url: "/schedule", icon: Calendar },
  { title: "File Library", url: "/files", icon: FolderOpen },
];

const bottomMenuItems = [
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const navigate = useNavigate();
  
  // State to store real user data
  const [user, setUser] = useState({ username: "Loading...", role: "Student" });

  // 1. Fetch Real User Profile on Load
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        // 👇 FIX: The data is inside response.data
        const userData = response.data;
        
        // If the API returns valid data, update state
        if (userData && userData.username) {
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        // Fallback so it doesn't say "Loading..." forever
        setUser({ username: "Guest", role: "Student" });
      }
    };
    loadProfile();
  }, []);

  // 2. Real Logout Logic
  const handleLogout = () => {
    authAPI.logout(); 
  };

  // Calculate initials dynamically
  const userInitials = user.username && user.username !== "Loading..."
    ? user.username.charAt(0).toUpperCase() 
    : "?";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          {open && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">Welcome</span>
              <span className="text-xs text-sidebar-foreground/70 capitalize">
                {user.username}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
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
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-2" />
          {open && <span>Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}