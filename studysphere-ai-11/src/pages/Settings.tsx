import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Bell,
  Shield,
  Globe,
  Save,
  KeyRound,
  
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function Settings() {
  const [profile, setProfile] = useState({ first_name: "", last_name: "", email: "", bio: "", email_alerts: true });

  useEffect(() => {
    fetch("/api/settings/profile/", {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.email !== undefined) setProfile(data);
    })
    .catch(console.error);
  }, []);

  const handleSaveProfile = async () => {
    try {
      await fetch("/api/settings/profile/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(profile),
      });
      toast.success("Profile saved");
    } catch (e) {
      toast.error("Failed to save profile");
    }
  };

  const handleToggleEmail = async (checked: boolean) => {
    setProfile({ ...profile, email_alerts: checked });
    if (checked) {
      toast("Sending test email to verify connection...");
      fetch("/api/settings/email/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === "Email sent successfully!") {
            toast.success(data.status);
        } else {
            toast.error(data.message || "Failed to send email. Check SMTP settings.");
        }
      });
    }
  };

  // Shared premium tokens (kept inside the component to avoid extra files)
  const glassCard =
    "relative overflow-hidden border-border/60 bg-card/40 backdrop-blur-md " +
    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]";

  const sleekInput =
    "h-10 bg-background/40 backdrop-blur border-border/60 text-foreground " +
    "placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-primary/60 " +
    "focus-visible:border-primary/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] " +
    "transition-all duration-200";

  const tabTrigger =
    "relative rounded-md text-sm font-medium text-muted-foreground " +
    "data-[state=active]:text-foreground data-[state=active]:bg-card " +
    "data-[state=active]:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_0_18px_rgba(59,130,246,0.25)] " +
    "transition-all duration-300";

  const labelCls =
    "text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium";

  const primaryGlowBtn =
    "h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 " +
    "shadow-[0_0_18px_rgba(59,130,246,0.45)] hover:shadow-[0_0_28px_rgba(59,130,246,0.65)] " +
    "transition-all duration-300 font-medium";

  return (
    <div
      data-testid="settings-page"
      className="relative space-y-8 p-6 md:p-8 max-w-5xl mx-auto w-full animate-in fade-in duration-500"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-20 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-32 right-0 h-[320px] w-[320px] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      {/* HERO HEADER */}
      <div
        data-testid="settings-hero"
        className={`animate-in slide-in-from-bottom-4 fade-in duration-500 rounded-2xl border p-8 ${glassCard}`}
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

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 backdrop-blur px-3 py-1 text-xs font-medium text-muted-foreground">
            
            Account preferences
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="mt-3 text-base md:text-lg text-muted-foreground">
            Manage your account, security, and platform preferences.
          </p>
        </div>
      </div>

      {/* TABS */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList
          data-testid="settings-tabs"
          className="grid w-full grid-cols-4 h-11 p-1 rounded-lg bg-card/40 backdrop-blur-md border border-border/60"
        >
          <TabsTrigger data-testid="tab-profile" value="profile" className={tabTrigger}>
            <User className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger
            data-testid="tab-notifications"
            value="notifications"
            className={tabTrigger}
          >
            <Bell className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger data-testid="tab-security" value="security" className={tabTrigger}>
            <Shield className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger data-testid="tab-language" value="language" className={tabTrigger}>
            <Globe className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Language</span>
          </TabsTrigger>
        </TabsList>

        {/* PROFILE */}
        <TabsContent
          value="profile"
          className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <Card data-testid="profile-card" className={glassCard}>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                Profile Information
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className={labelCls}>First Name</Label>
                  <Input
                    data-testid="profile-first-name"
                    placeholder="Your Name"
                    value={profile.first_name}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    className={sleekInput}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className={labelCls}>Last Name</Label>
                  <Input
                    data-testid="profile-last-name"
                    placeholder="Your Last Name"
                    value={profile.last_name}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    className={sleekInput}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className={labelCls}>Email</Label>
                <Input
                  data-testid="profile-email"
                  type="email"
                  placeholder="email@example.com"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className={sleekInput}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={labelCls}>Bio</Label>
                <Input
                  data-testid="profile-bio"
                  placeholder="Tell us about yourself..."
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className={sleekInput}
                />
              </div>
              <Button
                data-testid="profile-save-btn"
                onClick={handleSaveProfile}
                className={primaryGlowBtn}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICATIONS */}
        <TabsContent
          value="notifications"
          className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <Card data-testid="notifications-card" className={glassCard}>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                Notifications
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Configure your email and push notification preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/30 backdrop-blur px-4 py-3 hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg border border-border/60 bg-background/40 flex items-center justify-center">
                    <Bell className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-foreground">
                      Email Alerts
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Receive important updates by email
                    </p>
                  </div>
                </div>
                <Switch
                  data-testid="switch-email-alerts"
                  checked={profile.email_alerts}
                  onCheckedChange={handleToggleEmail}
                  className="data-[state=checked]:bg-primary data-[state=checked]:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/30 backdrop-blur px-4 py-3 hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg border border-border/60 bg-background/40 flex items-center justify-center">
                    
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-foreground">
                      Study Reminders
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Daily nudges to keep your streak alive
                    </p>
                  </div>
                </div>
                <Switch
                  data-testid="switch-study-reminders"
                  defaultChecked
                  className="data-[state=checked]:bg-primary data-[state=checked]:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                />
              </div>

              <Button
                data-testid="notifications-save-btn"
                onClick={handleSaveProfile}
                className={`w-full ${primaryGlowBtn}`}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECURITY */}
        <TabsContent
          value="security"
          className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <Card data-testid="security-card" className={glassCard}>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                Security
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Update password
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-1.5">
                <Label className={labelCls}>Current Password</Label>
                <Input
                  data-testid="security-current-password"
                  type="password"
                  className={`${sleekInput} font-mono tracking-wider`}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={labelCls}>New Password</Label>
                <Input
                  data-testid="security-new-password"
                  type="password"
                  className={`${sleekInput} font-mono tracking-wider`}
                />
              </div>

              {/* subtle security tip pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/[0.06] backdrop-blur px-3 py-1 text-[11px] font-medium text-emerald-300">
                <Shield className="h-3 w-3" />
                Use 12+ chars with symbols & numbers
              </div>

              <Button data-testid="security-update-btn" className={primaryGlowBtn}>
                <KeyRound className="h-4 w-4 mr-2" />
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LANGUAGE */}
        <TabsContent
          value="language"
          className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <Card data-testid="language-card" className={glassCard}>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                Language & Region
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Choose your preferred language
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-1.5">
                <Label className={labelCls}>Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger
                    data-testid="language-select-trigger"
                    className="h-10 bg-background/40 backdrop-blur border-border/60 text-foreground hover:border-primary/40 focus:ring-1 focus:ring-primary/60 focus:border-primary/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] transition-all"
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-card/95 backdrop-blur-md border-border/60">
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button data-testid="language-save-btn" className={`w-full ${primaryGlowBtn}`}>
                <Save className="h-4 w-4 mr-2" />
                Save Region
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}