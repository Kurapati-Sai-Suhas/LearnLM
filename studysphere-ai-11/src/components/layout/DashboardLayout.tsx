import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { userAPI } from "@/services/api"; 
import logo from "@/assets/logo.jpg";

export function DashboardLayout({ children }) {
  // 1. Initial State
  const [user, setUser] = useState({ 
    username: "Loading...", 
    email: "student@example.com" 
  });

  // 2. Fetch User Profile
  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log("👤 Layout: Fetching profile...");
        const res = await userAPI.getProfile();
        
        // Check if we actually got a username, otherwise use Guest
        const userData = res.data || {};
        const finalUser = {
            username: userData.username || "Guest",
            email: userData.email || "guest@example.com"
        };
        
        console.log("👤 Layout: User loaded:", finalUser);
        setUser(finalUser);
        
      } catch (error) {
        console.error("Layout profile load error:", error);
        setUser({ username: "Guest", email: "guest@example.com" });
      }
    };
    loadUser();
  }, []);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/* Pass the updated user state to sidebar */}
        <AppSidebar user={user} />
        
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-6">
            <SidebarTrigger className="text-foreground" />
            <img src={logo} alt="Learn LM Logo" className="h-10 w-auto object-contain" />
          </header>
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}