import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send, Sparkles, Loader2, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { groupsAPI } from "@/services/api";
import api from "@/services/api"; 
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

export default function DoubtSolver() {
  // --- 1. DATA STATE ---
  const [groups, setGroups] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedMaterialId, setSelectedMaterialId] = useState("");

  // --- 2. CHAT STATE ---
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      content: "Hi! Select a file below to start chatting with your document.",
      timestamp: "Just now",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 👇 CHANGED: Load Groups with page_size=100
  useEffect(() => {
    const fetchAllGroups = async () => {
        try {
            // This asks Django for 100 groups instead of just 9
            const res = await api.get("/groups/?page_size=100"); 
            setGroups(res.data.results || res.data || []);
        } catch (err) {
            console.error("Failed to load groups", err);
        }
    };
    fetchAllGroups();
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleGroupChange = async (groupId: string) => {
    setSelectedGroupId(groupId);
    setFiles([]);
    try {
        // We use the regular API here as files are usually not paginated heavily yet
        const res = await groupsAPI.getMaterials(groupId);
        setFiles(res.data.results || res.data || []);
    } catch (err) {
        console.error(err);
    }
  };

  // --- 3. SEND MESSAGE LOGIC ---
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    if (!selectedMaterialId) {
        alert("Please select a file first!");
        return;
    }

    const userText = inputMessage;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Add User Message
    const newUserMessage = { id: Date.now(), sender: "user", content: userText, timestamp };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage("");
    setLoading(true);

    try {
      // 2. Call Backend
      const res = await api.post('/ai/doubt/', { 
        question: userText, 
        materialId: selectedMaterialId 
      });

      const aiAnswer = res.data.answer || "I couldn't find an answer in the document.";

      // 3. Add AI Response
      const aiResponse = {
        id: Date.now() + 1,
        sender: "ai",
        content: aiAnswer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiResponse]);

    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1, sender: "ai", content: "⚠️ Error: Check if Backend is running.", timestamp
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Doubt Solver</h1>
        <p className="text-muted-foreground mt-1">Get instant answers to your academic questions</p>
      </div>

      {/* Main Chat Interface - Full Width */}
      <Card className="border-border flex-1 flex flex-col min-h-0 shadow-md">
          
          {/* Top Bar */}
          <CardHeader className="border-b bg-gradient-primary shrink-0 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white">AI Assistant</CardTitle>
                <p className="text-xs text-white/80">Context-aware study helper</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 flex-1 flex flex-col min-h-0 relative">
            
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 bg-slate-50/30">
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                    <Avatar className={`h-8 w-8 ${message.sender === "ai" ? "bg-primary" : "bg-muted"}`}>
                      <AvatarFallback className={message.sender === "ai" ? "text-primary-foreground" : "text-foreground"}>
                        {message.sender === "ai" ? "AI" : "ME"}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex-1 space-y-1 max-w-[80%] ${message.sender === "user" ? "items-end" : ""}`}>
                      <div className={`inline-block rounded-lg px-4 py-2 shadow-sm ${
                          message.sender === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-white border text-foreground"
                        }`}>
                        {/* Render Math/Latex */}
                        <div className="text-sm">
                            <Latex>{message.content}</Latex>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground px-2">{message.timestamp}</p>
                    </div>
                  </div>
                ))}
                
                {loading && (
                    <div className="flex gap-3">
                        <Avatar className="h-8 w-8 bg-primary"><AvatarFallback className="text-white">AI</AvatarFallback></Avatar>
                        <div className="bg-white border px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
                            <Loader2 className="w-3 h-3 animate-spin text-primary"/> <span className="text-sm text-gray-500">Reading document...</span>
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Bottom Bar: Inputs */}
            <div className="border-t p-4 bg-white shrink-0">
              <div className="flex flex-col md:flex-row gap-3 max-w-4xl mx-auto">
                
                {/* 👇 MOVED HERE: The Selection Dropdowns */}
                <div className="flex gap-2 shrink-0">
                    <Select onValueChange={handleGroupChange}>
                        <SelectTrigger className="w-[140px] h-10 border-primary/20 bg-primary/5 focus:ring-primary">
                            <SelectValue placeholder="Select Group" />
                        </SelectTrigger>
                        <SelectContent>{groups.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>)}</SelectContent>
                    </Select>

                    <Select onValueChange={setSelectedMaterialId} disabled={!selectedGroupId}>
                        <SelectTrigger className="w-[140px] h-10 border-primary/20 bg-primary/5 focus:ring-primary">
                             {/* Icon inside the trigger */}
                             <FileText className="w-4 h-4 mr-2 opacity-50"/>
                            <SelectValue placeholder="Select File" />
                        </SelectTrigger>
                        <SelectContent>{files.map(f => <SelectItem key={f.id} value={String(f.id)}>{f.title}</SelectItem>)}</SelectContent>
                    </Select>
                </div>

                {/* Input Field */}
                <div className="flex-1 flex gap-2">
                    <Input
                      placeholder={selectedMaterialId ? "Ask your question..." : "Select a file to start chatting"}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      disabled={!selectedMaterialId || loading}
                      className="flex-1 h-10"
                    />
                    <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || loading} className="h-10 px-4 bg-primary hover:bg-primary-dark">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                    </Button>
                </div>

              </div>
            </div>
          </CardContent>
      </Card>
    </div>
  );
}