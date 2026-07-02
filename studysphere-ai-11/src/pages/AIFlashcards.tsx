import { useState, useEffect } from "react";
import { groupsAPI, aiAPI } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, BrainCircuit, ChevronLeft, ChevronRight, Sparkles, MousePointerClick } from "lucide-react";
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
    <div className="relative min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#08091a] to-[#050612] -m-6 p-6 md:p-10">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 left-1/3 h-96 w-96 rounded-full bg-indigo-600/12 blur-[130px]" />
          <div className="absolute top-1/2 right-0 h-80 w-80 rounded-full bg-blue-500/10 blur-[130px]" />
          <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-violet-500/8 blur-[120px]" />
      </div>

      <div className="relative space-y-10 animate-in fade-in duration-500 max-w-6xl mx-auto">
        {/* Hero Header */}
        <div className="pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-300 uppercase tracking-[0.25em] bg-indigo-500/10 border border-indigo-400/20 px-2.5 py-1 rounded-md">
                  <Sparkles className="h-3 w-3"/> AI-Powered Study Deck
              </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-indigo-100 to-blue-200 bg-clip-text text-transparent flex items-center gap-3">
              <BrainCircuit className="text-indigo-400 h-10 w-10 md:h-12 md:w-12"/>
              AI Flashcards
          </h1>
          <p className="text-slate-400 mt-2 max-w-xl">
              Choose a study material and let SparkLM AI generate immersive practice cards tailored to your syllabus.
          </p>
        </div>

        {/* --- CONTROL PANEL --- */}
        <Card className="relative overflow-hidden bg-white/[0.02] backdrop-blur-2xl border-white/[0.06]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.08),transparent_60%)] pointer-events-none"/>
          <div className="relative p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/[0.05]">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-[0_0_25px_rgba(99,102,241,0.4)]">
                    <BrainCircuit className="h-5 w-5 text-white"/>
                </div>
                <div>
                    <h3 className="text-white font-semibold text-lg">Configuration</h3>
                    <p className="text-xs text-slate-500">Choose your source material</p>
                </div>
            </div>

            <CardContent className="p-0 grid gap-5 md:grid-cols-3">
              
              {/* 1. SELECT GROUP */}
              <div className="space-y-2.5">
                <Label className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-md bg-indigo-500/15 border border-indigo-400/25 text-indigo-300 text-[10px] font-bold">1</span>
                    Study Group
                </Label>
                <Select onValueChange={handleGroupChange}>
                  <SelectTrigger className="bg-white/[0.02] border-white/[0.08] text-white hover:bg-white/[0.04] hover:border-white/[0.15] h-11 transition-all">
                    <SelectValue placeholder="Select Group..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f1e] border-white/[0.08] text-white">
                    {groups.map((g) => (
                      <SelectItem key={g.id} value={String(g.id)} className="focus:bg-white/[0.06] focus:text-white">{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 2. SELECT FILE */}
              <div className="space-y-2.5">
                <Label className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-md bg-indigo-500/15 border border-indigo-400/25 text-indigo-300 text-[10px] font-bold">2</span>
                    Source File
                </Label>
                <Select onValueChange={setSelectedMaterialId} disabled={!selectedGroupId}>
                  <SelectTrigger className="bg-white/[0.02] border-white/[0.08] text-white hover:bg-white/[0.04] hover:border-white/[0.15] disabled:opacity-40 h-11 transition-all">
                    <SelectValue placeholder={files.length === 0 ? "No files in group" : "Select File..."} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f1e] border-white/[0.08] text-white">
                    {files.map((f) => (
                      <SelectItem key={f.id} value={String(f.id)} className="focus:bg-white/[0.06] focus:text-white">{f.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 3. OPTIONAL TOPIC & BUTTON */}
              <div className="space-y-2.5">
                <Label className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-md bg-indigo-500/15 border border-indigo-400/25 text-indigo-300 text-[10px] font-bold">3</span>
                    Topic <span className="text-slate-500 normal-case font-normal">(optional)</span>
                </Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="e.g. 'Thermodynamics'" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-white/[0.02] border-white/[0.08] text-white placeholder:text-slate-500 focus:border-indigo-400/40 focus:ring-indigo-400/40 h-11"
                  />
                  <Button 
                    onClick={handleGenerate} 
                    disabled={loading || !selectedMaterialId} 
                    className="h-11 px-5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-semibold shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:shadow-[0_0_35px_rgba(99,102,241,0.6)] disabled:opacity-40 disabled:shadow-none transition-all shrink-0"
                  >
                    {loading ? <Loader2 className="animate-spin h-4 w-4"/> : <Sparkles className="h-4 w-4"/>}
                    <span className="ml-1.5">Generate</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* --- EMPTY STATE (no cards yet) --- */}
        {generatedCards.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center text-center py-12 opacity-70">
              <div className="relative mb-4">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full"/>
                  <div className="relative h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center backdrop-blur-xl">
                      <BrainCircuit className="h-6 w-6 text-indigo-300"/>
                  </div>
              </div>
              <p className="text-sm text-slate-500 max-w-sm">
                  Your generated flashcards will appear here. Configure a source above to begin.
              </p>
          </div>
        )}

        {/* --- FLASHCARD DISPLAY AREA --- */}
        {generatedCards.length > 0 && (
          <div className="flex flex-col items-center gap-8 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Card meta */}
              <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-300 uppercase tracking-[0.3em]">
                  <span className="h-px w-8 bg-gradient-to-r from-transparent to-indigo-400/50"/>
                  Study Deck
                  <span className="h-px w-8 bg-gradient-to-l from-transparent to-indigo-400/50"/>
              </div>

              {/* THE CARD */}
              <div 
                  className="relative w-full max-w-2xl h-80 cursor-pointer perspective-1000 group"
                  onClick={() => setIsFlipped(!isFlipped)}
                  style={{ perspective: "1200px" }}
              >
                  {/* Glow halo behind card */}
                  <div className={`absolute inset-0 rounded-2xl blur-3xl transition-all duration-700 ${
                      isFlipped 
                          ? 'bg-emerald-500/20' 
                          : 'bg-indigo-500/25'
                  }`}/>

                  <motion.div 
                      initial={false}
                      animate={{ rotateX: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.6, type: "spring" }}
                      className="w-full h-full relative preserve-3d"
                      style={{ transformStyle: "preserve-3d" }}
                  >
                      {/* FRONT */}
                      <Card 
                          className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center backface-hidden bg-white/[0.02] backdrop-blur-2xl border-white/[0.08] shadow-[0_0_60px_rgba(99,102,241,0.2)] overflow-hidden"
                          style={{ backfaceVisibility: "hidden" }}
                      >
                          {/* Decorative gradient border */}
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent"/>
                          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent"/>
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1),transparent_65%)] pointer-events-none"/>

                          <div className="relative flex items-center gap-2 mb-4">
                              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.3em] bg-indigo-500/10 border border-indigo-400/20 px-3 py-1 rounded-full">
                                  Question {currentCardIndex + 1}
                              </span>
                          </div>
                          <div className="relative text-2xl md:text-3xl font-semibold text-white leading-relaxed max-w-lg">
                              <Latex>{generatedCards[currentCardIndex].front}</Latex>
                          </div>
                          <div className="relative mt-auto flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-widest">
                              <MousePointerClick className="h-3 w-3"/> Click to reveal answer
                          </div>
                      </Card>

                      {/* BACK */}
                      <Card 
                          className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center backface-hidden bg-white/[0.02] backdrop-blur-2xl border-white/[0.08] shadow-[0_0_60px_rgba(16,185,129,0.2)] overflow-hidden"
                          style={{ transform: "rotateX(180deg)", backfaceVisibility: "hidden" }}
                      >
                          {/* Decorative gradient border */}
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"/>
                          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent"/>
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08),transparent_65%)] pointer-events-none"/>

                          <div className="relative flex items-center gap-2 mb-4">
                              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-[0.3em] bg-emerald-500/10 border border-emerald-400/20 px-3 py-1 rounded-full">
                                  Answer
                              </span>
                          </div>
                          <div className="relative text-xl md:text-2xl text-white/95 leading-relaxed max-w-lg">
                              <Latex>{generatedCards[currentCardIndex].back}</Latex>
                          </div>
                          <div className="relative mt-auto text-[10px] text-slate-500 uppercase tracking-widest">
                              Click to flip back
                          </div>
                      </Card>
                  </motion.div>
              </div>

              {/* PROGRESS DOTS */}
              <div className="flex items-center gap-1.5">
                  {generatedCards.map((_, i) => (
                      <div 
                          key={i}
                          className={`h-1 rounded-full transition-all duration-300 ${
                              i === currentCardIndex 
                                  ? 'w-8 bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.6)]' 
                                  : 'w-1.5 bg-white/[0.1]'
                          }`}
                      />
                  ))}
              </div>

              {/* CONTROLS */}
              <div className="flex items-center gap-3">
                  <Button 
                      variant="outline" 
                      onClick={prevCard}
                      className="h-11 px-5 bg-white/[0.02] border-white/[0.08] text-slate-200 hover:bg-white/[0.05] hover:text-white hover:border-white/[0.15] backdrop-blur-xl transition-all"
                  >
                      <ChevronLeft className="w-4 h-4 mr-1.5" /> Prev
                  </Button>
                  <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-lg px-4 py-2.5 min-w-[80px] text-center">
                      <span className="text-sm font-mono font-semibold text-white">
                          {currentCardIndex + 1}
                      </span>
                      <span className="text-sm text-slate-500 mx-1">/</span>
                      <span className="text-sm text-slate-400">
                          {generatedCards.length}
                      </span>
                  </div>
                  <Button 
                      variant="outline" 
                      onClick={nextCard}
                      className="h-11 px-5 bg-white/[0.02] border-white/[0.08] text-slate-200 hover:bg-white/[0.05] hover:text-white hover:border-white/[0.15] backdrop-blur-xl transition-all"
                  >
                      Next <ChevronRight className="w-4 h-4 ml-1.5" />
                  </Button>
              </div>
          </div>
        )}
      </div>
    </div>
  );
}