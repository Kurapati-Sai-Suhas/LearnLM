import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Brain,
  Play,
  CheckCircle,
  XCircle,
  Activity,
  Zap,
  ArrowLeft,
  Code2,
  Terminal,
  ChevronDown,
  Loader2,
  Target,
  AlertTriangle,
  Flame,
  
} from 'lucide-react';
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
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setProblem(data);

      if (data.boilerplate_code && data.boilerplate_code[language]) {
        setCode(data.boilerplate_code[language]);
      } else {
        setCode('# Write your solution here\n\n');
      }
    } catch (error) {
      console.error('Failed to fetch problem:', error);
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: code,
          language: language,
          problem_id: problem.id,
          test_cases: problem.hiddenTestCases || [],
        }),
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // -------- premium loading / empty states --------
  if (loading)
    return (
      <div
        data-testid="portal-loading"
        className="flex h-screen items-center justify-center bg-background text-foreground"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-full border-2 border-border/60" />
            <div className="absolute inset-0 h-14 w-14 rounded-full border-2 border-transparent border-t-primary animate-spin shadow-[0_0_30px_rgba(59,130,246,0.45)]" />
            <Brain className="absolute inset-0 m-auto h-5 w-5 text-primary" />
          </div>
          <p className="text-sm font-mono text-muted-foreground tracking-wider">
            Calibrating PyTorch tensor state…
          </p>
        </div>
      </div>
    );

  if (!problem)
    return (
      <div
        data-testid="portal-empty"
        className="flex h-screen items-center justify-center bg-background text-muted-foreground font-mono text-sm"
      >
        No problems found.
      </div>
    );

  const difficultyClass =
    problem.difficulty === 'Easy'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
      : problem.difficulty === 'Medium'
      ? 'border-amber-500/30 bg-amber-500/10 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
      : 'border-rose-500/30 bg-rose-500/10 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.25)]';

  return (
    <div
      data-testid="coding-portal"
      className="relative flex h-screen bg-background text-foreground font-sans overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute top-1/2 right-0 h-[360px] w-[360px] rounded-full bg-indigo-500/10 blur-[140px]" />
      </div>

      {/* =============== LEFT — Insights & Description =============== */}
      <div
        data-testid="left-pane"
        className="relative z-10 w-1/2 h-full flex flex-col border-r border-border/60 bg-card/20 backdrop-blur-md overflow-y-auto"
      >
        {/* Top bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border/60 bg-background/70 backdrop-blur-md px-5 py-3">
          <div className="flex items-center gap-3">
            <Button
              data-testid="exit-btn"
              variant="ghost"
              size="sm"
              className="h-8 text-muted-foreground hover:text-foreground hover:bg-muted/40"
              onClick={() => navigate(`/groups/${groupId}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Exit
            </Button>
            <div className="h-5 w-px bg-border/60" />
            <h1 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Adaptive Portal
            </h1>
          </div>
          <Badge
            data-testid="topic-badge"
            className="bg-primary/10 text-primary border border-primary/30 font-medium px-3 py-0.5"
          >
            {topic}
          </Badge>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* ----------- High-tech XAI INSIGHT panel ----------- */}
          <Card
            data-testid="xai-insight-panel"
            className="relative overflow-hidden border-border/60 bg-card/40 backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_0_40px_rgba(99,102,241,0.08)]"
          >
            {/* corner glow */}
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/25 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent" />

            {/* scanline header */}
            <CardHeader className="pb-3 relative">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-indigo-300">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.9)]" />
                  </span>
                  <Brain className="h-3.5 w-3.5" />
                  Explainable AI · SHAP Insight
                </CardTitle>
                <span className="font-mono text-[10px] text-muted-foreground tracking-wider">
                  v.adv-xai
                </span>
              </div>
            </CardHeader>

            <CardContent className="relative">
              <p className="text-sm leading-relaxed text-muted-foreground mb-5">
                {problem.explanation}
              </p>

              {problem.advanced_xai && problem.advanced_xai.xai && (
                <div
                  data-testid="xai-metrics-grid"
                  className="grid grid-cols-3 gap-2"
                >
                  {/* Predicted Success */}
                  <div className="group relative rounded-lg border border-border/60 bg-background/40 backdrop-blur p-3 overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                      <Target className="h-3 w-3" />
                      Predicted
                    </div>
                    <div className="text-xl font-semibold text-emerald-300 tabular-nums">
                      {problem.advanced_xai.xai.success_probability}
                      <span className="text-xs text-emerald-400/70 ml-0.5">%</span>
                    </div>
                  </div>

                  {/* Decay Warning */}
                  <div className="group relative rounded-lg border border-border/60 bg-background/40 backdrop-blur p-3 overflow-hidden">
                    <div
                      className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${
                        problem.advanced_xai.decay_info.decay_percent > 40
                          ? 'via-rose-400/70'
                          : 'via-amber-400/70'
                      } to-transparent`}
                    />
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                      <AlertTriangle className="h-3 w-3" />
                      Decay
                    </div>
                    <div
                      className={`text-xl font-semibold tabular-nums ${
                        problem.advanced_xai.decay_info.decay_percent > 40
                          ? 'text-rose-300'
                          : 'text-amber-300'
                      }`}
                    >
                      {problem.advanced_xai.decay_info.decay_percent}
                      <span className="text-xs opacity-70 ml-0.5">%</span>
                    </div>
                  </div>

                  {/* Dominant Factor */}
                  <div className="group relative rounded-lg border border-border/60 bg-background/40 backdrop-blur p-3 overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent" />
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                      <Flame className="h-3 w-3" />
                      Dominant
                    </div>
                    <div className="text-sm font-semibold text-indigo-300 capitalize truncate">
                      {problem.advanced_xai.xai.dominant_factor}
                    </div>
                  </div>
                </div>
              )}

              {problem.advanced_xai &&
                problem.advanced_xai.xai &&
                problem.advanced_xai.xai.shap_values && (
                  <div
                    data-testid="xai-radar-container"
                    className="mt-5 pt-5 border-t border-border/60 flex justify-center"
                  >
                    <XaiComponentCharts
                      radarData={problem.advanced_xai.xai.shap_values}
                      dominantFactor={problem.advanced_xai.xai.dominant_factor}
                    />
                  </div>
                )}
            </CardContent>
          </Card>

          {/* ----------- Problem description ----------- */}
          <div data-testid="problem-description-block">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                {problem.title}
              </h2>
              <span
                data-testid="difficulty-badge"
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium backdrop-blur ${difficultyClass}`}
              >
                
                {problem.difficulty}
              </span>
            </div>

            <div className="relative rounded-xl border border-border/60 bg-card/30 backdrop-blur p-5">
              <div
                className="prose prose-invert max-w-none text-sm leading-relaxed text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground prose-code:text-primary prose-code:bg-background/60 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none"
                dangerouslySetInnerHTML={{ __html: problem.description }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* =============== RIGHT — Editor & Console =============== */}
      <div
        data-testid="right-pane"
        className="relative z-10 w-1/2 h-full flex flex-col bg-[#0b0d12]"
      >
        {/* Editor toolbar */}
        <div
          data-testid="editor-toolbar"
          className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-background/60 backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            {/* macOS-style status dots */}
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
            </div>
            <div className="h-4 w-px bg-border/60" />
            <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
              <Code2 className="h-3.5 w-3.5 text-primary" />
              <span>solution.{language === 'python' ? 'py' : language === 'java' ? 'java' : 'cpp'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sleek language select */}
            <div className="relative">
              <select
                data-testid="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="appearance-none h-8 pl-3 pr-8 text-xs font-mono uppercase tracking-wider rounded-md
                  bg-card/40 backdrop-blur border border-border/60 text-foreground
                  hover:border-primary/40 focus:outline-none focus:border-primary/60
                  focus:shadow-[0_0_0_1px_rgba(59,130,246,0.4)] transition-all cursor-pointer"
              >
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            </div>

            <Button
              data-testid="submit-code-btn"
              onClick={handleSubmit}
              disabled={submitting}
              className="h-8 px-3.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.7)] transition-all disabled:opacity-60 disabled:shadow-none"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Running…
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1.5 fill-current" />
                  Submit Code
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 relative">
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
              padding: { top: 16 },
            }}
          />
        </div>

        {/* High-end terminal console */}
        <div
          data-testid="console-output"
          className="relative h-64 border-t border-border/60 bg-[#070809] flex flex-col"
        >
          {/* terminal header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/60 bg-background/40 backdrop-blur">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              <Terminal className="h-3.5 w-3.5 text-primary" />
              console · stdout
            </div>
            {results && (
              <div
                className={`flex items-center gap-1.5 text-[11px] font-mono ${
                  results.all_passed ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    results.all_passed
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]'
                      : 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.9)]'
                  }`}
                />
                {results.all_passed ? 'exit 0' : 'exit 1'}
              </div>
            )}
          </div>

          {/* terminal body */}
          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
            {!results ? (
              <div className="flex items-center gap-2 text-muted-foreground/60">
                <span className="text-primary">$</span>
                <span>awaiting submission</span>
                <span className="ml-0.5 inline-block h-3.5 w-1.5 bg-muted-foreground/60 animate-pulse" />
              </div>
            ) : (
              <div
                data-testid="results-block"
                className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500"
              >
                <div className="flex items-center justify-between">
                  <h3
                    className={`text-base font-semibold flex items-center gap-2 ${
                      results.all_passed ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {results.all_passed ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    {results.status}
                  </h3>

                  <div
                    data-testid="test-summary"
                    className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-background/40 backdrop-blur px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    <span className="uppercase tracking-[0.18em] text-[10px]">tests</span>
                    <span className="tabular-nums text-foreground font-semibold">
                      {results.passed}
                      <span className="text-muted-foreground"> / {results.total}</span>
                    </span>
                  </div>
                </div>

                {/* Pass/fail visual bar */}
                <div className="h-1 w-full rounded-full bg-muted/30 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-[width] duration-700 ${
                      results.all_passed
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.6)]'
                        : 'bg-gradient-to-r from-rose-400 to-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]'
                    }`}
                    style={{
                      width: `${results.total ? (results.passed / results.total) * 100 : 0}%`,
                    }}
                  />
                </div>

                {results.all_passed && (
                  <Button
                    data-testid="next-problem-btn"
                    onClick={fetchNextProblem}
                    className="w-full h-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_18px_rgba(59,130,246,0.5)] hover:shadow-[0_0_28px_rgba(59,130,246,0.7)] transition-all font-medium group"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Load Next Problem
                    <span className="ml-2 opacity-60 group-hover:opacity-100 transition-opacity">→</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}