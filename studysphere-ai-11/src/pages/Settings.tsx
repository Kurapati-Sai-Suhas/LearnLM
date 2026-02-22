import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Shield, Globe } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        {/* 👇 Removed Help Tab */}
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile"><User className="h-4 w-4 mr-2" />Profile</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-2" />Notifications</TabsTrigger>
          <TabsTrigger value="security"><Shield className="h-4 w-4 mr-2" />Security</TabsTrigger>
          <TabsTrigger value="language"><Globe className="h-4 w-4 mr-2" />Language</TabsTrigger>
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>First Name</Label><Input placeholder="Your Name" /></div>
                <div className="space-y-2"><Label>Last Name</Label><Input placeholder="Your Last Name" /></div>
              </div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="email@example.com" /></div>
              <div className="space-y-2"><Label>Bio</Label><Input placeholder="Tell us about yourself..." /></div>
              <Button onClick={() => toast.success("Profile saved")} className="bg-primary text-primary-foreground">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICATIONS TAB */}
        <TabsContent value="notifications" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                  <Label>Email Alerts</Label><Switch defaultChecked />
              </div>
              <div className="flex justify-between items-center">
                  <Label>Study Reminders</Label><Switch defaultChecked />
              </div>
              <Button onClick={() => toast.success("Preferences saved")} className="w-full">Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Update password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2"><Label>Current Password</Label><Input type="password" /></div>
               <div className="space-y-2"><Label>New Password</Label><Input type="password" /></div>
               <Button className="bg-primary text-white">Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LANGUAGE TAB */}
        <TabsContent value="language" className="space-y-4 mt-6">
          <Card>
            <CardHeader><CardTitle>Language & Region</CardTitle></CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                  <Label>Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
               <Button className="w-full">Save Region</Button>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}