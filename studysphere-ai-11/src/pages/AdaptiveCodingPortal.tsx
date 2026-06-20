import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Brain, Play, CheckCircle, XCircle, Activity, Zap, TrendingUp, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import 'katex/dist/katex.min.css';
import XaiComponentCharts from '../components/XaiComponentCharts';

export default function AdaptiveCodingPortal() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const topic = searchParams.get('topic') || 'Array';
    const groupId = searchParams.get('group');

    const [problem, setProblem] = useState<any>(null);
    const [code, setCode] = useState('# Write your solution here\n\n');
    const [language, setLanguage] = useState('python');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [results, setResults] = useState<any>(null);

    const fetchNextProblem = async () => {
        setLoading(true);
        setResults(null);
        const token = localStorage.getItem('authToken') || localStorage.getItem('access');
        
        try {
            const response = await fetch(`http://localhost:8000/api/code/next/?topic=${topic}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setProblem(data);
            
            if (data.boilerplate_code && data.boilerplate_code[language]) {
                setCode(data.boilerplate_code[language]);
            } else {
                setCode('# Write your solution here\n\n');
            }
        } catch (error) {
            console.error("Failed to fetch problem:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNextProblem();
    }, [topic]);

    useEffect(() => {
        if (problem && problem.boilerplate_code && problem.boilerplate_code[language]) {
            setCode(problem.boilerplate_code[language]);
        }
    }, [language, problem]);

    const handleSubmit = async () => {
        setSubmitting(true);
        const token = localStorage.getItem('authToken') || localStorage.getItem('access');

        try {
            const response = await fetch(`http://localhost:8000/api/code/submit/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    code: code,
                    language: language,
                    problem_id: problem.id,
                    test_cases: problem.hiddenTestCases || []
                })
            });
            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error("Failed to submit:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-slate-950 text-white">🧠 Calibrating PyTorch Tensor State...</div>;
    if (!problem) return <div className="flex h-screen items-center justify-center bg-slate-950 text-white">No problems found.</div>;

    return (
        <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
            
            {/* LEFT COLUMN: AI Insights & Problem Description */}
            <div className="w-1/2 h-full flex flex-col border-r border-slate-800 overflow-y-auto">
                <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/groups/${groupId}`)}>
                            <ArrowRight className="h-4 w-4 rotate-180 mr-2" /> Exit
                        </Button>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            <Activity className="text-blue-500"/> Adaptive Portal
                        </h1>
                    </div>
                    <Badge variant="outline" className="bg-blue-900/30 text-blue-400 border-blue-800">
                        {topic}
                    </Badge>
                </div>

                <div className="p-6 space-y-6">
                    {/* 👇 AI INSIGHT PANEL: Fixed the variables to map to Django! 👇 */}
                    <Card className="border-indigo-500/50 bg-indigo-950/20 shadow-lg shadow-indigo-900/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-indigo-400 flex items-center gap-2 text-sm uppercase tracking-wider">
                                <Brain className="h-4 w-4" /> Explainable AI (SHAP) Insight
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-300 leading-relaxed text-sm mb-4">
                                {problem.explanation} 
                            </p>
                            
                            {problem.advanced_xai && problem.advanced_xai.xai && (
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-slate-900/80 p-2 rounded border border-slate-800 text-center">
                                        <div className="text-xs text-slate-500 mb-1">Predicted Success</div>
                                        <div className="font-bold text-green-400">{problem.advanced_xai.xai.success_probability}%</div>
                                    </div>
                                    <div className="bg-slate-900/80 p-2 rounded border border-slate-800 text-center">
                                        <div className="text-xs text-slate-500 mb-1">Decay Warning</div>
                                        <div className={`font-bold ${problem.advanced_xai.decay_info.decay_percent > 40 ? 'text-red-400' : 'text-yellow-400'}`}>
                                            {problem.advanced_xai.decay_info.decay_percent}%
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/80 p-2 rounded border border-slate-800 text-center">
                                        <div className="text-xs text-slate-500 mb-1">Dominant Factor</div>
                                        <div className="font-bold text-indigo-400 capitalize">{problem.advanced_xai.xai.dominant_factor}</div>
                                    </div>
                                </div>
                            )}

                            {problem.advanced_xai && problem.advanced_xai.xai && problem.advanced_xai.xai.shap_values && (
                                <div className="mt-4 pt-4 border-t border-slate-800 flex justify-center">
                                     <XaiComponentCharts 
                                        radarData={problem.advanced_xai.xai.shap_values} 
                                        dominantFactor={problem.advanced_xai.xai.dominant_factor}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-2xl font-extrabold text-white">{problem.title}</h2>
                            <Badge className={
                                problem.difficulty === 'Easy' ? 'bg-green-900/50 text-green-400' : 
                                problem.difficulty === 'Medium' ? 'bg-yellow-900/50 text-yellow-400' : 
                                'bg-red-900/50 text-red-400'
                            }>
                                {problem.difficulty}
                            </Badge>
                        </div>
                        <div 
                            className="prose prose-invert max-w-none text-slate-300"
                            dangerouslySetInnerHTML={{ __html: problem.description }}
                        />
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Editor & Output */}
            <div className="w-1/2 h-full flex flex-col bg-[#1e1e1e]">
                <div className="flex justify-between items-center p-2 border-b border-slate-800 bg-slate-900">
                    <select 
                        value={language} 
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-slate-800 text-sm text-slate-300 border border-slate-700 rounded px-3 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                    </select>
                    <div className="flex gap-2">
                        <Button onClick={handleSubmit} disabled={submitting} className="bg-green-600 hover:bg-green-700 text-white h-8 text-sm">
                            {submitting ? 'Running...' : <><Play className="h-3 w-3 mr-1"/> Submit Code</>}
                        </Button>
                    </div>
                </div>

                <div className="flex-1">
                    <Editor
                        height="100%"
                        language={language}
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            wordWrap: 'on',
                            padding: { top: 16 }
                        }}
                    />
                </div>

                <div className="h-64 border-t border-slate-800 bg-slate-950 p-4 overflow-y-auto">
                    {!results ? (
                        <div className="text-slate-600 font-mono text-sm flex items-center h-full justify-center">
                            Console Output will appear here...
                        </div>
                    ) : (
                        <div className="space-y-4 font-mono text-sm animate-in slide-in-from-bottom-4">
                            <div className="flex items-center justify-between">
                                <h3 className={`text-lg font-bold flex items-center gap-2 ${results.all_passed ? 'text-green-500' : 'text-red-500'}`}>
                                    {results.all_passed ? <CheckCircle className="h-5 w-5"/> : <XCircle className="h-5 w-5"/>}
                                    {results.status}
                                </h3>
                                <div className="text-slate-400">
                                    Passed: <span className="text-white font-bold">{results.passed} / {results.total}</span>
                                </div>
                            </div>

                            {results.all_passed && (
                                <Button onClick={fetchNextProblem} className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4">
                                    <Zap className="h-4 w-4 mr-2" /> Load Next Problem
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}