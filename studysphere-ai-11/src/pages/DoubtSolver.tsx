import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Loader2, FileText, Bot } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { groupsAPI } from "@/services/api";
import api from "@/services/api"; 
import 'katex/dist/katex.min.css';

// Markdown Renderers
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default function DoubtSolver() {
  const [groups, setGroups] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedMaterialId, setSelectedMaterialId] = useState("");

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

  useEffect(() => {
    const fetchAllGroups = async () => {
        try {
            const res = await api.get("/groups/?page_size=100"); 
            setGroups(res.data.results || res.data || []);
        } catch (err) {
            console.error("Failed to load groups", err);
        }
    };
    fetchAllGroups();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleGroupChange = async (groupId: string) => {
    setSelectedGroupId(groupId);
    setFiles([]);
    try {
        const res = await groupsAPI.getMaterials(groupId);
        setFiles(res.data.results || res.data || []);
    } catch (err) {
        console.error(err);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    if (!selectedMaterialId) {
        alert("Please select a file first!");
        return;
    }

    const userText = inputMessage;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newUserMessage = { id: Date.now(), sender: "user", content: userText, timestamp };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage("");
    setLoading(true);

    try {
      const res = await api.post('/ai/doubt/rag/', { 
        question: userText, 
        materialId: selectedMaterialId 
      });

      const aiAnswer = res.data.answer || "I couldn't find an answer in the document.";

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
    <div className="space-y-6 animate-in fade-in h-[calc(100vh-100px)] flex flex-col p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Doubt Solver</h1>
        <p className="text-muted-foreground mt-1 text-sm">Get instant answers to your academic questions</p>
      </div>

      {/* Main Chat Interface */}
      <Card className="border-border/40 flex-1 flex flex-col min-h-0 bg-card/20 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
          
          {/* Top Bar */}
          <div className="border-b border-border/40 bg-card/60 shrink-0 py-4 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-foreground text-base">Assistant</CardTitle>
                <p className="text-[11px] text-muted-foreground uppercase tracking-widest mt-0.5">Context-aware helper</p>
              </div>
            </div>
            {/* Status indicator */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Online</span>
            </div>
          </div>
          
          <div className="p-0 flex-1 flex flex-col min-h-0 relative">
            
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-8 max-w-4xl mx-auto">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-4 ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                    
                    <Avatar className={`h-8 w-8 ring-1 ring-border/60 ${message.sender === "ai" ? "bg-card" : "bg-primary/20"}`}>
                      <AvatarFallback className={message.sender === "ai" ? "text-primary" : "text-primary font-bold text-xs"}>
                        {message.sender === "ai" ? <Bot className="h-4 w-4" /> : "ME"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`flex-1 flex flex-col ${message.sender === "user" ? "items-end" : "items-start"} max-w-[85%]`}>
                      <div className={`inline-block px-5 py-3.5 shadow-sm overflow-x-auto ${
                          message.sender === "user" 
                          ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm" 
                          : "bg-card/60 backdrop-blur-sm border border-border/40 text-foreground rounded-2xl rounded-tl-sm"
                        }`}>
                        
                        {message.sender === "ai" ? (
                            <div className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/60 prose-pre:border prose-pre:border-border/40 prose-th:bg-muted prose-td:border-border/40 prose-th:border-border/40 prose-th:p-2 prose-td:p-2">
                                <ReactMarkdown 
                                    remarkPlugins={[remarkGfm, remarkMath]} 
                                    rehypePlugins={[rehypeKatex]}
                                >
                                    {message.content}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        )}

                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2 px-1 tracking-wider uppercase">{message.timestamp}</p>
                    </div>
                  </div>
                ))}
                
                {loading && (
                    <div className="flex gap-4">
                        <Avatar className="h-8 w-8 bg-card ring-1 ring-border/60"><AvatarFallback className="text-primary"><Bot className="h-4 w-4" /></AvatarFallback></Avatar>
                        <div className="bg-card/60 backdrop-blur-sm border border-border/40 px-5 py-3.5 rounded-2xl rounded-tl-sm flex items-center gap-3">
                            <Loader2 className="w-4 h-4 animate-spin text-primary"/> 
                            <span className="text-sm font-medium text-muted-foreground">Analyzing document...</span>
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Bottom Bar: Inputs */}
            <div className="border-t border-border/40 p-4 bg-card/60 backdrop-blur-md shrink-0">
              <div className="flex flex-col md:flex-row gap-3 max-w-4xl mx-auto">
                
                {/* Selectors */}
                <div className="flex gap-2 shrink-0">
                    <Select onValueChange={handleGroupChange}>
                        <SelectTrigger className="w-[160px] h-12 bg-black/40 border-border/60 focus:ring-primary/50 rounded-xl text-sm">
                            <SelectValue placeholder="Select Group" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border/40">
                          {groups.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Select onValueChange={setSelectedMaterialId} disabled={!selectedGroupId}>
                        <SelectTrigger className="w-[160px] h-12 bg-black/40 border-border/60 focus:ring-primary/50 rounded-xl text-sm">
                             <FileText className="w-4 h-4 mr-2 text-muted-foreground"/>
                            <SelectValue placeholder="Select File" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border/40">
                          {files.map(f => <SelectItem key={f.id} value={String(f.id)}>{f.title}</SelectItem>)}
                        </SelectContent>
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
                      className="flex-1 h-12 rounded-xl bg-black/40 border-border/60 focus-visible:ring-primary/50 placeholder:text-muted-foreground/50 text-sm"
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!inputMessage.trim() || loading} 
                      className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center p-0"
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin text-primary-foreground"/> : <Send className="h-5 w-5 text-primary-foreground ml-1" />}
                    </Button>
                </div>

              </div>
            </div>
          </div>
      </Card>
    </div>
  );
}
