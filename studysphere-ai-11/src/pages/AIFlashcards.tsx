import { useState, useEffect } from "react";
import { groupsAPI, aiAPI } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, BrainCircuit,  ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

export default function AIFlashcards() {
  // 1. DATA STATES
  const [groups, setGroups] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [generatedCards, setGeneratedCards] = useState<any[]>([]);

  // 2. SELECTION STATES
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [topic, setTopic] = useState("");
  
  // 3. UI STATES
  const [loading, setLoading] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // --- FETCH GROUPS ON LOAD ---
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const res = await groupsAPI.getAll();
        setGroups(res.data.results || res.data || []);
      } catch (err) {
        console.error("Failed to load groups", err);
      }
    };
    loadGroups();
  }, []);

  // --- FETCH FILES WHEN GROUP CHOSEN ---
  const handleGroupChange = async (groupId: string) => {
    setSelectedGroupId(groupId);
    setFiles([]); // Clear old files
    try {
      const res = await groupsAPI.getMaterials(groupId);
      setFiles(res.data.results || res.data || []);
    } catch (err) {
      console.error("Failed to load files", err);
    }
  };

  // --- GENERATE ACTION ---
  const handleGenerate = async () => {
    if (!selectedMaterialId) return alert("Please select a file first!");
    
    setLoading(true);
    setGeneratedCards([]); // Clear old cards

    try {
      const res = await aiAPI.generateFlashcards(selectedMaterialId, topic || "General Summary");
      let parsedCards = res.data.flashcards || res.data || [];
      
      // Handle case where LLM wrapped the array in an object (e.g. {"flashcards": [...]})
      if (parsedCards && !Array.isArray(parsedCards)) {
          if (parsedCards.flashcards && Array.isArray(parsedCards.flashcards)) {
              parsedCards = parsedCards.flashcards;
          } else if (parsedCards.cards && Array.isArray(parsedCards.cards)) {
              parsedCards = parsedCards.cards;
          } else {
              const firstArray = Object.values(parsedCards).find(v => Array.isArray(v));
              parsedCards = firstArray || [];
          }
      }
      
      if (!Array.isArray(parsedCards) || parsedCards.length === 0) {
        alert("AI could not generate flashcards. Try a different file.");
        return;
      }
      
      setGeneratedCards(parsedCards); 
    } catch (err) {
      console.error("AI Error", err);
      alert("Failed to generate. Make sure Backend AI is running.");
    } finally {
      setLoading(false);
    }
  };

  // --- CARD CONTROLS ---
  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentCardIndex((prev) => (prev + 1) % generatedCards.length);
    }, 200); // Small delay so it doesn't swap content while flipped
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentCardIndex((prev) => (prev - 1 + generatedCards.length) % generatedCards.length);
    }, 200);
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BrainCircuit className="text-purple-500" /> AI Flashcards
        </h1>
        <p className="text-muted-foreground mt-2">
          Select a study material and let AI generate practice cards for you.
        </p>
      </div>

      {/* --- CONTROL PANEL --- */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>Choose source material</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          
          {/* 1. SELECT GROUP */}
          <div className="space-y-2">
            <Label>1. Pick Study Group</Label>
            <Select onValueChange={handleGroupChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Group..." />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. SELECT FILE */}
          <div className="space-y-2">
            <Label>2. Pick File</Label>
            <Select onValueChange={setSelectedMaterialId} disabled={!selectedGroupId}>
              <SelectTrigger>
                <SelectValue placeholder={files.length === 0 ? "No files in group" : "Select File..."} />
              </SelectTrigger>
              <SelectContent>
                {files.map((f) => (
                  <SelectItem key={f.id} value={String(f.id)}>{f.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 3. OPTIONAL TOPIC & BUTTON */}
          <div className="space-y-2">
            <Label>3. Specific Topic (Optional)</Label>
            <div className="flex gap-2">
              <Input 
                placeholder="e.g. 'Thermodynamics'" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <Button onClick={handleGenerate} disabled={loading || !selectedMaterialId} className="bg-purple-600 hover:bg-purple-700">
                {loading ? <Loader2 className="animate-spin" /> : null}
                Generate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- FLASHCARD DISPLAY AREA --- */}
      {generatedCards.length > 0 && (
        <div className="flex flex-col items-center gap-6 mt-10">
            
            {/* THE CARD */}
            <div 
                className="relative w-full max-w-2xl h-80 cursor-pointer perspective-1000 group"
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <motion.div 
                    initial={false}
                    animate={{ rotateX: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring" }}
                    className="w-full h-full relative preserve-3d"
                    style={{ transformStyle: "preserve-3d" }}
                >
                    {/* FRONT */}
                    <Card className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center backface-hidden shadow-xl border-2 border-purple-100 bg-white">
                        <span className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-4">Question {currentCardIndex + 1}</span>
                        <div className="text-2xl font-semibold">
                            {/* 👇 LATEX WRAPPER ADDED HERE */}
                            <Latex>{generatedCards[currentCardIndex].front}</Latex>
                        </div>
                        <p className="text-xs text-muted-foreground mt-auto">Click to flip</p>
                    </Card>

                    {/* BACK */}
                    <Card 
                        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center backface-hidden shadow-xl bg-purple-50 border-2 border-purple-200"
                        style={{ transform: "rotateX(180deg)" }}
                    >
                        <span className="text-xs font-bold text-green-600 uppercase tracking-widest mb-4">Answer</span>
                        <div className="text-xl">
                            {/* 👇 LATEX WRAPPER ADDED HERE */}
                            <Latex>{generatedCards[currentCardIndex].back}</Latex>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* CONTROLS */}
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={prevCard}>
                    <ChevronLeft className="w-4 h-4 mr-2" /> Prev
                </Button>
                <span className="text-sm font-medium">
                    {currentCardIndex + 1} / {generatedCards.length}
                </span>
                <Button variant="outline" onClick={nextCard}>
                    Next <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
      )}
    </div>
  );
}