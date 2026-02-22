import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

export default function Schedule() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  // 👇 Empty array (No dummy events)
  const events: any[] = [];

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Schedule</h1>
          <p className="text-muted-foreground mt-1">Manage your study sessions</p>
        </div>
        <Button className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" /> New Session
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" /> Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border mx-auto" />
          </CardContent>
        </Card>

        {/* Events List */}
        <Card className="lg:col-span-2 min-h-[400px]">
           <CardHeader><CardTitle>Upcoming Events</CardTitle></CardHeader>
           <CardContent>
                {events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                        <p>No upcoming study sessions.</p>
                        <Button variant="link" className="text-primary mt-2">Schedule one now</Button>
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