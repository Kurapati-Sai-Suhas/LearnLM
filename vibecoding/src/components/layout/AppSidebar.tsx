import { 
  Home, 
  Users, 
  BookOpen, 
  Brain, 
  MessageSquare, 
  Calendar, 
  FolderOpen, 
  Bell, 
  Settings,
  Trophy,
  HelpCircle
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Study Groups", url: "/groups", icon: Users },
  { title: "AI Flashcards", url: "/flashcards", icon: BookOpen },
  { title: "AI Quiz", url: "/quiz", icon: Brain },
  { title: "Doubt Solver", url: "/doubt-solver", icon: MessageSquare },
  { title: "AI Tutor", url: "/ai-tutor", icon: Trophy },
  { title: "Schedule", url: "/schedule", icon: Calendar },
  { title: "File Library", url: "/files", icon: FolderOpen },
  { title: "Help Center", url: "/help", icon: HelpCircle },
];

const bottomMenuItems = [
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { open } = useSidebar();
  
  // This would come from your Django backend/auth system
  const userName = "John Doe";
  const userInitials = userName.split(" ").map(n => n[0]).join("");

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
              <span className="text-xs text-sidebar-foreground/70">{userName}</span>
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
    </Sidebar>
  );
}
