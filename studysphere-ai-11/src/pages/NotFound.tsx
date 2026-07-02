import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1e] via-[#08091a] to-[#050612] p-4 relative overflow-hidden">
      {/* Ambient background glow for true-black theme */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[130px]" />
      </div>
      
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="text-center relative z-10 space-y-6 max-w-md w-full p-8 rounded-2xl bg-white/[0.02] backdrop-blur-2xl border border-white/[0.06] shadow-[0_0_80px_rgba(99,102,241,0.15)] animate-in fade-in zoom-in-95 duration-500">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent"/>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.1),transparent_60%)] pointer-events-none"/>
        
        <div className="relative flex justify-center mb-6">
          <div className="absolute inset-0 bg-indigo-500/30 blur-2xl rounded-full"/>
          <div className="relative h-24 w-24 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 border border-indigo-400/30 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)]">
            <AlertCircle className="h-10 w-10 text-indigo-300" />
          </div>
        </div>

        <div className="space-y-2 relative">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-violet-200 bg-clip-text text-transparent">
            404
          </h1>
          <p className="text-lg text-slate-300">Oops! Page not found</p>
          <p className="text-sm text-slate-500 font-mono mt-2">
            {location.pathname}
          </p>
        </div>

        <div className="pt-4 relative">
          <Button asChild className="group w-full h-11 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-semibold shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.65)] transition-all">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform"/>
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
