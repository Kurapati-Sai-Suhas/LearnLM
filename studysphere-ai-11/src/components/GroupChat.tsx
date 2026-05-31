import { useEffect, useState, useRef } from "react";
import { Send, WifiOff, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function GroupChat({ groupId, currentUser }: { groupId: string, currentUser: string }) {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    
    const ws = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const token = localStorage.getItem("authToken") || localStorage.getItem("access") || "";
        const wsUrl = `ws://127.0.0.1:8000/ws/chat/${groupId}/?token=${token}`;
        
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            console.log("✅ WebSocket Connected!");
            setIsConnected(true);
        };

        ws.current.onclose = (event) => {
            console.log("❌ WebSocket Disconnected!", event.reason);
            setIsConnected(false);
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            // Route the data based on what the backend is sending
            if (data.type === "history") {
                // Load historical messages all at once
                const loadedHistory = data.messages.map((msg: any) => ({
                    message: msg.message || msg.content || "...",
                    sender: msg.username || msg.sender || "System"
                }));
                setMessages(loadedHistory);
                
            } else if (data.type === "message" || !data.type) {
                // Add brand new messages to the bottom
                const normalizedData = {
                    message: data.message || data.text || "...", 
                    sender: data.sender || data.username || "System"
                };
                setMessages((prev) => [...prev, normalizedData]);
                
            } else if (data.type === "user_join" || data.type === "user_leave") {
                console.log(`${data.username} joined or left the chat.`);
            }
        };

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [groupId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && ws.current && isConnected) {
            ws.current.send(JSON.stringify({
                message: newMessage.trim(),
                text: newMessage.trim(),
                sender: currentUser,
                username: currentUser
            }));
            setNewMessage("");
        }
    };

    return (
        <div className="flex flex-col h-[500px] border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80">
                <h3 className="font-bold text-slate-800 dark:text-white">Live Study Chat</h3>
                <div className={`flex items-center gap-2 text-sm font-medium ${isConnected ? "text-emerald-600" : "text-red-500"}`}>
                    {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                    {isConnected ? "Connected" : "Disconnected"}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-400">
                        No messages yet. Say hello!
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const safeSender = msg.sender || msg.username || "System";
                        const isMe = safeSender === currentUser;
                        
                        return (
                            <div key={idx} className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                <Avatar className="w-8 h-8 shrink-0">
                                    <AvatarFallback className={isMe ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"}>
                                        {safeSender.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className={`p-3 rounded-2xl max-w-[75%] ${isMe ? "bg-blue-600 text-white rounded-tr-none" : "bg-slate-100 dark:bg-slate-700 dark:text-slate-200 rounded-tl-none"}`}>
                                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">{safeSender}</p>
                                    <p className="text-sm">{msg.message}</p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex gap-2">
                <Input 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)} 
                    placeholder="Type a message..." 
                    disabled={!isConnected}
                    className="focus-visible:ring-blue-500 dark:bg-slate-900"
                />
                <Button type="submit" disabled={!isConnected || !newMessage.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Send className="w-4 h-4" />
                </Button>
            </form>
        </div>
    );
}