import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Award, ArrowLeft, Sparkles, ChevronRight, RefreshCw } from "lucide-react";

export default function QuizTaking() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);

  // Mock quiz data - will be fetched from Django API based on quizId
  const quiz = {
    id: quizId,
    title: "Calculus Final Prep",
    questions: [
      {
        question: "What is the integral of 1/x?",
        options: ["ln|x| + C", "x² + C", "1/x² + C", "e^x + C"],
        correctAnswer: "ln|x| + C",
      },
      {
        question: "Which law states that energy cannot be created or destroyed?",
        options: ["Newton's First Law", "Law of Conservation of Energy", "Ohm's Law", "Boyle's Law"],
        correctAnswer: "Law of Conservation of Energy",
      },
      {
        question: "What is the pH of pure water at 25°C?",
        options: ["0", "7", "14", "1"],
        correctAnswer: "7",
      },
      {
        question: "What is the derivative of sin(x)?",
        options: ["cos(x)", "-cos(x)", "tan(x)", "-sin(x)"],
        correctAnswer: "cos(x)",
      },
      {
        question: "What is the limit of (1 + 1/n)^n as n approaches infinity?",
        options: ["e", "π", "1", "∞"],
        correctAnswer: "e",
      },
    ],
  };

  const handleSubmit = () => {
    const isCorrect = selectedAnswer === quiz.questions[currentQuestion].correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
    }

    setAnswers([...answers, { 
      question: currentQuestion, 
      selected: selectedAnswer, 
      correct: isCorrect 
    }]);
    
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setShowResult(false);
    setScore(0);
    setAnswers([]);
  };

  const percentage = Math.round((score / quiz.questions.length) * 100);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#08091a] to-[#050612] -m-6 p-6 md:p-10">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/4 h-96 w-96 rounded-full bg-indigo-600/12 blur-[130px]" />
        <div className="absolute top-1/3 right-0 h-80 w-80 rounded-full bg-violet-500/8 blur-[130px]" />
        {showResult && percentage >= 60 && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-emerald-500/12 blur-[130px]" />
        )}
      </div>

      <div className="relative space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 pb-5 border-b border-white/[0.06]">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate("/quiz")}
            className="h-10 w-10 bg-white/[0.02] border-white/[0.08] text-slate-200 hover:bg-white/[0.05] hover:text-white hover:border-white/[0.15] backdrop-blur-xl transition-all shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-300 uppercase tracking-[0.25em] bg-indigo-500/10 border border-indigo-400/20 px-2.5 py-0.5 rounded-md">
                <Sparkles className="h-3 w-3"/> Live Quiz
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-indigo-100 to-violet-200 bg-clip-text text-transparent truncate">
              {quiz.title}
            </h1>
            <p className="text-slate-400 mt-1 text-xs">Answer all questions to complete the quiz</p>
          </div>
          {!showResult && (
            <Badge className="shrink-0 bg-white/[0.03] border border-white/[0.1] text-slate-200 backdrop-blur-xl font-mono px-3 py-1.5">
              {currentQuestion + 1} / {quiz.questions.length}
            </Badge>
          )}
        </div>

        {!showResult ? (
          <Card className="relative overflow-hidden bg-white/[0.02] backdrop-blur-2xl border-white/[0.06] shadow-[0_0_60px_rgba(99,102,241,0.08)]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent"/>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.06),transparent_60%)] pointer-events-none"/>

            {/* Card Header */}
            <div className="relative px-6 md:px-8 pt-6 pb-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.3em]">
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </span>
                <Badge className="bg-gradient-to-r from-indigo-500/15 to-violet-500/15 border border-indigo-400/25 text-indigo-200 font-mono text-xs backdrop-blur-xl">
                  Score: {score}/{quiz.questions.length}
                </Badge>
              </div>
              <div className="relative">
                <Progress 
                  value={(currentQuestion / quiz.questions.length) * 100} 
                  className="h-1.5 bg-white/[0.04]" 
                />
              </div>
            </div>

            <CardContent className="relative px-6 md:px-8 pb-8 space-y-6">
              <div className="space-y-5">
                <h3 className="text-2xl md:text-3xl font-semibold text-white leading-relaxed">
                  {quiz.questions[currentQuestion].question}
                </h3>
                <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} className="space-y-2.5">
                  {quiz.questions[currentQuestion].options.map((option, index) => {
                    const isSelected = selectedAnswer === option;
                    return (
                      <Label
                        key={index}
                        htmlFor={`option-${index}`}
                        className={`group relative flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-all duration-300 backdrop-blur-xl ${
                          isSelected
                            ? "bg-indigo-500/10 border-indigo-400/50 shadow-[0_0_25px_rgba(99,102,241,0.25)] ring-1 ring-indigo-400/30"
                            : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.15]"
                        }`}
                      >
                        {/* Letter chip */}
                        <span className={`shrink-0 h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                            : "bg-white/[0.04] text-slate-300 border border-white/[0.08]"
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </span>

                        <RadioGroupItem 
                          value={option} 
                          id={`option-${index}`} 
                          className="sr-only"
                        />
                        <span className={`flex-1 text-sm md:text-base font-medium ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                          {option}
                        </span>

                        {/* Selected indicator dot */}
                        <span className={`shrink-0 h-4 w-4 rounded-full border transition-all ${
                          isSelected
                            ? 'border-indigo-400 bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.6)]'
                            : 'border-white/[0.2] bg-transparent group-hover:border-white/40'
                        }`}>
                          {isSelected && <span className="block h-full w-full rounded-full bg-white/40 scale-50"/>}
                        </span>
                      </Label>
                    );
                  })}
                </RadioGroup>
              </div>

              <Button 
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                className="w-full h-12 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-semibold shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:shadow-[0_0_35px_rgba(99,102,241,0.6)] disabled:opacity-40 disabled:shadow-none transition-all"
              >
                {currentQuestion < quiz.questions.length - 1 ? "Next Question" : "Finish Quiz"}
                <ChevronRight className="h-4 w-4 ml-1.5"/>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Result Hero Card */}
            <Card className="relative overflow-hidden bg-white/[0.02] backdrop-blur-2xl border-white/[0.06] shadow-[0_0_60px_rgba(99,102,241,0.1)]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent"/>
              <div className={`absolute inset-0 pointer-events-none ${
                percentage >= 60 
                  ? 'bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08),transparent_60%)]' 
                  : 'bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.06),transparent_60%)]'
              }`}/>

              <CardContent className="relative pt-10 pb-10 px-6">
                <div className="text-center space-y-6">
                  {/* Trophy */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className={`absolute inset-0 blur-[40px] rounded-full ${
                        percentage >= 60 ? 'bg-amber-400/40' : 'bg-indigo-500/30'
                      }`}/>
                      <div className={`relative h-24 w-24 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.4)] ${
                        percentage >= 60 
                          ? 'bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500' 
                          : 'bg-gradient-to-br from-indigo-500 to-violet-600'
                      }`}>
                        <Award className="h-12 w-12 text-white drop-shadow-lg" />
                      </div>
                    </div>
                  </div>

                  {/* Score Display */}
                  <div className="space-y-2">
                    <h3 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-indigo-100 to-violet-200 bg-clip-text text-transparent">
                      Quiz Complete!
                    </h3>
                    <p className="text-lg text-slate-400">
                      You scored <span className="text-white font-semibold">{score}</span> out of <span className="text-white font-semibold">{quiz.questions.length}</span>
                    </p>
                    <div className="inline-block mt-2 bg-white/[0.02] backdrop-blur-2xl border border-white/[0.06] rounded-2xl px-8 py-4">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-1">Final Score</p>
                      <p className={`text-5xl font-bold font-mono ${
                        percentage >= 60 
                          ? 'bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent' 
                          : 'bg-gradient-to-r from-rose-300 to-orange-300 bg-clip-text text-transparent'
                      }`}>
                        {percentage}%
                      </p>
                    </div>
                  </div>

                  {/* Correct/Incorrect summary */}
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-400/25 text-emerald-300 rounded-full px-4 py-1.5 backdrop-blur-xl shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-semibold">{score} Correct</span>
                    </div>
                    <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-400/25 text-rose-300 rounded-full px-4 py-1.5 backdrop-blur-xl shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm font-semibold">{quiz.questions.length - score} Incorrect</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Answer Review */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-400/20 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-indigo-300"/>
                </div>
                <div>
                  <h4 className="text-white font-semibold text-base">Review Your Answers</h4>
                  <p className="text-xs text-slate-500">Detailed breakdown of each question</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {quiz.questions.map((q, idx) => {
                  const userAnswer = answers[idx];
                  const isCorrect = userAnswer.correct;
                  return (
                    <Card 
                      key={idx} 
                      className={`relative overflow-hidden backdrop-blur-2xl transition-all ${
                        isCorrect 
                          ? 'bg-white/[0.02] border-emerald-400/20 shadow-[0_0_25px_rgba(16,185,129,0.08)]' 
                          : 'bg-white/[0.02] border-rose-400/20 shadow-[0_0_25px_rgba(244,63,94,0.08)]'
                      }`}
                    >
                      {/* Left rail */}
                      <div className={`absolute left-0 top-0 h-full w-[3px] ${
                        isCorrect 
                          ? 'bg-gradient-to-b from-emerald-400 to-teal-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' 
                          : 'bg-gradient-to-b from-rose-400 to-orange-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                      }`}/>

                      <CardContent className="p-5 pl-6">
                        <div className="flex items-start gap-3">
                          <div className={`shrink-0 h-9 w-9 rounded-lg flex items-center justify-center ${
                            isCorrect 
                              ? 'bg-emerald-500/15 border border-emerald-400/30' 
                              : 'bg-rose-500/15 border border-rose-400/30'
                          }`}>
                            {isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]"/>
                            ) : (
                              <XCircle className="h-5 w-5 text-rose-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.5)]"/>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <p className="font-semibold text-white text-sm md:text-base leading-relaxed">
                              {q.question}
                            </p>
                            <div className="text-xs text-slate-400 space-y-1">
                              <p>
                                Your answer:{' '}
                                <span className={`font-semibold ${isCorrect ? 'text-emerald-300' : 'text-rose-300'}`}>
                                  {userAnswer.selected}
                                </span>
                              </p>
                              {!isCorrect && (
                                <p>
                                  Correct answer:{' '}
                                  <span className="font-semibold text-emerald-300">
                                    {q.correctAnswer}
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={resetQuiz}
                variant="outline"
                className="h-11 px-6 bg-white/[0.02] border-white/[0.08] text-slate-200 hover:bg-white/[0.05] hover:text-white hover:border-white/[0.15] backdrop-blur-xl transition-all"
              >
                <RefreshCw className="h-4 w-4 mr-2"/>
                Try Again
              </Button>
              <Button 
                onClick={() => navigate("/quiz")}
                className="h-11 px-6 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-semibold shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:shadow-[0_0_35px_rgba(99,102,241,0.6)] transition-all"
              >
                Back to Quizzes
                <ChevronRight className="h-4 w-4 ml-1.5"/>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
