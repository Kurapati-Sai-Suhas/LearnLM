import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar"; 
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();

  return (
    // 👇 Added defaultOpen={true} to ensure it starts open
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-background transition-colors duration-300">
        
        {/* 🌟 BULLETPROOF TOP HEADER 🌟 */}
        <header className="h-16 flex items-center justify-end px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shrink-0 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full shadow-sm hover:shadow-md transition-all duration-300 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
          >
            {theme === "dark" ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
          </Button>
        </header>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}