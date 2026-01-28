import { useState, useEffect } from "react";
import { groupsAPI, aiAPI } from "@/services/api"; // Import API
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Brain, Upload, Loader2, CheckCircle, XCircle, Trophy, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

export default function AIQuiz() {
  // --- STATE: DATA LOADING ---
  const [groups, setGroups] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  
  // --- STATE: SELECTION ---
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [topic, setTopic] = useState("");
  const [isConfigMode, setIsConfigMode] = useState(false); // Toggles the input form
  const [loading, setLoading] = useState(false);

  // --- STATE: QUIZ GAMEPLAY ---
  const [quizData, setQuizData] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

  // 1. Load Groups on Mount
  useEffect(() => {
    groupsAPI.getAll().then(res => setGroups(res.data.results || res.data || []));
  }, []);

  // 2. Load Files when Group Selected
  const handleGroupChange = async (groupId: string) => {
    setSelectedGroupId(groupId);
    setFiles([]); 
    const res = await groupsAPI.getMaterials(groupId);
    setFiles(res.data.results || res.data || []);
  };

  // 3. START QUIZ (Call Backend)
  const handleStartQuiz = async () => {
    if (!selectedMaterialId) return alert("Please select a file!");
    
    setLoading(true);
    try {
      // Call your Django API
      const res = await aiAPI.generateQuiz(selectedMaterialId, topic || "General", 5, "Medium");
      const generatedQuiz = res.data.quiz || res.data || [];
      
      if (generatedQuiz.length === 0) {
        alert("AI could not generate questions. Try a different file.");
      } else {
        setQuizData(generatedQuiz);
        // Reset Game
        setCurrentQuestion(0);
        setScore(0);
        setShowResult(false);
        setIsAnswerChecked(false);
        setSelectedOption(null);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to start quiz. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  // 4. GAMEPLAY LOGIC
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

  // Helper for Option Colors
  const getOptionStyle = (option: string) => {
    if (!isAnswerChecked) return selectedOption === option ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border hover:bg-muted";
    
    const correct = quizData[currentQuestion].correct_answer;
    if (option === correct) return "border-green-500 bg-green-50 text-green-700";
    if (option === selectedOption) return "border-red-500 bg-red-50 text-red-700";
    return "opacity-50";
  };


  // --- VIEW 1: QUIZ PLAYER (Active Game) ---
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
                    {isAnswerChecked && (
                        <div className="text-sm text-muted-foreground italic flex-1 mr-4 bg-muted p-2 rounded">
                            💡 {quizData[currentQuestion].explanation}
                        </div>
                    )}
                    <Button onClick={isAnswerChecked ? handleNext : handleCheckAnswer} disabled={!selectedOption} className="bg-primary ml-auto">
                        {isAnswerChecked ? (currentQuestion + 1 === quizData.length ? "Finish Quiz" : "Next Question") : "Check Answer"}
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>
    );
  }

  // --- VIEW 2: RESULTS SCREEN ---
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

  // --- VIEW 3: DASHBOARD (Your Original UI) ---
  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Quiz Generator</h1>
        <p className="text-muted-foreground mt-1">Test your knowledge with AI-generated quizzes</p>
      </div>

      {/* Upload/Generate Section */}
      <Card className="border-border border-dashed border-2 bg-muted/50 transition-all">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center max-w-lg mx-auto">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Generate New Quiz</h3>
            
            {!isConfigMode ? (
                // STATE A: Initial Button
                <>
                    <p className="text-sm text-muted-foreground mb-4 max-w-md">
                    Upload study materials and let AI create customized quizzes for you
                    </p>
                    <Button onClick={() => setIsConfigMode(true)} className="bg-primary hover:bg-primary-dark text-primary-foreground">
                    <Brain className="h-4 w-4 mr-2" />
                    Create Quiz
                    </Button>
                </>
            ) : (
                // STATE B: Configuration Form (Injecting logic here!)
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
                        <Select onValueChange={setSelectedMaterialId} disabled={!selectedGroupId}>
                            <SelectTrigger><SelectValue placeholder={files.length === 0 ? "Select Group First" : "Pick a File"} /></SelectTrigger>
                            <SelectContent>{files.map(f => <SelectItem key={f.id} value={String(f.id)}>{f.title}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Topic (Optional)</label>
                        <Input placeholder="e.g. Thermodynamics" value={topic} onChange={e => setTopic(e.target.value)} />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button variant="outline" onClick={() => setIsConfigMode(false)} className="w-full">Cancel</Button>
                        <Button onClick={handleStartQuiz} disabled={loading || !selectedMaterialId} className="w-full bg-primary text-primary-foreground">
                            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Brain className="mr-2 h-4 w-4"/>} Start Quiz
                        </Button>
                    </div>
                </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quiz Sets (Static History for now) */}
      <div className="space-y-4 opacity-75">
        <h2 className="text-2xl font-bold text-foreground">Sample Quizzes</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { id: 1, title: "Calculus Final Prep", questions: 5, subject: "Mathematics", difficulty: "Hard" },
            { id: 2, title: "Physics Fundamentals", questions: 5, subject: "Physics", difficulty: "Medium" },
            { id: 3, title: "Chemistry Quick Review", questions: 5, subject: "Chemistry", difficulty: "Easy" },
          ].map((quiz) => (
            <Card key={quiz.id} className="border-border hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-foreground">{quiz.title}</CardTitle>
                    <CardDescription>{quiz.subject}</CardDescription>
                  </div>
                  <Badge variant="secondary" className={
                      quiz.difficulty === "Easy" ? "bg-green-100 text-green-700" :
                      quiz.difficulty === "Medium" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }>
                    {quiz.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{quiz.questions} questions</p>
                <Button variant="secondary" className="w-full" disabled>
                  Example Only
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}