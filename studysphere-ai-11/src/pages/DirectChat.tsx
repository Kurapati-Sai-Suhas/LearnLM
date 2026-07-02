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
  MessageSquare,
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
    <div className="flex h-[calc(100vh-4rem)] w-full font-sans rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl shadow-[0_0_60px_-10px_rgba(99,102,241,0.3)]">
      {/* ============== SIDEBAR ============== */}
      <aside className="relative w-80 flex-shrink-0 flex flex-col border-r border-white/[0.06] bg-black/40 backdrop-blur-2xl">
        {/* Right hairline glow */}
        <div className="pointer-events-none absolute top-0 right-0 h-full w-px bg-gradient-to-b from-transparent via-indigo-400/30 to-transparent" />

        {/* Header / Search */}
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-indigo-400" />
              Messages
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/25 bg-indigo-500/[0.08] backdrop-blur px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.18em] text-indigo-300">
              {filtered.length}
            </span>
          </div>
          <div className="flex items-center gap-2 h-10 px-3 rounded-lg bg-white/[0.03] border border-white/[0.08] focus-within:border-indigo-400/50 focus-within:shadow-[0_0_15px_rgba(99,102,241,0.25)] transition-all">
            <Search className="h-4 w-4 text-slate-500 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Friend list */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {filtered.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="h-14 w-14 mx-auto rounded-2xl border border-dashed border-white/10 bg-white/[0.02] flex items-center justify-center mb-3">
                <MessageSquare className="h-6 w-6 text-slate-500" />
              </div>
              <p className="text-sm text-slate-400">No conversations yet.</p>
              <Link
                to="/friends"
                className="text-xs text-indigo-300 hover:text-indigo-200 mt-2 inline-block hover:underline transition-colors"
              >
                Connect with friends →
              </Link>
            </div>
          ) : (
            <ul className="py-2 px-2 space-y-0.5">
              {filtered.map((friend) => {
                const isActive = friend.id === activeId;
                return (
                  <li key={friend.id}>
                    <button
                      onClick={() => setActiveId(friend.id)}
                      className={`group w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg border transition-all duration-200 ${
                        isActive
                          ? "border-indigo-400/30 bg-gradient-to-r from-indigo-500/15 to-indigo-500/5 shadow-[0_0_18px_rgba(99,102,241,0.2),inset_0_1px_0_rgba(255,255,255,0.05)]"
                          : "border-transparent hover:bg-white/[0.03] hover:border-white/[0.06]"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className={`h-10 w-10 rounded-full border flex items-center justify-center transition-all ${
                          isActive
                            ? "border-indigo-400/40 bg-gradient-to-br from-indigo-500/30 to-indigo-700/20 shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                            : "border-white/[0.08] bg-white/[0.03]"
                        }`}>
                          <User className={`h-5 w-5 ${isActive ? "text-indigo-200" : "text-slate-400"}`} />
                        </div>
                        {friend.online && (
                          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-black shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-sm font-medium truncate tracking-tight ${
                              isActive ? "text-indigo-200" : "text-white"
                            }`}
                          >
                            {friend.name}
                          </p>
                          <span className="text-[10px] font-mono text-slate-500 shrink-0">
                            {friend.time}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <p className="text-xs text-slate-500 truncate">
                            {friend.lastMessage}
                          </p>
                          {friend.unread ? (
                            <span className="shrink-0 inline-flex items-center justify-center h-4 min-w-[1rem] px-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-[10px] font-semibold text-white shadow-[0_0_10px_rgba(99,102,241,0.6)]">
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
      <section className="flex-1 flex flex-col min-w-0 bg-transparent">
        {/* Header */}
        <header className="sticky top-0 z-10 h-16 flex items-center justify-between px-6 border-b border-white/[0.06] bg-black/40 backdrop-blur-2xl">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/friends"
              className="h-9 w-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-200 hover:bg-indigo-500/10 hover:border-indigo-400/30 border border-transparent mr-1 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="relative shrink-0">
              <div className="h-10 w-10 rounded-full border border-indigo-400/30 bg-gradient-to-br from-indigo-500/25 to-indigo-700/15 flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.35)]">
                <User className="h-5 w-5 text-indigo-200" />
              </div>
              <span
                className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-black ${
                  activeFriend.online
                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"
                    : "bg-slate-600"
                }`}
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate tracking-tight">
                {activeFriend.name}
              </p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                {activeFriend.online ? (
                  <>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </span>
                    <span className="text-emerald-300">Online</span>
                  </>
                ) : (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                    <span>Offline</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              aria-label="Voice call"
              className="h-9 w-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-200 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-400/30 transition-all"
            >
              <Phone className="h-4 w-4" />
            </button>
            <button
              aria-label="Video call"
              className="h-9 w-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-200 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-400/30 transition-all"
            >
              <Video className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] flex items-center justify-center mb-3">
                <MessageSquare className="h-6 w-6 text-slate-500" />
              </div>
              <p className="text-sm text-slate-400">Send a message to start the conversation.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex animate-in fade-in slide-in-from-bottom-1 duration-300 ${
                  msg.fromMe ? "justify-end" : "justify-start"
                }`}
              >
                <div className={`flex items-end gap-2 max-w-[70%] ${msg.fromMe ? "flex-row-reverse" : ""}`}>
                  {!msg.fromMe && (
                    <div className="h-7 w-7 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center shrink-0">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                  )}
                  <div>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed border backdrop-blur transition-all ${
                        msg.fromMe
                          ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-br-sm border-indigo-400/40 shadow-[0_0_20px_rgba(99,102,241,0.35)]"
                          : "bg-white/[0.04] text-white rounded-bl-sm border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <div
                      className={`mt-1 flex items-center gap-1 text-[10px] font-mono text-slate-500 ${
                        msg.fromMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span>{msg.time}</span>
                      {msg.fromMe &&
                        (msg.read ? (
                          <CheckCheck className="h-3 w-3 text-indigo-300 drop-shadow-[0_0_4px_rgba(99,102,241,0.7)]" />
                        ) : (
                          <Check className="h-3 w-3" />
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input area */}
        <form
          onSubmit={handleSend}
          className="sticky bottom-0 px-6 py-4 border-t border-white/[0.06] bg-black/40 backdrop-blur-2xl"
        >
          <div className="flex items-center gap-2 h-12 px-2 rounded-full bg-white/[0.03] backdrop-blur border border-white/[0.08] focus-within:border-indigo-400/50 focus-within:shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all">
            {/* Left actions */}
            <div className="flex items-center">
              <button
                type="button"
                aria-label="Add attachment"
                className="h-9 w-9 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-200 hover:bg-indigo-500/10 transition-all"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Send image"
                className="h-9 w-9 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-200 hover:bg-indigo-500/10 transition-all"
              >
                <ImageIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Input */}
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Message ${activeFriend.name}…`}
              className="flex-1 h-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />

            {/* Right actions */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Insert emoji"
                className="h-9 w-9 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-200 hover:bg-indigo-500/10 transition-all"
              >
                <Smile className="h-4 w-4" />
              </button>
              <button
                type="submit"
                disabled={!draft.trim()}
                aria-label="Send message"
                className="h-9 w-9 rounded-full flex items-center justify-center bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white border border-indigo-400/40 shadow-[0_0_15px_rgba(99,102,241,0.55)] hover:shadow-[0_0_25px_rgba(99,102,241,0.75)] disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed transition-all"
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
