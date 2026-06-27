import { useState, useEffect } from "react";
import api, { groupsAPI, aiAPI, userAPI } from "@/services/api"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Brain, Upload, Loader2, CheckCircle, XCircle, Trophy, RefreshCw, Users, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

export default function AIQuiz() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [topic, setTopic] = useState("");
  const [isConfigMode, setIsConfigMode] = useState(false); 
  const [loading, setLoading] = useState(false);

  const [showEditMode, setShowEditMode] = useState(false);
  const [editableQuiz, setEditableQuiz] = useState<any[]>([]);
  const [deadline, setDeadline] = useState("");
  const [assignedQuizzes, setAssignedQuizzes] = useState<any[]>([]);

  const [quizData, setQuizData] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
        try {
            const userRes = await userAPI.getProfile();
            setCurrentUser(userRes.data);

            const groupsRes = await groupsAPI.getAll();
            setGroups(groupsRes.data.results || groupsRes.data || []);
        } catch (err) {
            console.error("Failed to load initial data", err);
        }
    };
    loadInitialData();
  }, []);

  const handleGroupChange = async (groupId: string) => {
    const groupObj = groups.find(g => String(g.id) === String(groupId));
    setSelectedGroup(groupObj);
    
    setFiles([]); 
    setAssignedQuizzes([]);
    
    try {
        const res = await groupsAPI.getMaterials(groupId);
        setFiles(res.data.results || res.data || []);

        const quizRes = await api.get(`/quizzes/assigned/?study_group=${groupId}`);
        setAssignedQuizzes(quizRes.data.results || quizRes.data || []);
    } catch (error) {
        console.error("Failed to load group data", error);
    }
  };

  const handleGenerateQuiz = async (actionType: 'self' | 'assign') => {
    if (!selectedMaterialId) return alert("Please select a file!");
    
    setLoading(true);
    try {
      const res = await aiAPI.generateQuiz(selectedMaterialId, topic || "General", 5, "Medium");
      let generatedQuiz = res.data.quiz || res.data || [];
      
      // Handle case where LLM wrapped the array in an object (e.g. {"quiz": [...]})
      if (generatedQuiz && !Array.isArray(generatedQuiz)) {
          if (generatedQuiz.quiz && Array.isArray(generatedQuiz.quiz)) {
              generatedQuiz = generatedQuiz.quiz;
          } else if (generatedQuiz.questions && Array.isArray(generatedQuiz.questions)) {
              generatedQuiz = generatedQuiz.questions;
          } else {
              const firstArray = Object.values(generatedQuiz).find(v => Array.isArray(v));
              generatedQuiz = firstArray || [];
          }
      }
      
      if (!Array.isArray(generatedQuiz) || generatedQuiz.length === 0) {
        alert("AI could not generate questions. Try a different file.");
        setLoading(false);
        return;
      }

      if (actionType === 'assign') {
          setEditableQuiz(generatedQuiz);
          setShowEditMode(true);
          setIsConfigMode(false);
      } else {
          setQuizData(generatedQuiz);
          setCurrentQuestion(0);
          setScore(0);
          setShowResult(false);
          setIsAnswerChecked(false);
          setSelectedOption(null);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate quiz. Check backend.");
    } finally {
      setLoading(false);
    }
  };

const handleAssignQuizToGroup = async () => {
      if (!deadline) return alert("Please set a deadline for the students!");
      if (!selectedGroup) return;

      try {
          await api.post('/quizzes/assign/', {
              study_group: selectedGroup.id,
              topic: `${topic || "General"} Assignment`,
              quiz_data: editableQuiz,
              deadline: deadline
          });

          alert("✅ Quiz successfully assigned to the group!");
          setShowEditMode(false);
          setDeadline("");
          handleGroupChange(selectedGroup.id);
          
      } catch (error: any) {
          console.error("Assignment Error Payload:", error.response?.data);
          const errorData = error.response?.data;
          let errorMsg = "Failed to assign quiz.";
          
          if (errorData) {
              if (errorData.error) {
                  errorMsg = errorData.error;
              } else if (typeof errorData === 'object') {
                  const firstKey = Object.keys(errorData)[0];
                  errorMsg = `${firstKey.toUpperCase()}: ${errorData[firstKey]}`;
              }
          }
          
          alert(`Error: ${errorMsg}`);
      }
  };
  
  const handleStartAssignedQuiz = (quizItem: any) => {
      setQuizData(quizItem.quiz_data);
      setCurrentQuestion(0);
      setScore(0);
      setShowResult(false);
      setIsAnswerChecked(false);
      setSelectedOption(null);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    const correct = quizData[currentQuestion].correct_answer;
    if (selectedOption === correct) setScore(score + 1);
    setIsAnswerChecked(true);
  };

  const handleNext = () => {
    if (currentQuestion + 1 < quizData.length) {
      setCurrentQuestion(currentQuestion + 1);
      setIsAnswerChecked(false);
      setSelectedOption(null);
    } else {
      setShowResult(true);
    }
  };

  const getOptionStyle = (option: string) => {
    if (!isAnswerChecked) return selectedOption === option ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border hover:bg-muted";
    const correct = quizData[currentQuestion].correct_answer;
    if (option === correct) return "border-green-500 bg-green-50 text-green-700";
    if (option === selectedOption) return "border-red-500 bg-red-50 text-red-700";
    return "opacity-50";
  };

  if (showEditMode) {
      return (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold flex items-center gap-2"><Users className="text-blue-600"/> Review & Assign Quiz</h2>
                  <Badge variant="secondary" className="text-sm">Teacher Mode</Badge>
              </div>
              <p className="text-muted-foreground mb-6">Edit the AI-generated questions below, set a deadline, and deploy it to your study group.</p>

              {editableQuiz.map((q, index) => (
                  <Card key={index} className="mb-6 border-l-4 border-l-blue-500 shadow-sm">
                      <CardContent className="p-6 space-y-4">
                          <label className="block font-bold text-sm text-muted-foreground uppercase tracking-wide">Question {index + 1}</label>
                          <textarea 
                              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                              rows={2}
                              value={q.question}
                              onChange={(e) => {
                                  const updatedQuiz = [...editableQuiz];
                                  updatedQuiz[index].question = e.target.value;
                                  setEditableQuiz(updatedQuiz);
                              }}
                          />
                          <div className="grid grid-cols-2 gap-3">
                              {q.options.map((opt: string, i: number) => (
                                  <div key={i} className={`p-2 border rounded text-sm ${opt === q.correct_answer ? 'bg-green-50 border-green-200 text-green-800 font-medium' : 'bg-gray-50 text-gray-600'}`}>
                                      {opt === q.correct_answer && "✅ "} {opt}
                                  </div>
                              ))}
                          </div>
                      </CardContent>
                  </Card>
              ))}

              <Card className="bg-blue-50/50 border-blue-200">
                  <CardContent className="p-6 flex flex-col md:flex-row gap-4 items-end">
                      <div className="flex-1 w-full space-y-2">
                          <label className="block font-bold flex items-center gap-2"><Calendar className="h-4 w-4"/> Set Deadline</label>
                          <input 
                              type="datetime-local" 
                              className="w-full p-3 border rounded-md"
                              value={deadline}
                              onChange={(e) => setDeadline(e.target.value)}
                          />
                      </div>
                      <div className="flex gap-3 w-full md:w-auto">
                          <Button variant="outline" onClick={() => setShowEditMode(false)} className="w-full md:w-auto p-6">Cancel</Button>
                          <Button onClick={handleAssignQuizToGroup} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white p-6">
                              Assign to Group
                          </Button>
                      </div>
                  </CardContent>
              </Card>
          </div>
      );
  }

  if (quizData.length > 0 && !showResult) {
      return (
        <div className="max-w-3xl mx-auto space-y-6 p-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2"><Brain className="text-primary"/> AI Quiz</h2>
              <Badge variant="outline">Q {currentQuestion + 1} / {quizData.length}</Badge>
          </div>
          <Progress value={((currentQuestion) / quizData.length) * 100} className="h-2" />
          
          <Card className="shadow-lg border-2">
              <CardHeader>
                  <CardTitle className="text-xl leading-relaxed">
                      <Latex>{quizData[currentQuestion].question}</Latex>
                  </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                  {quizData[currentQuestion].options.map((opt: string, i: number) => (
                      <div key={i} onClick={() => !isAnswerChecked && setSelectedOption(opt)} 
                           className={`p-4 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${getOptionStyle(opt)}`}>
                          <span className="font-medium text-sm"><Latex>{opt}</Latex></span>
                          {isAnswerChecked && opt === quizData[currentQuestion].correct_answer && <CheckCircle className="text-green-600 h-5 w-5"/>}
                          {isAnswerChecked && selectedOption === opt && opt !== quizData[currentQuestion].correct_answer && <XCircle className="text-red-600 h-5 w-5"/>}
                      </div>
                  ))}
                  
                  <div className="pt-6 flex justify-between items-center">
                      <Button onClick={isAnswerChecked ? handleNext : handleCheckAnswer} disabled={!selectedOption} className="bg-primary ml-auto text-white">
                          {isAnswerChecked ? (currentQuestion + 1 === quizData.length ? "Finish Quiz" : "Next Question") : "Check Answer"}
                      </Button>
                  </div>
              </CardContent>
          </Card>
        </div>
      );
  }

  if (showResult) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in zoom-in-95">
              <Trophy className="h-24 w-24 text-yellow-500 mb-4" />
              <h1 className="text-4xl font-bold">Quiz Completed!</h1>
              <p className="text-2xl text-muted-foreground">You scored <span className="text-primary font-bold">{score}</span> out of {quizData.length}</p>
              <div className="flex gap-4">
                  <Button onClick={() => { setQuizData([]); setShowResult(false); setIsConfigMode(false); }} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2"/> Back to Dashboard
                  </Button>
              </div>
          </div>
      );
  }

  const isGroupCreator = selectedGroup?.creator === currentUser?.id || selectedGroup?.creator?.id === currentUser?.id;

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Quiz Generator</h1>
        <p className="text-muted-foreground mt-1">Test your knowledge or assign quizzes to your study groups.</p>
      </div>

      <Card className="border-border border-dashed border-2 bg-muted/50 transition-all">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center max-w-lg mx-auto">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Generate New Quiz</h3>
            
            {!isConfigMode ? (
                <>
                    <p className="text-sm text-muted-foreground mb-4 max-w-md">
                    Upload study materials and let AI create customized quizzes for you.
                    </p>
                    <Button onClick={() => setIsConfigMode(true)} className="bg-primary hover:bg-primary-dark text-primary-foreground">
                    <Brain className="h-4 w-4 mr-2" />
                    Create Quiz
                    </Button>
                </>
            ) : (
                <div className="w-full space-y-4 bg-background p-6 rounded-lg border shadow-sm text-left animate-in slide-in-from-bottom-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Study Group</label>
                        <Select onValueChange={handleGroupChange}>
                            <SelectTrigger><SelectValue placeholder="Pick a Group" /></SelectTrigger>
                            <SelectContent>{groups.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Document</label>
                        <Select onValueChange={setSelectedMaterialId} disabled={!selectedGroup}>
                            <SelectTrigger><SelectValue placeholder={files.length === 0 ? "Select Group First" : "Pick a File"} /></SelectTrigger>
                            <SelectContent>{files.map(f => <SelectItem key={f.id} value={String(f.id)}>{f.title}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Topic (Optional)</label>
                        <Input placeholder="e.g. Thermodynamics" value={topic} onChange={e => setTopic(e.target.value)} />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsConfigMode(false)} className="w-full sm:w-auto">Cancel</Button>
                        
                        <Button 
                            onClick={() => handleGenerateQuiz('self')} 
                            disabled={loading || !selectedMaterialId} 
                            variant="secondary"
                            className="w-full font-semibold"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Brain className="mr-2 h-4 w-4"/>} 
                            Self Study
                        </Button>

                        {isGroupCreator && (
                            <Button 
                                onClick={() => handleGenerateQuiz('assign')} 
                                disabled={loading || !selectedMaterialId} 
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                            >
                                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Users className="mr-2 h-4 w-4"/>} 
                                Assign to Group
                            </Button>
                        )}
                    </div>
                </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedGroup && assignedQuizzes.length > 0 && !isConfigMode && (
          <div className="mt-12 animate-in slide-in-from-bottom-4">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="text-blue-500"/> Pending Assignments
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignedQuizzes.map((quiz) => (
                      <Card key={quiz.id} className="border-l-4 border-l-yellow-400 hover:shadow-md transition-all">
                          <CardContent className="p-5 flex flex-col justify-between h-full">
                              <div>
                                  <div className="flex justify-between items-start mb-2">
                                      <h3 className="font-bold text-lg">{quiz.name || quiz.title || "Assignment"}</h3>
                                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                          Due: {new Date(quiz.deadline).toLocaleDateString()}
                                      </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-4">
                                      Assigned by: <span className="font-medium text-foreground">{quiz.creator_name}</span>
                                  </p>
                              </div>
                              <Button 
                                  onClick={() => handleStartAssignedQuiz(quiz)} 
                                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                              >
                                  Start Assignment
                              </Button>
                          </CardContent>
                      </Card>
                  ))}
              </div>
          </div>
      )}

    </div>
  );
}