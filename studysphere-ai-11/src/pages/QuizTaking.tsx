import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Award, ArrowLeft } from "lucide-react";

export default function QuizTaking() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/quiz")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{quiz.title}</h1>
          <p className="text-muted-foreground mt-1">Answer all questions to complete the quiz</p>
        </div>
        {!showResult && (
          <Badge className="bg-primary text-primary-foreground">
            Question {currentQuestion + 1} / {quiz.questions.length}
          </Badge>
        )}
      </div>

      {!showResult ? (
        <Card className="border-border">
          <CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </CardTitle>
                <Badge className="bg-primary text-primary-foreground">
                  Score: {score}/{quiz.questions.length}
                </Badge>
              </div>
              <Progress value={(currentQuestion / quiz.questions.length) * 100} className="h-2" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">
                {quiz.questions[currentQuestion].question}
              </h3>
              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                {quiz.questions[currentQuestion].options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-foreground">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <Button 
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className="w-full bg-primary hover:bg-primary-dark text-primary-foreground"
            >
              {currentQuestion < quiz.questions.length - 1 ? "Next Question" : "Finish Quiz"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="h-10 w-10 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-foreground mb-2">Quiz Complete!</h3>
                <p className="text-lg text-muted-foreground">
                  You scored {score} out of {quiz.questions.length}
                </p>
                <p className="text-2xl font-bold text-primary mt-2">{percentage}%</p>
              </div>
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-5 w-5" />
                  <span>{score} Correct</span>
                </div>
                <div className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-5 w-5" />
                  <span>{quiz.questions.length - score} Incorrect</span>
                </div>
              </div>

              {/* Answer Review */}
              <div className="mt-8 space-y-3 text-left">
                <h4 className="font-semibold text-foreground text-center mb-4">Review Your Answers</h4>
                {quiz.questions.map((q, idx) => {
                  const userAnswer = answers[idx];
                  return (
                    <div key={idx} className={`p-4 rounded-lg border ${userAnswer.correct ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}`}>
                      <div className="flex items-start gap-2">
                        {userAnswer.correct ? (
                          <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{q.question}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Your answer: <span className={userAnswer.correct ? 'text-success' : 'text-destructive'}>{userAnswer.selected}</span>
                          </p>
                          {!userAnswer.correct && (
                            <p className="text-sm text-success mt-1">
                              Correct answer: {q.correctAnswer}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex gap-3 justify-center">
                <Button 
                  onClick={resetQuiz}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Try Again
                </Button>
                <Button 
                  onClick={() => navigate("/quiz")}
                  className="bg-primary hover:bg-primary-dark text-primary-foreground"
                >
                  Back to Quizzes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
