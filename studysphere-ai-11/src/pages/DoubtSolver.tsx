import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Sparkles, Loader2, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { groupsAPI } from "@/services/api";
import api from "@/services/api"; 
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

// Markdown Renderers
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// 👇 NEW: Added Math Plugins
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

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

      {/* Main Chat Interface */}
      <Card className="border-border flex-1 flex flex-col min-h-0 shadow-md">
          
          {/* Top Bar */}
          <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-indigo-600 shrink-0 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shadow-inner">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white">AI Assistant</CardTitle>
                <p className="text-xs text-blue-100">Context-aware study helper</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 flex-1 flex flex-col min-h-0 relative bg-slate-50/50">
            
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6 max-w-4xl mx-auto">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                    
                    <Avatar className={`h-8 w-8 shadow-sm ${message.sender === "ai" ? "bg-blue-600" : "bg-slate-300"}`}>
                      <AvatarFallback className={message.sender === "ai" ? "text-white" : "text-slate-700 font-bold"}>
                        {message.sender === "ai" ? "AI" : "ME"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`flex-1 flex flex-col ${message.sender === "user" ? "items-end" : "items-start"} max-w-[85%]`}>
                      <div className={`inline-block rounded-2xl px-5 py-3 shadow-sm overflow-x-auto ${
                          message.sender === "user" 
                          ? "bg-blue-600 text-white rounded-tr-sm" 
                          : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
                        }`}>
                        
                        {message.sender === "ai" ? (
                            <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-800 prose-pre:text-slate-50 prose-th:bg-slate-100 prose-td:border prose-th:border prose-th:p-2 prose-td:p-2">
                                {/* 👇 NEW: Added remarkMath and rehypeKatex 👇 */}
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
                      <p className="text-xs text-slate-400 mt-1 px-1">{message.timestamp}</p>
                    </div>
                  </div>
                ))}
                
                {loading && (
                    <div className="flex gap-3">
                        <Avatar className="h-8 w-8 bg-blue-600 shadow-sm"><AvatarFallback className="text-white">AI</AvatarFallback></Avatar>
                        <div className="bg-white border border-slate-200 px-5 py-3 rounded-2xl rounded-tl-sm flex items-center gap-3 shadow-sm">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600"/> 
                            <span className="text-sm font-medium text-slate-500">Analyzing document...</span>
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Bottom Bar: Inputs */}
            <div className="border-t p-4 bg-white shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
              <div className="flex flex-col md:flex-row gap-3 max-w-4xl mx-auto">
                
                {/* Selectors */}
                <div className="flex gap-2 shrink-0">
                    <Select onValueChange={handleGroupChange}>
                        <SelectTrigger className="w-[150px] h-11 border-slate-200 bg-slate-50 focus:ring-blue-500 rounded-xl">
                            <SelectValue placeholder="Select Group" />
                        </SelectTrigger>
                        <SelectContent>{groups.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>)}</SelectContent>
                    </Select>

                    <Select onValueChange={setSelectedMaterialId} disabled={!selectedGroupId}>
                        <SelectTrigger className="w-[150px] h-11 border-slate-200 bg-slate-50 focus:ring-blue-500 rounded-xl">
                             <FileText className="w-4 h-4 mr-2 text-slate-400"/>
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
                      className="flex-1 h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                    />
                    <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || loading} className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md">
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