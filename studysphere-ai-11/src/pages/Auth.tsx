import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.jpg";
import { authAPI } from "@/services/api";

export default function Auth() {
  const navigate = useNavigate();
  
  const [loginUsername, setLoginUsername] = useState(""); 
  const [loginPassword, setLoginPassword] = useState("");
  
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginUsername || loginUsername === "") {
        alert("Please enter your username.");
        return;
    }

    try {
      const response = await authAPI.login(loginUsername, loginPassword);
      if (response.access) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("LOGIN FAILED. Error details:", error);
      alert("Login Failed! Please check your credentials.");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== signupConfirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    try {
      await authAPI.signup(signupName, signupEmail, signupPassword);
      alert("Account created successfully! Please log in.");
    } catch (error) {
      console.error("Signup failed:", error);
      alert("Signup failed. That username might be taken.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Ambient background glow for true-black theme */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] translate-x-1/2 translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <Card className="w-full max-w-md border-border/40 bg-card/40 backdrop-blur-xl shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-20 w-20 rounded-2xl overflow-hidden ring-1 ring-border/60 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <img src={logo} alt="Learn LM" className="h-full w-full object-cover" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold tracking-tight text-foreground">Learn LM</CardTitle>
            <CardDescription className="text-muted-foreground mt-2 text-sm uppercase tracking-widest">
              Virtual Study Group Platform
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-black/40 border border-border/40 p-1">
              <TabsTrigger value="login" className="data-[state=active]:bg-card/80 data-[state=active]:text-foreground rounded-md transition-all">Login</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-card/80 data-[state=active]:text-foreground rounded-md transition-all">Sign Up</TabsTrigger>
            </TabsList>
            
            {/* LOGIN TAB */}
            <TabsContent value="login" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Username</Label>
                  <Input
                    id="login-username"
                    type="text"
                    placeholder="Enter your username"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    required
                    className="h-11 bg-black/40 border-border/60 focus-visible:ring-primary/50 placeholder:text-muted-foreground/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="h-11 bg-black/40 border-border/60 focus-visible:ring-primary/50 placeholder:text-muted-foreground/50"
                  />
                </div>
                <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
                  Sign In
                </Button>
              </form>
            </TabsContent>

            {/* SIGNUP TAB */}
            <TabsContent value="signup" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Username</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Choose a username"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    className="h-11 bg-black/40 border-border/60 focus-visible:ring-primary/50 placeholder:text-muted-foreground/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="student@university.edu"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    className="h-11 bg-black/40 border-border/60 focus-visible:ring-primary/50 placeholder:text-muted-foreground/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    className="h-11 bg-black/40 border-border/60 focus-visible:ring-primary/50 placeholder:text-muted-foreground/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Confirm Password</Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    required
                    className="h-11 bg-black/40 border-border/60 focus-visible:ring-primary/50 placeholder:text-muted-foreground/50"
                  />
                </div>
                <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}