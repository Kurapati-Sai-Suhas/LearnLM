import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send, Sparkles, Upload } from "lucide-react";

export default function DoubtSolver() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      content: "Hi! I'm your AI Doubt Solver. Ask me anything about your studies, and I'll help you understand the concepts better. You can also upload study materials for contextual help!",
      timestamp: "Just now",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newUserMessage = {
      id: messages.length + 1,
      sender: "user",
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newUserMessage]);
    setInputMessage("");

    // Simulate AI response - this will be replaced with actual Django API + AI call
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        sender: "ai",
        content: "Great question! Let me help you with that. Based on your study materials and the context of your question, here's a detailed explanation...",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Doubt Solver</h1>
        <p className="text-muted-foreground mt-1">Get instant answers to your academic questions</p>
      </div>

      {/* Main Chat Interface */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat Area */}
        <Card className="border-border lg:col-span-2">
          <CardHeader className="border-b bg-gradient-primary">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white">AI Doubt Solver</CardTitle>
                <p className="text-xs text-white/80">Powered by Advanced AI</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px] p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className={`h-8 w-8 ${message.sender === "ai" ? "bg-primary" : "bg-muted"}`}>
                      <AvatarFallback className={message.sender === "ai" ? "text-primary-foreground" : "text-foreground"}>
                        {message.sender === "ai" ? "AI" : "ME"}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex-1 space-y-1 ${message.sender === "user" ? "items-end" : ""}`}>
                      <div
                        className={`inline-block rounded-lg px-4 py-2 ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground px-2">{message.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Ask your question here..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="bg-primary hover:bg-primary-dark text-primary-foreground"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suggestions Sidebar */}
        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium text-foreground mb-1">Be specific</p>
                <p className="text-xs text-muted-foreground">
                  Include relevant details about your doubt for better answers
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium text-foreground mb-1">Upload materials</p>
                <p className="text-xs text-muted-foreground">
                  Share study materials for contextual help
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium text-foreground mb-1">Ask follow-ups</p>
                <p className="text-xs text-muted-foreground">
                  Don't hesitate to ask for clarification
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Suggested Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "Explain Newton's laws of motion",
                "How do I solve quadratic equations?",
                "What are the main types of chemical bonds?",
              ].map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 border-primary/20 hover:bg-primary/10"
                  onClick={() => setInputMessage(question)}
                >
                  <span className="text-sm text-foreground">{question}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
