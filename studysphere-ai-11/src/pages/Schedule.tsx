import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus, Sparkles } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

export default function Schedule() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const events: any[] = [];

  const glassCard =
    "relative overflow-hidden border-border/60 bg-card/40 backdrop-blur-md " +
    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]";

  return (
    <div
      data-testid="schedule-page"
      className="relative space-y-8 p-6 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-20 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-32 right-0 h-[320px] w-[320px] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      {/* HEADER */}
      <div
        data-testid="schedule-hero"
        className={`flex items-center justify-between gap-4 rounded-2xl border p-6 md:p-8 ${glassCard} animate-in slide-in-from-bottom-4 fade-in duration-500`}
      >
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 backdrop-blur px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" />
            Plan your week
          </div>
          <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
            Schedule
          </h1>
          <p className="mt-2 text-sm md:text-base text-muted-foreground">
            Manage your study sessions
          </p>
        </div>

        <Button
          data-testid="new-session-btn"
          className="relative h-11 px-5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_18px_rgba(59,130,246,0.5)] hover:shadow-[0_0_28px_rgba(59,130,246,0.7)] transition-all font-medium"
        >
          <Plus className="h-4 w-4 mr-2" /> New Session
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card data-testid="calendar-card" className={`lg:col-span-1 h-fit ${glassCard}`}>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground">
              <span className="h-7 w-7 rounded-lg border border-border/60 bg-background/40 backdrop-blur flex items-center justify-center">
                <CalendarIcon className="h-3.5 w-3.5 text-primary" />
              </span>
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border border-border/60 bg-background/30 backdrop-blur mx-auto"
            />
          </CardContent>
        </Card>

        {/* Events */}
        <Card data-testid="events-card" className={`lg:col-span-2 min-h-[400px] ${glassCard}`}>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-56 text-center">
                <div className="h-14 w-14 rounded-2xl border border-dashed border-border/60 bg-background/30 backdrop-blur flex items-center justify-center mb-3">
                  <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No upcoming study sessions.</p>
                <Button
                  data-testid="empty-schedule-cta"
                  variant="link"
                  className="text-primary mt-1 hover:text-primary/80"
                >
                  Schedule one now →
                </Button>
              </div>
            ) : (
              <div>{/* Event list */}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}