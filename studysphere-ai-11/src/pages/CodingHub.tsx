import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Sparkles, ArrowRight, Terminal } from 'lucide-react';

interface Portal {
  id: number | string;
  name: string;
  description: string;
  is_active: boolean;
}

const CodingHub: React.FC = () => {
  const [portals, setPortals] = useState<Portal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPortals = async () => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('access');

        const response = await fetch('http://127.0.0.1:8000/api/coding-portals/', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data: Portal[] = await response.json();
          setPortals(data);
        } else {
          console.error('Failed to fetch portals. Status:', response.status);
        }
      } catch (error) {
        console.error('Network error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortals();
  }, []);

  return (
    <div
      data-testid="coding-hub-page"
      className="relative min-h-screen bg-background text-foreground p-6 md:p-8"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-20 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-32 right-0 h-[320px] w-[320px] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* HERO */}
        <div
          data-testid="hub-hero"
          className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md p-8 md:p-10 mb-10 animate-in slide-in-from-bottom-4 fade-in duration-500"
        >
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />

          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 backdrop-blur px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              GNN-powered learning paths
            </div>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground">
              Global{' '}
              <span className="bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
                Coding Hub
              </span>
            </h1>
            <p className="mt-3 text-base md:text-lg text-muted-foreground">
              Select a masterclass to begin your adaptive learning journey.
            </p>
          </div>
        </div>

        {loading ? (
          <div data-testid="hub-loading" className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-2 border-border/60" />
              <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-transparent border-t-primary animate-spin shadow-[0_0_25px_rgba(59,130,246,0.4)]" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {portals.map((portal) => (
              <div
                key={portal.id}
                data-testid={`portal-card-${portal.id}`}
                onClick={() => navigate(`/coding-portal?portal_id=${portal.id}`)}
                className="group relative cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-500"
              >
                {/* Outer hover glow */}
                <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-primary/0 via-primary/0 to-indigo-500/0 group-hover:from-primary/30 group-hover:via-primary/10 group-hover:to-indigo-500/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div
                  className="relative h-full rounded-xl border border-border/60 bg-card/40 backdrop-blur-md p-6
                    shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]
                    transition-all duration-300
                    group-hover:border-primary/50
                    group-hover:-translate-y-0.5
                    group-hover:shadow-[0_8px_30px_rgba(59,130,246,0.18)]"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/0 to-transparent group-hover:via-primary/80 transition-all duration-500" />

                  <div className="flex justify-between items-start mb-5">
                    <div className="h-11 w-11 rounded-xl border border-border/60 bg-background/40 backdrop-blur flex items-center justify-center text-primary group-hover:shadow-[0_0_18px_rgba(59,130,246,0.45)] group-hover:border-primary/40 transition-all">
                      <Code2 className="w-5 h-5" />
                    </div>

                    {portal.is_active && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/[0.08] backdrop-blur px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        </span>
                        Active
                      </span>
                    )}
                  </div>

                  <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                    {portal.name}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {portal.description ||
                      'Adaptive hierarchical problem set optimized by the PyTorch GNN engine.'}
                  </p>

                  <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                      <Terminal className="h-3 w-3 text-primary" />
                      Adaptive
                    </span>
                    <div className="h-7 w-7 rounded-full border border-border/60 bg-background/40 backdrop-blur text-muted-foreground flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:border-primary/60 group-hover:text-primary group-hover:shadow-[0_0_12px_rgba(59,130,246,0.5)] transition-all duration-300">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {portals.length === 0 && (
              <div
                data-testid="hub-empty-state"
                className="col-span-full p-12 rounded-2xl border border-dashed border-border/60 bg-card/30 backdrop-blur text-center"
              >
                <div className="h-14 w-14 mx-auto rounded-2xl border border-border/60 bg-background/40 flex items-center justify-center mb-3">
                  <Code2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No active portals found. Add some from the Django Admin.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodingHub;