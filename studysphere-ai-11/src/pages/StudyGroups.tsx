import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  LogIn,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Shield,
  ArrowRight,
  Globe2,
  Plus,
  
} from "lucide-react";
import api, { groupsAPI } from "@/services/api";

export default function StudyGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination State
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  // Inputs
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [newGroupCode, setNewGroupCode] = useState("");
  const [newGroupCapacity, setNewGroupCapacity] = useState(10);
  const [joinCode, setJoinCode] = useState("");

  const fetchGroups = async (pageNum: number) => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("groups/", { params: { page: pageNum } });
      const data = response.data;
      setGroups(data.results || []);
      setHasNext(!!data.next);
      setHasPrev(!!data.previous);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups(page);
  }, [page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await groupsAPI.create({
        name: newGroupName,
        description: newGroupDesc,
        join_code: newGroupCode,
        capacity: newGroupCapacity,
      });
      alert("Group Created! 🎉");
      setNewGroupName("");
      setNewGroupDesc("");
      setNewGroupCode("");
      setNewGroupCapacity(10);
      setPage(1);
      fetchGroups(1);
    } catch (err) {
      alert("Error creating group.");
    }
  };

  const handleJoin = async () => {
    try {
      await groupsAPI.join(joinCode);
      alert("Joined Successfully!");
      setJoinCode("");
      fetchGroups(page);
    } catch (err: any) {
      alert(err.response?.data?.error || "Error joining group");
    }
  };

  // Reusable premium token classes
  const glassCard =
    "relative overflow-hidden border-border/60 bg-card/40 backdrop-blur-md " +
    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]";

  const sleekInput =
    "h-10 bg-background/40 backdrop-blur border-border/60 text-foreground " +
    "placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-primary/60 " +
    "focus-visible:border-primary/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] " +
    "transition-all duration-200";

  if (loading && groups.length === 0)
    return (
      <div
        data-testid="groups-loading"
        className="flex justify-center items-center h-[60vh]"
      >
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-border/60" />
          <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-transparent border-t-primary animate-spin shadow-[0_0_25px_rgba(59,130,246,0.4)]" />
        </div>
      </div>
    );

  return (
    <div
      data-testid="study-groups-page"
      className="relative space-y-8 p-6 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500"
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-20 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-32 right-0 h-[320px] w-[320px] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      {/* HERO */}
      <div
        data-testid="groups-hero"
        className={`animate-in slide-in-from-bottom-4 fade-in duration-500 rounded-2xl border p-8 md:p-10 ${glassCard}`}
      >
        {/* faint grid */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 backdrop-blur px-3 py-1 text-xs font-medium text-muted-foreground">
            
            Collaborative learning
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground">
            Study{" "}
            <span className="bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
              Groups
            </span>
          </h1>
          <p className="mt-3 text-base md:text-lg text-muted-foreground">
            Collaborate with your peers, share study materials, and conquer your exams together.
          </p>
        </div>
      </div>

      {/* ERROR BAR */}
      {error && (
        <div
          data-testid="groups-error"
          className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur px-4 py-3 text-red-300"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-medium text-sm">{error}</span>
          <Button
            data-testid="groups-error-retry"
            variant="outline"
            size="sm"
            className="ml-auto h-8 border-red-500/40 bg-background/40 text-red-200 hover:bg-red-500/10 hover:text-red-100"
            onClick={() => fetchGroups(page)}
          >
            Retry
          </Button>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-12">
        {/* LEFT COLUMN — Control Panel */}
        <div className="md:col-span-4 lg:col-span-3">
          <Card
            data-testid="group-menu-card"
            className={`sticky top-6 ${glassCard}`}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                Group Menu
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-6">
              <Tabs defaultValue="join">
                {/* Premium segmented control */}
                <TabsList
                  data-testid="group-menu-tabs"
                  className="relative grid w-full grid-cols-2 mb-6 h-10 p-1 rounded-lg bg-background/40 backdrop-blur border border-border/60"
                >
                  <TabsTrigger
                    data-testid="tab-join"
                    value="join"
                    className="relative rounded-md text-sm font-medium text-muted-foreground
                      data-[state=active]:text-foreground
                      data-[state=active]:bg-card
                      data-[state=active]:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_0_18px_rgba(59,130,246,0.25)]
                      transition-all duration-300"
                  >
                    <LogIn className="w-3.5 h-3.5 mr-1.5" />
                    Join
                  </TabsTrigger>
                  <TabsTrigger
                    data-testid="tab-create"
                    value="create"
                    className="relative rounded-md text-sm font-medium text-muted-foreground
                      data-[state=active]:text-foreground
                      data-[state=active]:bg-card
                      data-[state=active]:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_0_18px_rgba(59,130,246,0.25)]
                      transition-all duration-300"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Create
                  </TabsTrigger>
                </TabsList>

                {/* JOIN */}
                <TabsContent
                  value="join"
                  className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300"
                >
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium">
                      Access Code
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        data-testid="join-code-input"
                        placeholder="e.g. CS101"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        className={`${sleekInput} font-mono tracking-wider`}
                      />
                      <Button
                        data-testid="join-submit-btn"
                        onClick={handleJoin}
                        className="h-10 px-3 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(59,130,246,0.45)] hover:shadow-[0_0_25px_rgba(59,130,246,0.65)] transition-all"
                      >
                        <LogIn className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Ask the group owner for an invite code.
                    </p>
                  </div>
                </TabsContent>

                {/* CREATE */}
                <TabsContent
                  value="create"
                  className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300"
                >
                  <form
                    data-testid="create-group-form"
                    onSubmit={handleCreate}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium">
                        Group Name
                      </Label>
                      <Input
                        data-testid="create-name-input"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="e.g. Data Structures"
                        required
                        className={sleekInput}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium">
                        Description
                      </Label>
                      <Input
                        data-testid="create-desc-input"
                        value={newGroupDesc}
                        onChange={(e) => setNewGroupDesc(e.target.value)}
                        placeholder="What's this group about?"
                        required
                        className={sleekInput}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium">
                          Secret Code
                        </Label>
                        <Input
                          data-testid="create-code-input"
                          value={newGroupCode}
                          onChange={(e) => setNewGroupCode(e.target.value)}
                          placeholder="pass123"
                          required
                          className={`${sleekInput} font-mono`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium">
                          Capacity
                        </Label>
                        <Input
                          data-testid="create-capacity-input"
                          type="number"
                          min={1}
                          value={newGroupCapacity}
                          onChange={(e) => setNewGroupCapacity(Number(e.target.value))}
                          required
                          className={`${sleekInput} tabular-nums`}
                        />
                      </div>
                    </div>

                    <Button
                      data-testid="create-submit-btn"
                      type="submit"
                      className="w-full h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_18px_rgba(59,130,246,0.45)] hover:shadow-[0_0_28px_rgba(59,130,246,0.65)] transition-all duration-300 font-medium"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      Create Group
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN — Public Groups Grid */}
        <div className="md:col-span-8 lg:col-span-9 flex flex-col">
          {/* Section header */}
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-border/60 pb-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-primary" />
                Explore Public Groups
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Browse every group on the platform — join one with an access code.
              </p>
            </div>
            <div className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/40 backdrop-blur px-3 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              {groups.length} visible
            </div>
          </div>

          {/* Grid */}
          <div
            data-testid="groups-grid"
            className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
          >
            {groups.length === 0 && !error ? (
              <div
                data-testid="groups-empty-state"
                className="col-span-full flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed border-border/60 bg-card/30 backdrop-blur"
              >
                <div className="h-14 w-14 rounded-2xl border border-border/60 bg-background/40 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-base font-medium text-foreground">No groups found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create one or join with an access code from the menu.
                </p>
              </div>
            ) : (
              groups.map((group: any) => {
                const membersCount = group.members ? group.members.length : 0;
                const capacity = group.capacity || 10;
                const fillPct = Math.min(100, (membersCount / capacity) * 100);

                return (
                  <Link
                    to={`/groups/${group.id}`}
                    key={group.id}
                    data-testid={`group-card-${group.id}`}
                    className="group relative animate-in fade-in slide-in-from-bottom-2 duration-500"
                  >
                    {/* Outer glow on hover */}
                    <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-primary/0 via-primary/0 to-indigo-500/0 group-hover:from-primary/30 group-hover:via-primary/10 group-hover:to-indigo-500/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <Card
                      className={`relative h-full ${glassCard} transition-all duration-300
                        group-hover:border-primary/50
                        group-hover:-translate-y-0.5
                        group-hover:shadow-[0_8px_30px_rgba(59,130,246,0.18)]`}
                    >
                      {/* Top accent line */}
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/0 to-transparent group-hover:via-primary/80 transition-all duration-500" />

                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="truncate text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                            {group.name}
                          </CardTitle>
                          <div className="shrink-0 inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/40 backdrop-blur px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span className="tabular-nums text-foreground">{membersCount}</span>
                            <span>/ {capacity}</span>
                          </div>
                        </div>
                        <CardDescription className="line-clamp-2 mt-2 h-10 text-sm text-muted-foreground">
                          {group.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="pb-3">
                        {/* Members fill bar */}
                        <div className="h-1 w-full rounded-full bg-muted/40 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-400 shadow-[0_0_10px_rgba(59,130,246,0.6)] transition-[width] duration-500"
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>
                      </CardContent>

                      <CardFooter className="pt-3 pb-4 mt-auto flex justify-between items-center border-t border-border/60">
                        {/* High-tech Access Code Pill */}
                        <div
                          data-testid={`group-access-code-${group.id}`}
                          className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/[0.06] backdrop-blur px-2.5 py-1 text-xs font-mono tracking-wider text-emerald-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),0_0_12px_rgba(16,185,129,0.15)]"
                        >
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          </span>
                          <Shield className="w-3 h-3" />
                          {group.join_code}
                        </div>

                        <div className="h-7 w-7 rounded-full border border-border/60 bg-background/40 backdrop-blur text-muted-foreground flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:border-primary/60 group-hover:text-primary group-hover:shadow-[0_0_12px_rgba(59,130,246,0.5)] transition-all duration-300">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                );
              })
            )}
          </div>

          {/* PAGINATION */}
          <div
            data-testid="pagination-controls"
            className="flex items-center justify-center gap-3 mt-10"
          >
            <Button
              data-testid="pagination-prev"
              variant="outline"
              className="h-10 rounded-lg border-border/60 bg-card/40 backdrop-blur text-foreground hover:bg-card/60 hover:border-primary/50 hover:text-primary disabled:opacity-40 disabled:hover:border-border/60 disabled:hover:text-foreground transition-all"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!hasPrev}
            >
              <ChevronLeft className="w-4 h-4 mr-1.5" />
              Previous
            </Button>

            <div
              data-testid="pagination-current-page"
              className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/40 backdrop-blur px-4 py-2 text-sm font-medium text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
            >
              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Page
              </span>
              <span className="tabular-nums text-primary font-semibold">{page}</span>
            </div>

            <Button
              data-testid="pagination-next"
              variant="outline"
              className="h-10 rounded-lg border-border/60 bg-card/40 backdrop-blur text-foreground hover:bg-card/60 hover:border-primary/50 hover:text-primary disabled:opacity-40 disabled:hover:border-border/60 disabled:hover:text-foreground transition-all"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNext}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}