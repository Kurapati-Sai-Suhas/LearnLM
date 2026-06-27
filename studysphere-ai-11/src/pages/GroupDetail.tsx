import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { groupsAPI, userAPI } from "@/services/api";
import api from "@/services/api";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft, Users, FileText, MessageSquare, Upload, Download, Calendar, Brain,
  CheckCircle, XCircle, Trophy, RefreshCw, ClipboardList, Lock, LogIn, 
  Cpu, Shield, Crown, ArrowRight,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import "katex/dist/katex.min.css";
import Latex from "react-latex-next";
import GroupChat from "@/components/GroupChat";
export default function GroupDetail() {
  const params = useParams();
  const id = params.id || params.groupId;
  const navigate = useNavigate();

  const [group, setGroup] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [membersList, setMembersList] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);

  const [joinCode, setJoinCode] = useState("");

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState("");

  const [assignedQuizzes, setAssignedQuizzes] = useState<any[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

  const fetchFiles = useCallback(async () => {
    if (!id) return;
    try {
      const res = await groupsAPI.getMaterials(id);
      setFiles(res.data.results || res.data || []);
    } catch (e) { console.error("File fetch error", e); }
  }, [id]);

  const fetchAssignments = useCallback(async () => {
    if (!id) return;
    try {
      const res = await api.get(`/quizzes/assigned/?study_group=${id}`);
      setAssignedQuizzes(res.data.results || res.data || []);
    } catch (error) { console.error("Failed to fetch group assignments", error); }
  }, [id]);

  const fetchMembers = useCallback(async () => {
    if (!id) return;
    setMembersLoading(true);
    try {
      const res = await api.get(`/groups/${id}/members/`);
      setMembersList(res.data.results || res.data || []);
    } catch (error) {
      console.error("Failed to fetch members", error);
      setMembersList([]);
    } finally { setMembersLoading(false); }
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const userRes = await userAPI.getProfile();
        setCurrentUser(userRes.data);
        const groupRes = await groupsAPI.getById(id);
        setGroup(groupRes.data);
        fetchFiles();
        fetchAssignments();
        fetchMembers();
      } catch (error) {
        console.error("Failed to load group", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, fetchFiles, fetchAssignments, fetchMembers]);

  const handleUpload = async () => {
    if (!fileToUpload || !id || !fileTitle) { alert("Please select a file and enter a title!"); return; }
    setUploading(true);
    try {
      await groupsAPI.uploadMaterial(fileTitle, fileToUpload, id);
      alert("File Uploaded Successfully! 🎉");
      setFileToUpload(null); setFileTitle(""); setIsUploadOpen(false);
      fetchFiles();
    } catch (err) { console.error(err); alert("Upload failed. Check console."); }
    finally { setUploading(false); }
  };

  const handleJoin = async () => {
    try {
      await groupsAPI.join(joinCode);
      alert("Unlocked Successfully! Welcome to the group.");
      setJoinCode("");
      const groupRes = await groupsAPI.getById(id!);
      setGroup(groupRes.data);
      fetchMembers();
    } catch (err: any) { alert(err.response?.data?.error || "Invalid Access Code"); }
  };

  const handleStartQuiz = (quiz: any) => {
    setActiveQuiz(quiz); setCurrentQuestion(0); setScore(0);
    setShowResult(false); setIsAnswerChecked(false); setSelectedOption(null);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption || !activeQuiz) return;
    const correct = activeQuiz.quiz_data[currentQuestion].correct_answer;
    if (selectedOption === correct) setScore(score + 1);
    setIsAnswerChecked(true);
  };

  const handleNext = () => {
    if (currentQuestion + 1 < activeQuiz.quiz_data.length) {
      setCurrentQuestion(currentQuestion + 1);
      setIsAnswerChecked(false); setSelectedOption(null);
    } else { setShowResult(true); }
  };

  // Premium dark option styling (replaces light bg-green-50/bg-red-50)
  const getOptionStyle = (option: string) => {
    if (!isAnswerChecked || !activeQuiz) {
      return selectedOption === option
        ? "border-primary/60 bg-primary/10 ring-1 ring-primary/60 shadow-[0_0_18px_rgba(59,130,246,0.35)] text-foreground"
        : "border-border/60 bg-card/30 backdrop-blur hover:border-primary/40 hover:bg-card/50 text-foreground";
    }
    const correct = activeQuiz.quiz_data[currentQuestion].correct_answer;
    if (option === correct)
      return "border-emerald-500/50 bg-emerald-500/10 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.35)]";
    if (option === selectedOption)
      return "border-rose-500/50 bg-rose-500/10 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.35)]";
    return "border-border/40 bg-card/20 opacity-50 text-muted-foreground";
  };

  // Shared tokens
  const glassCard =
    "relative overflow-hidden border-border/60 bg-card/40 backdrop-blur-md " +
    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]";
  const sleekInput =
    "h-10 bg-background/40 backdrop-blur border-border/60 text-foreground " +
    "placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-primary/60 " +
    "focus-visible:border-primary/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] transition-all";
  const tabTrigger =
    "rounded-md text-sm font-medium text-muted-foreground " +
    "data-[state=active]:text-foreground data-[state=active]:bg-card " +
    "data-[state=active]:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_0_18px_rgba(59,130,246,0.25)] transition-all duration-300";
  const primaryGlowBtn =
    "bg-primary text-primary-foreground hover:bg-primary/90 " +
    "shadow-[0_0_18px_rgba(59,130,246,0.45)] hover:shadow-[0_0_28px_rgba(59,130,246,0.65)] transition-all font-medium";

  if (loading)
    return (
      <div data-testid="group-detail-loading" className="flex h-[70vh] items-center justify-center">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-border/60" />
          <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-transparent border-t-primary animate-spin shadow-[0_0_25px_rgba(59,130,246,0.4)]" />
        </div>
      </div>
    );
  if (!group)
    return <div className="p-10 text-center text-muted-foreground font-mono text-sm">Group not found!</div>;

  const currentUserId = currentUser?.id;
  const creatorId = group?.creator?.id || group?.creator;
  const isMemberInList = group?.members?.some((m: any) => m.id === currentUserId || m === currentUserId);
  const isAllowed = Boolean(currentUserId) && (isMemberInList || currentUserId === creatorId);

  // ================= BOUNCER =================
  if (!isAllowed) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-[80vh] p-8 animate-in zoom-in-95 fade-in duration-500">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-primary/15 blur-[120px]" />
        </div>

        <Button
          data-testid="bouncer-back-btn"
          variant="ghost"
          className="mb-6 self-start text-muted-foreground hover:text-foreground hover:bg-muted/40"
          onClick={() => navigate("/groups")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Directory
        </Button>

        <Card data-testid="bouncer-card" className={`max-w-md w-full p-8 text-center ${glassCard}`}>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
          <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-primary/25 blur-3xl" />

          <div className="relative mx-auto w-20 h-20 rounded-2xl border border-border/60 bg-background/40 backdrop-blur flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.35)]">
            <Lock className="w-9 h-9 text-primary" />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/40 backdrop-blur px-3 py-1 text-[11px] font-medium text-muted-foreground mb-4">
            <Shield className="h-3 w-3 text-primary" /> Restricted Access
          </div>

          <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-2">Private Group</h2>
          <p className="text-sm text-muted-foreground mb-8">
            You need to be a member of{" "}
            <strong className="text-foreground">{group.name}</strong> to view materials, assignments, and discussions.
          </p>

          <div className="flex gap-2">
            <Input
              data-testid="bouncer-code-input"
              placeholder="Enter Access Code…"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className={`${sleekInput} h-11 font-mono tracking-wider`}
            />
            <Button data-testid="bouncer-unlock-btn" onClick={handleJoin} className={`h-11 px-5 ${primaryGlowBtn}`}>
              Unlock <LogIn className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ================= MAIN =================
  return (
    <div data-testid="group-detail-page" className="relative space-y-6 p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-20 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-32 right-0 h-[320px] w-[320px] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button data-testid="back-btn" variant="outline" size="icon" onClick={() => navigate("/groups")}
          className="border-border/60 bg-card/40 backdrop-blur hover:border-primary/40 hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground truncate">{group.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
        </div>
        <div className="hidden md:inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/[0.06] backdrop-blur px-3 py-1.5 text-xs font-mono tracking-wider text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
          <Shield className="w-3 h-3" /> {group.join_code || "N/A"}
        </div>
      </div>



      {/* Group Info */}
      <Card data-testid="group-info-card" className={glassCard}>
        <CardHeader className="border-b border-border/60 pb-4">
          <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            Group Information
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Created on {group.created_at ? new Date(group.created_at).toLocaleDateString() : "Unknown Date"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 backdrop-blur px-3 py-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span className="tabular-nums text-foreground font-medium">{membersList.length}</span>
            <span>/ {group.capacity} members</span>
          </div>
        </CardContent>
      </Card>

      {/* TABS */}
      <Tabs defaultValue="members" className="w-full">
        <TabsList data-testid="group-tabs" className="grid w-full grid-cols-4 h-11 p-1 rounded-lg bg-card/40 backdrop-blur-md border border-border/60">
          <TabsTrigger data-testid="tab-assignments" value="assignments" className={tabTrigger}>
            <ClipboardList className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Assignments</span>
          </TabsTrigger>
          <TabsTrigger data-testid="tab-discussions" value="discussions" className={tabTrigger}>
            <MessageSquare className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Discussions</span>
          </TabsTrigger>
          <TabsTrigger data-testid="tab-files" value="files" className={tabTrigger}>
            <FileText className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Files</span>
          </TabsTrigger>
          <TabsTrigger data-testid="tab-members" value="members" className={tabTrigger}>
            <Users className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Members</span>
          </TabsTrigger>
        </TabsList>

        {/* ASSIGNMENTS */}
        <TabsContent value="assignments" className="space-y-4 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className={glassCard}>
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-base font-medium text-foreground">Group Assignments</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Complete AI-generated quizzes assigned by your group leader.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {assignedQuizzes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-14 w-14 mx-auto rounded-2xl border border-dashed border-border/60 flex items-center justify-center mb-3">
                    <Calendar className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No pending assignments. You're all caught up!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assignedQuizzes.map((quiz) => (
                    <Card key={quiz.id} data-testid={`quiz-card-${quiz.id}`}
                      className={`${glassCard} hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(59,130,246,0.18)] transition-all duration-300`}>
                      <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-amber-400/80 to-transparent" />
                      <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                        <div>
                          <h3 className="font-semibold text-foreground text-base mb-2">{quiz.title}</h3>
                          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur px-2.5 py-0.5 text-[11px] font-medium text-amber-300 mb-3">
                            <Calendar className="h-3 w-3" /> Due {new Date(quiz.deadline).toLocaleDateString()}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            By: <span className="text-foreground font-medium">{quiz.creator_name}</span>
                          </p>
                        </div>
                        <Button data-testid={`take-quiz-${quiz.id}`} onClick={() => handleStartQuiz(quiz)} className={`w-full h-9 ${primaryGlowBtn}`}>
                          Take Quiz <ArrowRight className="ml-2 h-3.5 w-3.5" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FILES */}
        <TabsContent value="files" className="space-y-4 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className={glassCard}>
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium text-foreground">Shared Files</CardTitle>
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="upload-trigger-btn" size="sm" className={`h-9 ${primaryGlowBtn}`}>
                      <Upload className="h-4 w-4 mr-2" /> Upload File
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card/95 backdrop-blur-xl border-border/60 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-foreground">Upload Study Material</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-1.5">
                        <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">File Title</Label>
                        <Input data-testid="upload-title-input" placeholder="e.g. Calculus Notes" value={fileTitle}
                          onChange={(e) => setFileTitle(e.target.value)} className={sleekInput} />
                      </div>
                      <div className="grid gap-1.5">
                        <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Select File</Label>
                        <Input data-testid="upload-file-input" type="file"
                          onChange={(e) => setFileToUpload(e.target.files ? e.target.files[0] : null)}
                          className={`${sleekInput} file:text-primary file:bg-transparent file:border-0 file:font-medium`} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button data-testid="upload-submit-btn" onClick={handleUpload} disabled={uploading} className={primaryGlowBtn}>
                        {uploading ? "Uploading…" : "Upload"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {files.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-14 w-14 mx-auto rounded-2xl border border-dashed border-border/60 flex items-center justify-center mb-3">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map((file: any) => (
                    <div key={file.id} data-testid={`file-row-${file.id}`}
                      className="group flex items-center justify-between gap-3 p-3 border border-border/60 bg-background/30 backdrop-blur rounded-lg hover:border-primary/40 hover:bg-background/50 transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-lg border border-border/60 bg-background/40 flex items-center justify-center shrink-0 group-hover:border-primary/40 group-hover:shadow-[0_0_12px_rgba(59,130,246,0.3)] transition-all">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <a href={file.file} target="_blank" rel="noreferrer"
                            className="block font-medium text-sm text-foreground hover:text-primary truncate transition-colors">
                            {file.title || "Untitled"}
                          </a>
                          <p className="text-xs text-muted-foreground">{new Date(file.uploaded_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10" asChild>
                        <a href={file.file} target="_blank" rel="noreferrer"><Download className="h-4 w-4" /></a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DISCUSSIONS */}
        <TabsContent value="discussions" className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {id && currentUser ? (
            <div className={`rounded-xl border ${glassCard} p-1`}>
              <GroupChat groupId={id} currentUser={currentUser.username} />
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground font-mono text-sm">Loading chat…</div>
          )}
        </TabsContent>

        {/* MEMBERS */}
        <TabsContent value="members" className="space-y-4 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className={glassCard}>
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-base font-medium text-foreground">Group Members</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {membersLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="h-7 w-7 mx-auto mb-3 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading members…</p>
                </div>
              ) : membersList.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-14 w-14 mx-auto rounded-2xl border border-dashed border-border/60 flex items-center justify-center mb-3">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No members have joined yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {membersList.map((member: any) => {
                    const isAdmin = group?.creator === member.id;
                    return (
                      <div key={member.id} data-testid={`member-${member.id}`}
                        className={`group flex items-center gap-3 p-4 rounded-xl ${glassCard} hover:border-primary/40 hover:-translate-y-0.5 transition-all`}>
                        {isAdmin && (
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />
                        )}
                        <Avatar className="h-11 w-11 ring-2 ring-border/60 group-hover:ring-primary/40 transition-all">
                          <AvatarFallback className="bg-primary/15 text-primary font-semibold text-base">
                            {member.username ? member.username[0].toUpperCase() : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-sm text-foreground truncate">{member.username}</span>
                          {isAdmin && (
                            <span className="mt-1 inline-flex items-center gap-1 w-fit rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.25)]">
                              <Crown className="h-2.5 w-2.5" /> Admin
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ============ QUIZ MODAL PLAYER ============ */}
      <Dialog open={!!activeQuiz} onOpenChange={(open) => !open && setActiveQuiz(null)}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col overflow-y-auto bg-card/95 backdrop-blur-xl border-border/60 shadow-[0_0_60px_rgba(59,130,246,0.25)]">
          {activeQuiz && (
            <>
              {!showResult ? (
                <div data-testid="quiz-player" className="space-y-6 animate-in fade-in py-2">
                  <div className="flex justify-between items-center gap-3">
                    <h2 className="text-xl md:text-2xl font-semibold flex items-center gap-2 text-foreground">
                      <Brain className="text-primary h-5 w-5" /> {activeQuiz.title}
                    </h2>
                    <Badge className="bg-primary/10 text-primary border border-primary/30 font-mono tracking-wider">
                      Q {currentQuestion + 1} / {activeQuiz.quiz_data.length}
                    </Badge>
                  </div>
                  <Progress value={(currentQuestion / activeQuiz.quiz_data.length) * 100}
                    className="h-1.5 bg-muted/40 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-indigo-400 [&>div]:shadow-[0_0_10px_rgba(59,130,246,0.6)]" />

                  <Card className="shadow-none border-0 bg-transparent">
                    <CardHeader className="px-0">
                      <CardTitle className="text-lg md:text-xl leading-relaxed text-foreground">
                        <Latex>{activeQuiz.quiz_data[currentQuestion].question}</Latex>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 px-0">
                      {activeQuiz.quiz_data[currentQuestion].options.map((opt: string, i: number) => (
                        <div key={i}
                          data-testid={`quiz-option-${i}`}
                          onClick={() => !isAnswerChecked && setSelectedOption(opt)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${getOptionStyle(opt)}`}>
                          <span className="font-medium text-sm flex items-center gap-3">
                            <span className="h-7 w-7 rounded-md border border-border/60 bg-background/40 backdrop-blur flex items-center justify-center text-xs font-mono text-muted-foreground shrink-0">
                              {String.fromCharCode(65 + i)}
                            </span>
                            <Latex>{opt}</Latex>
                          </span>
                          {isAnswerChecked && opt === activeQuiz.quiz_data[currentQuestion].correct_answer && (
                            <CheckCircle className="text-emerald-400 h-5 w-5 drop-shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                          )}
                          {isAnswerChecked && selectedOption === opt && opt !== activeQuiz.quiz_data[currentQuestion].correct_answer && (
                            <XCircle className="text-rose-400 h-5 w-5 drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]" />
                          )}
                        </div>
                      ))}

                      <div className="pt-6 flex justify-end">
                        <Button data-testid="quiz-action-btn"
                          onClick={isAnswerChecked ? handleNext : handleCheckAnswer}
                          disabled={!selectedOption}
                          className={`h-10 px-8 ${primaryGlowBtn} disabled:opacity-50 disabled:shadow-none`}>
                          {isAnswerChecked
                            ? currentQuestion + 1 === activeQuiz.quiz_data.length ? "Finish Quiz" : "Next Question"
                            : "Check Answer"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div data-testid="quiz-result" className="flex flex-col items-center justify-center h-full text-center space-y-5 animate-in zoom-in-95 fade-in duration-500">
                  <div className="relative">
                    <div className="absolute inset-0 bg-amber-400/30 blur-3xl rounded-full" />
                    <Trophy className="relative h-20 w-20 text-amber-400 drop-shadow-[0_0_25px_rgba(245,158,11,0.7)]" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">Assignment Completed!</h1>
                  <p className="text-lg text-muted-foreground">
                    You scored{" "}
                    <span className="text-primary font-semibold text-2xl tabular-nums">{score}</span>
                    <span className="text-muted-foreground"> / {activeQuiz.quiz_data.length}</span>
                  </p>
                  <Button onClick={() => setActiveQuiz(null)} variant="outline"
                    className="border-border/60 bg-card/40 backdrop-blur text-foreground hover:border-primary/50 hover:text-primary hover:bg-card/60">
                    <RefreshCw className="h-4 w-4 mr-2" /> Close & Return to Group
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}