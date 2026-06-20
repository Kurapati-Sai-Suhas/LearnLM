import { AppSidebar } from "./AppSidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* SIDEBAR — fixed width, never overlaps */}
      <AppSidebar />

      {/* MAIN COLUMN */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* TOP HEADER */}
        <header
          data-testid="dashboard-header"
          className="relative h-14 flex items-center justify-between px-6 border-b border-border/40 bg-[#0a0a0a]/60 backdrop-blur-md shrink-0 z-30"
        >
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 backdrop-blur px-3 py-1 text-[11px] font-medium text-muted-foreground">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              LearnLM · Live
            </div>
          </div>

          <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
            Dark Mode
          </span>
        </header>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {children}
        </div>
      </div>
    </div>
  );
}