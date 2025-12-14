import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Lock, Globe } from "lucide-react";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8 max-w-4xl">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-lg">
            Manage your account and preferences
          </p>
        </div>

        {/* Profile Settings */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile Settings
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Full Name</Label>
              <Input
                id="name"
                defaultValue="John Student"
                className="border-input focus:border-primary focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue="john@university.edu"
                className="border-input focus:border-primary focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-foreground">Bio</Label>
              <Input
                id="bio"
                placeholder="Tell us about yourself..."
                className="border-input focus:border-primary focus:ring-primary"
              />
            </div>
            <Button
              className="bg-primary hover:bg-primary-hover active:bg-primary-active text-primary-foreground font-semibold shadow-md"
            >
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>Manage how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive updates about study sessions and group activities
                </p>
              </div>
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-accent"
              >
                Enabled
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium text-foreground">Session Reminders</p>
                <p className="text-sm text-muted-foreground">
                  Get notified before scheduled study sessions
                </p>
              </div>
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-accent"
              >
                Enabled
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Security
            </CardTitle>
            <CardDescription>Manage your password and security preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-foreground">
                Current Password
              </Label>
              <Input
                id="current-password"
                type="password"
                className="border-input focus:border-primary focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-foreground">
                New Password
              </Label>
              <Input
                id="new-password"
                type="password"
                className="border-input focus:border-primary focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-foreground">
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                className="border-input focus:border-primary focus:ring-primary"
              />
            </div>
            <Button
              className="bg-primary hover:bg-primary-hover active:bg-primary-active text-primary-foreground font-semibold shadow-md"
            >
              Update Password
            </Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Preferences
            </CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language" className="text-foreground">Language</Label>
              <Input
                id="language"
                defaultValue="English"
                className="border-input focus:border-primary focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-foreground">Timezone</Label>
              <Input
                id="timezone"
                defaultValue="UTC-5 (Eastern Time)"
                className="border-input focus:border-primary focus:ring-primary"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
