import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios"; // 👈 Added axios for assignments
import { groupsAPI, userAPI } from "@/services/api"; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label"; 
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"; 
import { ArrowLeft, Users, FileText, MessageSquare, Upload, Send, Download, Calendar, Brain, CheckCircle, XCircle, Trophy, RefreshCw, ClipboardList } from "lucide-react"; // 👈 Added new icons
import { Progress } from "@/components/ui/progress";
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

export default function GroupDetail() {
  const params = useParams();
  const id = params.id || params.groupId; 
  const navigate = useNavigate();

  // Data States
  const [group, setGroup] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]); 
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Chat State
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  // UPLOAD POPUP STATES
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState("");

  // 👇 NEW: ASSIGNMENTS & QUIZ PLAYER STATES 👇
  const [assignedQuizzes, setAssignedQuizzes] = useState<any[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<any>(null); // Holds the quiz currently being played
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const groupRes = await groupsAPI.getById(id);
        setGroup(groupRes.data);

        const userRes = await userAPI.getProfile();
        setCurrentUser(userRes.data);

        fetchFiles();
        fetchAssignments(); // 👈 Load assignments!

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

  // 👇 NEW: FETCH ASSIGNMENTS
  const fetchAssignments = async () => {
      if (!id) return;
      try {
          const token = localStorage.getItem('access') || localStorage.getItem('token') || localStorage.getItem('access_token');
          const res = await axios.get(`http://localhost:8000/api/quizzes/assigned/?study_group=${id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setAssignedQuizzes(res.data.results || res.data || []);
      } catch (error) {
          console.error("Failed to fetch group assignments", error);
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

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const tempMsg = {
          id: Date.now(),
          sender: currentUser?.username || "Me",
          text: newMessage,
          timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempMsg]);
      setNewMessage("");
    }
  };

  // 👇 NEW: QUIZ PLAYER LOGIC 👇
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


  if (loading) return <div className="p-10 text-center">Loading Group...</div>;
  if (!group) return <div className="p-10 text-center">Group not found!</div>;

  return (
    <div className="space-y-6 animate-fade-in p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/groups")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{group.name}</h1>
          <p className="text-muted-foreground mt-1">{group.description}</p>
        </div>
        <Badge className="bg-primary text-primary-foreground text-lg px-4 py-1">
          Code: {group.join_code || "N/A"}
        </Badge>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Group Information</CardTitle>
          <CardDescription>
            Created on {group.created_at ? new Date(group.created_at).toLocaleDateString() : "Unknown Date"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{group.members ? group.members.length : 0} / {group.capacity} members</span>
          </div>
        </CardContent>
      </Card>

      {/* 👇 ADDED THE ASSIGNMENTS TAB TRIGGER */}
      <Tabs defaultValue="assignments" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assignments"><ClipboardList className="h-4 w-4 mr-2" /> Assignments</TabsTrigger>
            <TabsTrigger value="discussions"><MessageSquare className="h-4 w-4 mr-2" /> Discussions</TabsTrigger>
            <TabsTrigger value="files"><FileText className="h-4 w-4 mr-2" /> Files</TabsTrigger>
            <TabsTrigger value="members"><Users className="h-4 w-4 mr-2" /> Members</TabsTrigger>
        </TabsList>

        {/* 👇 NEW: ASSIGNMENTS TAB CONTENT 👇 */}
        <TabsContent value="assignments" className="space-y-4 mt-4">
          <Card className="border-border border-dashed border-2 bg-muted/20">
            <CardHeader>
              <CardTitle>Group Assignments</CardTitle>
              <CardDescription>Complete AI-generated quizzes assigned by your group leader.</CardDescription>
            </CardHeader>
            <CardContent>
                {assignedQuizzes.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No pending assignments right now. You're all caught up!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {assignedQuizzes.map((quiz) => (
                            <Card key={quiz.id} className="border-l-4 border-l-yellow-400 shadow-sm hover:shadow-md transition-all">
                                <CardContent className="p-5 flex flex-col justify-between h-full">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg">{quiz.title}</h3>
                                        </div>
                                        <Badge variant="outline" className="mb-3 bg-yellow-50 text-yellow-700 border-yellow-200">
                                            Due: {new Date(quiz.deadline).toLocaleDateString()}
                                        </Badge>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            By: <span className="font-medium text-foreground">{quiz.creator_name}</span>
                                        </p>
                                    </div>
                                    <Button 
                                        onClick={() => handleStartQuiz(quiz)} 
                                        className="w-full bg-slate-900 text-white hover:bg-slate-800"
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
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">Shared Files</CardTitle>
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-primary hover:bg-primary-dark text-primary-foreground">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload File
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Upload Study Material</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>File Title</Label>
                                <Input 
                                    placeholder="e.g. Calculus Notes" 
                                    value={fileTitle} 
                                    onChange={(e) => setFileTitle(e.target.value)} 
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Select File</Label>
                                <Input 
                                    type="file" 
                                    onChange={(e) => setFileToUpload(e.target.files ? e.target.files[0] : null)} 
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleUpload} disabled={uploading}>
                                {uploading ? "Uploading..." : "Upload"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
                {files.length === 0 ? (
                    <div className="space-y-3 text-center py-10 text-muted-foreground">
                        <p>No files uploaded yet.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {files.map((file: any) => (
                            <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <a href={file.file} target="_blank" rel="noreferrer" className="font-medium hover:underline">
                                            {file.title || "Untitled"}
                                        </a>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(file.uploaded_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
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

        {/* DISCUSSIONS TAB */}
        <TabsContent value="discussions" className="space-y-4 mt-4">
            <Card className="border-border">
                <CardHeader><CardTitle>Group Discussion</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-4 max-h-96 overflow-y-auto p-2">
                        {messages.length === 0 ? (
                            <p className="text-center text-muted-foreground">No messages yet.</p>
                        ) : (
                            messages.map((msg: any) => (
                                <div key={msg.id} className={`flex gap-3 ${msg.sender === currentUser?.username ? "flex-row-reverse" : ""}`}>
                                    <Avatar className="w-8 h-8"><AvatarFallback>{msg.sender[0]}</AvatarFallback></Avatar>
                                    <div className={`p-3 rounded-lg max-w-[80%] ${msg.sender === currentUser?.username ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                        <p className="text-xs opacity-70 mb-1">{msg.sender}</p>
                                        <p>{msg.text}</p>
                                    </div>
                                </div>
                            ))
                        )}
                     </div>
                     <div className="flex gap-2 pt-4 border-t">
                        <Textarea placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="min-h-[60px]" />
                        <Button onClick={handleSendMessage}><Send className="h-4 w-4" /></Button>
                     </div>
                </CardContent>
            </Card>
        </TabsContent>

        {/* MEMBERS TAB */}
        <TabsContent value="members" className="space-y-4 mt-4">
             <Card><CardContent className="p-4 text-center text-muted-foreground py-10">Members list coming from API...</CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* 👇 INTEGRATED QUIZ MODAL PLAYER 👇 */}
      <Dialog open={!!activeQuiz} onOpenChange={(open) => !open && setActiveQuiz(null)}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col overflow-y-auto">
            {activeQuiz && (
                <>
                {!showResult ? (
                    <div className="space-y-6 animate-in fade-in py-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold flex items-center gap-2"><Brain className="text-primary"/> {activeQuiz.title}</h2>
                            <Badge variant="outline">Q {currentQuestion + 1} / {activeQuiz.quiz_data.length}</Badge>
                        </div>
                        <Progress value={((currentQuestion) / activeQuiz.quiz_data.length) * 100} className="h-2" />
                        
                        <Card className="shadow-none border-0">
                            <CardHeader className="px-0">
                                <CardTitle className="text-xl leading-relaxed">
                                    <Latex>{activeQuiz.quiz_data[currentQuestion].question}</Latex>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 px-0">
                                {activeQuiz.quiz_data[currentQuestion].options.map((opt: string, i: number) => (
                                    <div key={i} onClick={() => !isAnswerChecked && setSelectedOption(opt)} 
                                         className={`p-4 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${getOptionStyle(opt)}`}>
                                        <span className="font-medium text-sm"><Latex>{opt}</Latex></span>
                                        {isAnswerChecked && opt === activeQuiz.quiz_data[currentQuestion].correct_answer && <CheckCircle className="text-green-600 h-5 w-5"/>}
                                        {isAnswerChecked && selectedOption === opt && opt !== activeQuiz.quiz_data[currentQuestion].correct_answer && <XCircle className="text-red-600 h-5 w-5"/>}
                                    </div>
                                ))}
                                
                                <div className="pt-6 flex justify-end">
                                    <Button onClick={isAnswerChecked ? handleNext : handleCheckAnswer} disabled={!selectedOption} className="bg-primary">
                                        {isAnswerChecked ? (currentQuestion + 1 === activeQuiz.quiz_data.length ? "Finish Quiz" : "Next Question") : "Check Answer"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in zoom-in-95">
                        <Trophy className="h-24 w-24 text-yellow-500 mb-4" />
                        <h1 className="text-4xl font-bold">Assignment Completed!</h1>
                        <p className="text-2xl text-muted-foreground">You scored <span className="text-primary font-bold">{score}</span> out of {activeQuiz.quiz_data.length}</p>
                        <Button onClick={() => setActiveQuiz(null)} variant="outline">
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