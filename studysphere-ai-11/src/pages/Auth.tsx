import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.jpg";
import { authAPI } from "@/services/api"; // <--- IMPORT YOUR API SERVICE

export default function Auth() {
  const navigate = useNavigate();
  
  // CHANGED: "loginEmail" -> "loginUsername" so you can type 'admin'
  const [loginUsername, setLoginUsername] = useState(""); 
  const [loginPassword, setLoginPassword] = useState("");
  
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    // --- 🕵️ SPY LOGGING STARTS HERE ---
    console.log("========================================");
    console.log("🔴 BUTTON CLICKED! DEBUGGING VARIABLES:");
    console.log("👉 What React 'Sees' in Username:", loginUsername);
    console.log("👉 What React 'Sees' in Password:", loginPassword);
    
    // Check if they are empty
    if (!loginUsername || loginUsername === "") {
        console.error("❌ ERROR: Username variable is EMPTY!");
        alert("STOP! React thinks the Username is empty. Did you type it?");
        return;
    }
    console.log("✅ Variables look okay. Sending to Backend...");
    console.log("========================================");
    // --- SPY LOGGING ENDS HERE ---

    try {
      // This is the actual network call
      const response = await authAPI.login(loginUsername, loginPassword);
      
      console.log("🎉 RESPONSE RECEIVED:", response);

      if (response.access) {
        console.log("🚀 Login Success! Redirecting...");
        window.location.href = "/";
      }
    } catch (error) {
      console.error("💀 LOGIN FAILED. Error details:", error);
      alert("Login Failed! Check the Console for the red error.");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (signupPassword !== signupConfirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    try {
      // Call Backend to register
      await authAPI.signup(signupName, signupEmail, signupPassword);
      alert("Account created successfully! Please log in.");
      // Optional: You could automatically switch tabs here if you wanted
    } catch (error) {
      console.error("Signup failed:", error);
      alert("Signup failed. That username might be taken.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
      <Card className="w-full max-w-md border-border shadow-xl">
        <CardHeader className="text-center space-y-4">
          <img src={logo} alt="Learn LM" className="h-24 w-auto mx-auto" />
          <div>
            <CardTitle className="text-3xl font-bold text-foreground">Learn LM</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Virtual Study Group Platform
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            {/* LOGIN TAB */}
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Username</Label>
                  <Input
                    id="login-username"
                    type="text" // <--- CHANGED TO TEXT (Was Email)
                    placeholder="Enter your username" // <--- CHANGED PLACEHOLDER
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-primary-foreground">
                  Login
                </Button>
              </form>
            </TabsContent>

            {/* SIGNUP TAB */}
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Username</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Choose a username"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="student@university.edu"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-primary-foreground">
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