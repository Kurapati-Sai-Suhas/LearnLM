import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Radio,
  RefreshCw,
  User,
  GitCommit,
  MessageSquare,
  Play,
  Terminal,
  Circle,
} from "lucide-react";

type Member = { id: string; name: string; role: string; color: string };

type Event = {
  id: string;
  type: "edit" | "join" | "message" | "run";
  who: string;
  text: string;
  time: string;
};

const MEMBERS: Member[] = [
  { id: "1", name: "Aarav Mehta",  role: "Editing line 24",  color: "bg-primary" },
  { id: "2", name: "Priya Sharma", role: "Viewing",           color: "bg-emerald-500" },
  { id: "3", name: "Daniel Park",  role: "Idle · 2m",         color: "bg-amber-500" },
  { id: "4", name: "Sara Khan",    role: "Editing line 41",   color: "bg-indigo-500" },
];

const EVENTS: Event[] = [
  { id: "e1", type: "edit",    who: "Aarav",  text: "edited consensus.py:24",          time: "Just now" },
  { id: "e2", type: "message", who: "Priya",  text: "Check the timeout in handleVote", time: "12s" },
  { id: "e3", type: "run",     who: "Sara",   text: "executed test suite — 14 passed", time: "48s" },
  { id: "e4", type: "join",    who: "Daniel", text: "joined the workspace",            time: "2m" },
  { id: "e5", type: "edit",    who: "Sara",   text: "edited raft.py:8",                time: "3m" },
];

const EVENT_META: Record<Event["type"], { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  edit:    { icon: GitCommit,      color: "text-primary"      },
  message: { icon: MessageSquare,  color: "text-indigo-300"   },
  run:     { icon: Play,           color: "text-emerald-300"  },
  join:    { icon: User,           color: "text-amber-300"    },
};

const SAMPLE_CODE = `# consensus.py — Raft Leader Election
import asyncio
from typing import List

class RaftNode:
    def __init__(self, node_id: int, peers: List[int]):
        self.id = node_id
        self.peers = peers
        self.term = 0
        self.voted_for = None
        self.state = "follower"

    async def request_vote(self, candidate_id: int, term: int):
        if term > self.term:
            self.term = term
            self.voted_for = candidate_id
            return True
        return False

    async def start_election(self):
        self.term += 1
        self.state = "candidate"
        votes = 1
        for peer in self.peers:
            granted = await self.send_vote_request(peer)
            if granted:
                votes += 1
        if votes > len(self.peers) // 2:
            self.state = "leader"`;

export default function LiveCollaborativeWorkspace() {
  const { groupId } = useParams();
  const [code, setCode] = useState(SAMPLE_CODE);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('access');
    if (!groupId || !token) return;

    const ws = new WebSocket(`ws://localhost:8000/ws/code/${groupId}/?token=${token}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.code !== undefined) {
          setCode(payload.code);
        }
      } catch (e) {
        console.error(e);
      }
    };

    return () => {
      ws.close();
    };
  }, [groupId]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ code: newCode }));
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* ============ HEADER ============ */}
        <Card className="relative overflow-hidden bg-card/40 backdrop-blur-md border-border/60">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />

          <CardContent className="relative flex items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-lg border border-border/60 bg-background/40 flex items-center justify-center">
                <Terminal className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                  Study Group
                </p>
                <h1 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2.5">
                  Distributed Systems
                  <Badge
                    data-testid="live-badge"
                    className="inline-flex items-center gap-1.5 border border-rose-500/40 bg-rose-500/15 text-rose-300 text-[10px] font-mono tracking-[0.18em] uppercase px-2 py-0.5 shadow-[0_0_15px_rgba(244,63,94,0.45)]"
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-400" />
                    </span>
                    Live
                  </Badge>
                </h1>
              </div>
            </div>

            <Button
              data-testid="sync-btn"
              className="relative h-9 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.7)] transition-all font-medium"
            >
              <span className="absolute inset-0 rounded-md bg-primary/30 blur-md animate-pulse" />
              <span className="relative inline-flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Sync Code
              </span>
            </Button>
          </CardContent>
        </Card>

        {/* ============ SPLIT PANE ============ */}
        <div className="grid gap-5 lg:grid-cols-12">
          {/* EDITOR */}
          <Card className="lg:col-span-8 bg-card/40 backdrop-blur-md border-border/60 overflow-hidden">
            {/* toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-background/40 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                </div>
                <div className="h-4 w-px bg-border/60" />
                <span className="text-xs font-mono text-muted-foreground">consensus.py</span>
              </div>

              {/* Collaborator cursors */}
              <div className="flex -space-x-1.5">
                {MEMBERS.slice(0, 3).map((m) => (
                  <div
                    key={m.id}
                    title={m.name}
                    className={`h-5 w-5 rounded-full ring-2 ring-background ${m.color} shadow-[0_0_10px_rgba(59,130,246,0.5)]`}
                  />
                ))}
              </div>
            </div>

            {/* code area */}
            <div className="relative">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
              <textarea
                data-testid="editor-textarea"
                value={code}
                onChange={handleCodeChange}
                spellCheck={false}
                className="relative w-full h-[460px] bg-[#070809] p-5 font-mono text-[13px] leading-relaxed text-slate-200
                  placeholder:text-muted-foreground focus:outline-none resize-none
                  selection:bg-primary/30"
              />
              {/* fake cursor markers */}
              <div className="pointer-events-none absolute top-[120px] left-[260px]">
                <div className="flex items-center">
                  <div className="h-4 w-0.5 bg-primary animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.9)]" />
                  <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-primary text-primary-foreground">
                    Aarav
                  </span>
                </div>
              </div>
              <div className="pointer-events-none absolute top-[260px] left-[180px]">
                <div className="flex items-center">
                  <div className="h-4 w-0.5 bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.9)]" />
                  <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-indigo-500 text-white">
                    Sara
                  </span>
                </div>
              </div>
            </div>

            {/* status strip */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-border/60 bg-background/40 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Radio className="h-3 w-3 text-emerald-400" />
                Synced · ws://learnlm
              </span>
              <span>Python · UTF-8 · LF</span>
            </div>
          </Card>

          {/* RIGHT PANE */}
          <div className="lg:col-span-4 space-y-5">
            {/* ACTIVE MEMBERS */}
            <Card className="bg-card/40 backdrop-blur-md border-border/60 overflow-hidden">
              <div className="border-b border-border/60 px-4 py-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                  Active Members
                </h3>
                <Badge variant="outline" className="text-[10px] font-mono border-border/60 text-muted-foreground">
                  {MEMBERS.length} online
                </Badge>
              </div>
              <CardContent className="p-2 space-y-1">
                {MEMBERS.map((m) => (
                  <div
                    key={m.id}
                    className="group flex items-center gap-3 px-2.5 py-2 rounded-md hover:bg-background/40 transition-colors"
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8 ring-1 ring-border/60">
                        <AvatarFallback className={`${m.color}/20 text-foreground text-xs font-semibold`}>
                          {m.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-card shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate leading-tight">
                        {m.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {m.role}
                      </p>
                    </div>
                    <Circle className="h-2 w-2 fill-emerald-400 text-emerald-400 opacity-60 group-hover:opacity-100" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* EVENT LOG */}
            <Card className="bg-card/40 backdrop-blur-md border-border/60 overflow-hidden">
              <div className="border-b border-border/60 px-4 py-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Radio className="h-3.5 w-3.5 text-primary animate-pulse" />
                  Live Activity
                </h3>
                <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-300">
                  streaming
                </span>
              </div>
              <CardContent className="p-3 space-y-3 max-h-[280px] overflow-y-auto">
                {EVENTS.map((ev, idx) => {
                  const meta = EVENT_META[ev.type];
                  const Icon = meta.icon;
                  return (
                    <div
                      key={ev.id}
                      className="flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-1 duration-300"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className={`h-6 w-6 rounded-md border border-border/60 bg-background/40 flex items-center justify-center shrink-0 ${meta.color}`}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-foreground leading-snug">
                          <span className="font-medium">{ev.who}</span>{" "}
                          <span className="text-muted-foreground">{ev.text}</span>
                        </p>
                        <p className="text-[10px] font-mono text-muted-foreground/70 mt-0.5">
                          {ev.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
