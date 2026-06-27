import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CheckCheck, Trash2, Users, BookOpen, Calendar, Trophy, MessageSquare } from "lucide-react";

import { useState, useEffect } from "react";

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/notifications/", {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        setNotifications(data.map(n => ({
          ...n,
          icon: Bell,
          read: n.is_read
        })));
      }
    })
    .catch(console.error);
  }, []);

  const handleMarkAllRead = () => {
    fetch("/api/notifications/", {
      method: "PUT",
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
    }).then(() => {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-primary text-primary-foreground">
                {unreadCount} new
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">Stay updated with your study activities</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleMarkAllRead}
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
          <Button 
            variant="outline" 
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear all
          </Button>
        </div>
      </div>

      {/* Notifications Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`border-border hover:shadow-md transition-shadow ${
                !notification.read ? "bg-primary/5 border-primary/20" : ""
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                    !notification.read ? "bg-primary/10" : "bg-muted"
                  }`}>
                    <notification.icon className={`h-6 w-6 ${
                      !notification.read ? "text-primary" : "text-muted-foreground"
                    }`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                      </div>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                  </div>
                  <div className="flex gap-2">
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-primary hover:bg-primary/10"
                      >
                        Mark read
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4 mt-6">
          {notifications.filter(n => !n.read).map((notification) => (
            <Card key={notification.id} className="border-border bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <notification.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-primary hover:bg-primary/10"
                    >
                      Mark read
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="read" className="space-y-4 mt-6">
          {notifications.filter(n => n.read).map((notification) => (
            <Card key={notification.id} className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <notification.icon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-foreground">{notification.title}</h3>
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Notification Settings */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Manage your notification preferences in Settings to control what updates you receive.
          </p>
          <Button 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Go to Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
