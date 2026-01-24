import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, Plus, Users, Video } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

export default function Schedule() {
  const [date, setDate] = useState(new Date());

  // Mock data - will be fetched from Django API
  const upcomingEvents = [
    {
      id: 1,
      title: "Advanced Calculus Review",
      group: "Math Wizards",
      date: "Today",
      time: "3:00 PM - 4:30 PM",
      participants: 8,
      type: "Study Session",
      isOnline: true,
    },
    {
      id: 2,
      title: "Physics Lab Discussion",
      group: "Physics Masters",
      date: "Tomorrow",
      time: "10:00 AM - 11:30 AM",
      participants: 6,
      type: "Discussion",
      isOnline: false,
    },
    {
      id: 3,
      title: "Chemistry Quiz Prep",
      group: "Chem Club",
      date: "Friday, Mar 15",
      time: "2:00 PM - 3:00 PM",
      participants: 10,
      type: "Quiz Review",
      isOnline: true,
    },
    {
      id: 4,
      title: "Biology Group Study",
      group: "Biology Circle",
      date: "Saturday, Mar 16",
      time: "11:00 AM - 1:00 PM",
      participants: 12,
      type: "Study Session",
      isOnline: false,
    },
  ];

  const todaySchedule = [
    { time: "09:00 AM", event: "Review calculus notes", duration: "30 min" },
    { time: "11:00 AM", event: "Physics problem set", duration: "1 hour" },
    { time: "03:00 PM", event: "Advanced Calculus Review", duration: "1.5 hours" },
    { time: "05:00 PM", event: "Personal study time", duration: "1 hour" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Schedule & Calendar</h1>
          <p className="text-muted-foreground mt-1">Manage your study sessions and events</p>
        </div>
        <Button className="bg-primary hover:bg-primary-dark text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          New Session
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="border-border lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">Study Sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-success" />
                <span className="text-sm text-muted-foreground">Quizzes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-warning" />
                <span className="text-sm text-muted-foreground">Discussions</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Today's Schedule</CardTitle>
                  <CardDescription>Your activities for today</CardDescription>
                </div>
                <Badge className="bg-primary text-primary-foreground">
                  {todaySchedule.length} events
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaySchedule.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center justify-center w-16 flex-shrink-0">
                      <Clock className="h-4 w-4 text-primary mr-1" />
                      <span className="text-sm font-medium text-foreground">{item.time}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{item.event}</p>
                      <p className="text-sm text-muted-foreground">{item.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Upcoming Events</h2>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="border-border hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
                            {event.isOnline && (
                              <Badge variant="secondary" className="bg-primary/10 text-primary">
                                <Video className="h-3 w-3 mr-1" />
                                Online
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{event.group}</p>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{event.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{event.participants} attending</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-primary/50 text-primary">
                          {event.type}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button 
                          size="sm"
                          className="bg-primary hover:bg-primary-dark text-primary-foreground"
                        >
                          {event.isOnline ? "Join" : "Details"}
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        >
                          Remind Me
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
