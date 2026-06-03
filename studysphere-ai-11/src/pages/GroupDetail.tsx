import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { groupsAPI, userAPI } from "@/services/api"; 
import api from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label"; 
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"; 
import { ArrowLeft, Users, FileText, MessageSquare, Upload, Download, Calendar, Brain, CheckCircle, XCircle, Trophy, RefreshCw, ClipboardList, Lock, LogIn } from "lucide-react"; 
import { Progress } from "@/components/ui/progress";
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

// 👇 IMPORT THE NEW WEBSOCKET CHAT COMPONENT
import GroupChat from "@/components/GroupChat"; 

// 👇 IMPORT THE ONBOARDING MODAL
import CodingOnboardingModal from "@/components/CodingOnboardingModal";

export default function GroupDetail() {
  const params = useParams();
  const id = params.id || params.groupId; 
  const navigate = useNavigate();

  // 👇 ADDED: Onboarding Modal State
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Data States
  const [group, setGroup] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]); 
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Members State
  const [membersList, setMembersList] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(true); 

  // Join Code State
  const [joinCode, setJoinCode] = useState("");

  // UPLOAD POPUP STATES
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState("");

  // ASSIGNMENTS & QUIZ PLAYER STATES
  const [assignedQuizzes, setAssignedQuizzes] = useState<any[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<any>(null); 
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

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
  }, [id]);

  const fetchFiles = async () => {
      if (!id) return;
      try {
          const res = await groupsAPI.getMaterials(id);
          setFiles(res.data.results || res.data || []);
      } catch (e) { console.error("File fetch error", e); }
  };

  const fetchAssignments = async () => {
      if (!id) return;
      try {
          const res = await api.get(`/quizzes/assigned/?study_group=${id}`);
          setAssignedQuizzes(res.data.results || res.data || []);
      } catch (error) {
          console.error("Failed to fetch group assignments", error);
      }
  };

  const fetchMembers = async () => {
      if (!id) return;
      setMembersLoading(true); 
      try {
          const res = await api.get(`/groups/${id}/members/`);
          setMembersList(res.data.results || res.data || []);
      } catch (error) {
          console.error("Failed to fetch members", error);
          setMembersList([]);
      } finally {
          setMembersLoading(false); 
      }
  };

  const handleUpload = async () => {
      if (!fileToUpload || !id || !fileTitle) {
          alert("Please select a file and enter a title!");
          return;
      }
      setUploading(true);
      try {
          await groupsAPI.uploadMaterial(fileTitle, fileToUpload, id);
          alert("File Uploaded Successfully! 🎉");
          setFileToUpload(null);
          setFileTitle("");
          setIsUploadOpen(false); 
          fetchFiles(); 
      } catch (err) {
          console.error(err);
          alert("Upload failed. Check console.");
      } finally {
          setUploading(false);
      }
  };

  const handleJoin = async () => {
    try {
      await groupsAPI.join(joinCode);
      alert("Unlocked Successfully! Welcome to the group.");
      setJoinCode("");
      const groupRes = await groupsAPI.getById(id!);
      setGroup(groupRes.data);
      fetchMembers(); 
    } catch (err: any) {
        alert(err.response?.data?.error || "Invalid Access Code");
    }
  };

  const handleStartQuiz = (quiz: any) => {
      setActiveQuiz(quiz);
      setCurrentQuestion(0);
      setScore(0);
      setShowResult(false);
      setIsAnswerChecked(false);
      setSelectedOption(null);
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
      setIsAnswerChecked(false);
      setSelectedOption(null);
    } else {
      setShowResult(true);
    }
  };

  const getOptionStyle = (option: string) => {
    if (!isAnswerChecked || !activeQuiz) return selectedOption === option ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border hover:bg-muted";
    const correct = activeQuiz.quiz_data[currentQuestion].correct_answer;
    if (option === correct) return "border-green-500 bg-green-50 text-green-700";
    if (option === selectedOption) return "border-red-500 bg-red-50 text-red-700";
    return "opacity-50";
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading Group...</div>;
  if (!group) return <div className="p-10 text-center text-slate-500">Group not found!</div>;

  // THE BOUNCER
  const currentUserId = currentUser?.id;
  const creatorId = group?.creator?.id || group?.creator;
  const isMemberInList = group?.members?.some((m: any) => m.id === currentUserId || m === currentUserId);
  const isAllowed = Boolean(currentUserId) && (isMemberInList || currentUserId === creatorId);

  if (!isAllowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 animate-in zoom-in duration-500">
        <Button variant="ghost" className="mb-6 self-start text-slate-500" onClick={() => navigate("/groups")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Directory
        </Button>
        <Card className="max-w-md w-full border-0 shadow-2xl p-8 text-center bg-white dark:bg-slate-800 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
          
          <div className="mx-auto w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Lock className="w-10 h-10 text-blue-600 dark:text-blue-400" /> 
          </div>
          
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">Private Group</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            You need to be a member of <strong className="text-slate-700 dark:text-slate-300">{group.name}</strong> to view its study materials, assignments, and discussions.
          </p>
          
          <div className="flex gap-2">
            <Input 
              placeholder="Enter Access Code..." 
              value={joinCode} 
              onChange={(e) => setJoinCode(e.target.value)} 
              className="h-11 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500"
            />
            <Button onClick={handleJoin} className="h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold">
              Unlock <LogIn className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/groups")} className="dark:border-slate-700 dark:hover:bg-slate-800">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{group.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{group.description}</p>
        </div>
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-lg px-4 py-1 border border-blue-200 dark:border-blue-800">
          Code: {group.join_code || "N/A"}
        </Badge>
      </div>

      {/* 👇 FORCED TO SHOW FOR TESTING: PORTAL ENTRY POINT */}
      <Card className="border-blue-500 bg-blue-900/10 shadow-sm mb-6">
          <CardContent className="flex items-center justify-between p-6">
              <div>
                  <CardTitle className="text-blue-500 dark:text-blue-400">Adaptive Coding Portal</CardTitle>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">Master {group.primary_topic || "DSA"} with AI-driven learning paths.</p>
              </div>
              <Button onClick={() => setShowOnboarding(true)} className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg font-bold">
                  Enter Portal 💻
              </Button>
          </CardContent>
      </Card>

      {/* 👇 ADDED: THE MODAL */}
      {showOnboarding && (
        <CodingOnboardingModal 
            groupId={id!} 
            groupTopic={group.primary_topic || "Array"} 
            onClose={() => setShowOnboarding(false)} 
        />
      )}

      <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-800 dark:text-white">Group Information</CardTitle>
          <CardDescription className="dark:text-slate-400">
            Created on {group.created_at ? new Date(group.created_at).toLocaleDateString() : "Unknown Date"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
            <Users className="h-4 w-4 text-blue-500" />
            <span>{membersList.length} / {group.capacity} members</span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            <TabsTrigger value="assignments" className="rounded-lg dark:data-[state=active]:bg-slate-800"><ClipboardList className="h-4 w-4 mr-2" /> Assignments</TabsTrigger>
            <TabsTrigger value="discussions" className="rounded-lg dark:data-[state=active]:bg-slate-800"><MessageSquare className="h-4 w-4 mr-2" /> Discussions</TabsTrigger>
            <TabsTrigger value="files" className="rounded-lg dark:data-[state=active]:bg-slate-800"><FileText className="h-4 w-4 mr-2" /> Files</TabsTrigger>
            <TabsTrigger value="members" className="rounded-lg dark:data-[state=active]:bg-slate-800"><Users className="h-4 w-4 mr-2" /> Members</TabsTrigger>
        </TabsList>

        {/* ASSIGNMENTS TAB */}
        <TabsContent value="assignments" className="space-y-4 mt-4">
          <Card className="border-slate-200 dark:border-slate-700 border-dashed border-2 bg-slate-50/50 dark:bg-slate-800/30 shadow-none">
            <CardHeader>
              <CardTitle className="dark:text-white">Group Assignments</CardTitle>
              <CardDescription className="dark:text-slate-400">Complete AI-generated quizzes assigned by your group leader.</CardDescription>
            </CardHeader>
            <CardContent>
                {assignedQuizzes.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No pending assignments right now. You're all caught up!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {assignedQuizzes.map((quiz) => (
                            <Card key={quiz.id} className="border-l-4 border-l-yellow-400 dark:bg-slate-800 shadow-sm hover:shadow-md transition-all dark:border-slate-700">
                                <CardContent className="p-5 flex flex-col justify-between h-full">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg dark:text-white">{quiz.title}</h3>
                                        </div>
                                        <Badge variant="outline" className="mb-3 bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900">
                                            Due: {new Date(quiz.deadline).toLocaleDateString()}
                                        </Badge>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                            By: <span className="font-medium text-slate-800 dark:text-slate-200">{quiz.creator_name}</span>
                                        </p>
                                    </div>
                                    <Button 
                                        onClick={() => handleStartQuiz(quiz)} 
                                        className="w-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700"
                                    >
                                        Take Quiz
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FILES TAB */}
        <TabsContent value="files" className="space-y-4 mt-4">
           <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-800 dark:text-white">Shared Files</CardTitle>
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload File
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="dark:bg-slate-800 dark:border-slate-700">
                        <DialogHeader>
                            <DialogTitle className="dark:text-white">Upload Study Material</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label className="dark:text-slate-300">File Title</Label>
                                <Input 
                                    placeholder="e.g. Calculus Notes" 
                                    value={fileTitle} 
                                    onChange={(e) => setFileTitle(e.target.value)} 
                                    className="dark:bg-slate-900 dark:border-slate-700"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label className="dark:text-slate-300">Select File</Label>
                                <Input 
                                    type="file" 
                                    onChange={(e) => setFileToUpload(e.target.files ? e.target.files[0] : null)} 
                                    className="dark:bg-slate-900 dark:border-slate-700"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleUpload} disabled={uploading} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {uploading ? "Uploading..." : "Upload"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
                {files.length === 0 ? (
                    <div className="space-y-3 text-center py-10 text-slate-500 dark:text-slate-400">
                        <p>No files uploaded yet.</p>
                    </div>
                ) : (
                    <div className="space-y-2 mt-4">
                        {files.map((file: any) => (
                            <div key={file.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <a href={file.file} target="_blank" rel="noreferrer" className="font-medium text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
                                            {file.title || "Untitled"}
                                        </a>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {new Date(file.uploaded_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 dark:hover:bg-slate-700" asChild>
                                    <a href={file.file} target="_blank" rel="noreferrer">
                                        <Download className="h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 👇 REAL-TIME WEBSOCKET DISCUSSIONS TAB */}
        <TabsContent value="discussions" className="mt-4">
            {id && currentUser ? (
               <GroupChat groupId={id} currentUser={currentUser.username} />
            ) : (
               <div className="text-center p-8 text-slate-500">Loading chat...</div>
            )}
        </TabsContent>

        {/* MEMBERS TAB */}
        <TabsContent value="members" className="space-y-4 mt-4">
             <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 shadow-sm">
                 <CardHeader>
                     <CardTitle className="dark:text-white">Group Members</CardTitle>
                 </CardHeader>
                 <CardContent>
                     {membersLoading ? (
                         <div className="text-center text-slate-500 dark:text-slate-400 py-10">
                             <RefreshCw className="h-8 w-8 mx-auto mb-3 opacity-50 animate-spin" />
                             <p>Loading members...</p>
                         </div>
                     ) : membersList.length === 0 ? (
                         <div className="text-center text-slate-500 dark:text-slate-400 py-10">
                             <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
                             <p>No members have joined yet.</p>
                         </div>
                     ) : (
                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                             {membersList.map((member: any) => (
                                 <div key={member.id} className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:shadow-md transition-all">
                                     <Avatar className="h-12 w-12 border-2 border-blue-100 dark:border-slate-600">
                                         <AvatarFallback className="bg-blue-600 text-white font-bold text-lg">
                                             {member.username ? member.username[0].toUpperCase() : '?'}
                                         </AvatarFallback>
                                     </Avatar>
                                     <div className="flex flex-col">
                                         <span className="font-bold text-lg text-slate-800 dark:text-white">{member.username}</span>
                                         {group?.creator === member.id && (
                                             <span className="text-[10px] bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500 px-2 py-0.5 rounded-full w-fit font-bold uppercase tracking-wider mt-1 border border-yellow-200 dark:border-yellow-900">
                                                 Admin
                                             </span>
                                         )}
                                     </div>
                                 </div>
                             ))}
                         </div>
                     )}
                 </CardContent>
             </Card>
        </TabsContent>
      </Tabs>

      {/* INTEGRATED QUIZ MODAL PLAYER */}
      <Dialog open={!!activeQuiz} onOpenChange={(open) => !open && setActiveQuiz(null)}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col overflow-y-auto dark:bg-slate-900 dark:border-slate-800">
            {activeQuiz && (
                <>
                {!showResult ? (
                    <div className="space-y-6 animate-in fade-in py-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold flex items-center gap-2 dark:text-white"><Brain className="text-blue-500"/> {activeQuiz.title}</h2>
                            <Badge variant="outline" className="dark:border-slate-700 dark:text-slate-300">Q {currentQuestion + 1} / {activeQuiz.quiz_data.length}</Badge>
                        </div>
                        <Progress value={((currentQuestion) / activeQuiz.quiz_data.length) * 100} className="h-2 bg-slate-100 dark:bg-slate-800" />
                        
                        <Card className="shadow-none border-0 bg-transparent">
                            <CardHeader className="px-0">
                                <CardTitle className="text-xl leading-relaxed dark:text-slate-200">
                                    <Latex>{activeQuiz.quiz_data[currentQuestion].question}</Latex>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 px-0">
                                {activeQuiz.quiz_data[currentQuestion].options.map((opt: string, i: number) => (
                                    <div key={i} onClick={() => !isAnswerChecked && setSelectedOption(opt)} 
                                         className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${getOptionStyle(opt)}`}>
                                        <span className="font-medium text-sm dark:text-slate-200"><Latex>{opt}</Latex></span>
                                        {isAnswerChecked && opt === activeQuiz.quiz_data[currentQuestion].correct_answer && <CheckCircle className="text-green-600 h-5 w-5"/>}
                                        {isAnswerChecked && selectedOption === opt && opt !== activeQuiz.quiz_data[currentQuestion].correct_answer && <XCircle className="text-red-600 h-5 w-5"/>}
                                    </div>
                                ))}
                                
                                <div className="pt-6 flex justify-end">
                                    <Button onClick={isAnswerChecked ? handleNext : handleCheckAnswer} disabled={!selectedOption} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                                        {isAnswerChecked ? (currentQuestion + 1 === activeQuiz.quiz_data.length ? "Finish Quiz" : "Next Question") : "Check Answer"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in zoom-in-95">
                        <Trophy className="h-24 w-24 text-yellow-500 mb-4 drop-shadow-lg" />
                        <h1 className="text-4xl font-extrabold dark:text-white">Assignment Completed!</h1>
                        <p className="text-2xl text-slate-500 dark:text-slate-400">You scored <span className="text-blue-600 dark:text-blue-400 font-black">{score}</span> out of {activeQuiz.quiz_data.length}</p>
                        <Button onClick={() => setActiveQuiz(null)} variant="outline" className="border-slate-300 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                            <RefreshCw className="h-4 w-4 mr-2"/> Close & Return to Group
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