import { useState, useEffect } from "react";
import {
  Search,
  User,
  Phone,
  Video,
  Plus,
  Image as ImageIcon,
  Smile,
  Send,
  Check,
  CheckCheck,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/services/api";

type Friend = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  online: boolean;
};

type Message = {
  id: string;
  text: string;
  time: string;
  fromMe: boolean;
  read?: boolean;
};

export default function DirectChat() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    api.get("/messages/friends/")
      .then(res => {
        if (Array.isArray(res.data)) {
          setFriends(res.data);
          if (res.data.length > 0 && !activeId) setActiveId(res.data[0].id);
        }
      })
      .catch(err => console.error("Failed to load chat friends", err));
  }, []);

  useEffect(() => {
    if (!activeId) return;
    api.get(`/messages/${activeId}/`)
      .then(res => {
        if (Array.isArray(res.data)) setMessages(res.data);
      })
      .catch(err => console.error("Failed to load messages", err));
  }, [activeId]);

  const activeFriend = friends.find((f) => f.id === activeId) || friends[0] || { id: "0", name: "Select a friend", online: false };
  const filtered = friends.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !activeId) return;
    
    api.post(`/messages/${activeId}/`, { text: draft.trim() })
      .then(res => {
        const data = res.data;
        if (data.id) {
          setMessages((m) => [...m, data]);
          setDraft("");
          
          setFriends(friends.map(f => {
            if (f.id === activeId) {
              return { ...f, lastMessage: data.text, time: data.time };
            }
            return f;
          }));
        }
      })
      .catch(err => console.error("Failed to send message", err));
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full bg-background text-foreground rounded-2xl overflow-hidden border border-border/60 shadow-xl">
      {/* ============== SIDEBAR ============== */}
      <aside className="w-80 flex-shrink-0 flex flex-col border-r border-border bg-slate-950">
        {/* Header / Search */}
        <div className="px-4 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground mb-3">Messages</h2>
          <div className="flex items-center gap-2 h-9 px-3 rounded-md bg-slate-900 border border-border">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        {/* Friend list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-6 py-10 text-center">
                <p className="text-sm text-muted-foreground">No conversations yet.</p>
                <Link to="/friends" className="text-xs text-primary mt-2 inline-block hover:underline">
                    Connect with friends →
                </Link>
            </div>
          ) : (
            <ul className="py-1">
              {filtered.map((friend) => {
                const isActive = friend.id === activeId;
                return (
                  <li key={friend.id}>
                    <button
                      onClick={() => setActiveId(friend.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left border-l-2 ${
                        isActive
                          ? "border-primary bg-primary/10"
                          : "border-transparent hover:bg-slate-900"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="h-10 w-10 rounded-full bg-slate-800 border border-border flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        {friend.online && (
                          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-sm font-medium truncate ${
                              isActive ? "text-primary" : "text-foreground"
                            }`}
                          >
                            {friend.name}
                          </p>
                          <span className="text-[11px] text-muted-foreground shrink-0">
                            {friend.time}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <p className="text-xs text-muted-foreground truncate">
                            {friend.lastMessage}
                          </p>
                          {friend.unread ? (
                            <span className="shrink-0 inline-flex items-center justify-center h-4 min-w-[1rem] px-1 rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                              {friend.unread}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {/* ============== MAIN CHAT ============== */}
      <section className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Header */}
        <header className="sticky top-0 z-10 h-16 flex items-center justify-between px-6 border-b border-border bg-background">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/friends" className="h-9 w-9 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-slate-900 border border-transparent mr-2 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="relative shrink-0">
              <div className="h-9 w-9 rounded-full bg-slate-800 border border-border flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <span
                className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${
                  activeFriend.online ? "bg-emerald-500" : "bg-slate-600"
                }`}
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {activeFriend.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {activeFriend.online ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex items-end gap-2 max-w-[70%] ${msg.fromMe ? "flex-row-reverse" : ""}`}>
                {!msg.fromMe && (
                  <div className="h-7 w-7 rounded-full bg-slate-800 border border-border flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <div
                    className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                      msg.fromMe
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-slate-800 text-foreground rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div
                    className={`mt-1 flex items-center gap-1 text-[10px] text-muted-foreground ${
                      msg.fromMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span>{msg.time}</span>
                    {msg.fromMe &&
                      (msg.read ? (
                        <CheckCheck className="h-3 w-3 text-primary" />
                      ) : (
                        <Check className="h-3 w-3" />
                      ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input area */}
        <form
          onSubmit={handleSend}
          className="sticky bottom-0 px-6 py-4 border-t border-border bg-background"
        >
          <div className="flex items-center gap-2 h-12 px-2 rounded-full bg-slate-900 border border-border">
            {/* Left actions */}
            <div className="flex items-center">
              <button
                type="button"
                aria-label="Add attachment"
                className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Send image"
                className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-slate-800"
              >
                <ImageIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Input */}
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Message ${activeFriend.name}…`}
              className="flex-1 h-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />

            {/* Right actions */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Insert emoji"
                className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-slate-800"
              >
                <Smile className="h-4 w-4" />
              </button>
              <button
                type="submit"
                disabled={!draft.trim()}
                aria-label="Send message"
                className="h-9 w-9 rounded-full flex items-center justify-center bg-primary text-primary-foreground hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
