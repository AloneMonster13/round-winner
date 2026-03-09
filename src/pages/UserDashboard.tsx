import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserRole } from "@/lib/auth";
import { API } from "@/api/api";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { 
  LogOut, 
  ChevronRight, 
  Trophy, 
  Vote, 
  ArrowLeft, 
  Lock, 
  Sparkles, 
  Zap
} from "lucide-react";

/**
 * MODERN RED BULB COMPONENT
 */
const RedBulb = ({ className, style, size = "8px" }: { className?: string, style?: React.CSSProperties, size?: string }) => (
  <div 
    className={`relative flex items-center justify-center shrink-0 ${className}`}
    style={{ ...style, width: size, height: size }}
  >
    {/* Outer Neon Glow */}
    <div className="absolute inset-[-150%] bg-red-600 blur-[10px] rounded-full animate-pulse opacity-40" />
    {/* Physical Bulb */}
    <div className="h-full w-full bg-red-500 rounded-full border border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.9)]" />
    {/* White Hot Filament */}
    <div className="absolute h-[35%] w-[35%] bg-white rounded-full blur-[0.5px] shadow-white shadow-sm" />
  </div>
);

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050000] pointer-events-none">
      {/* Dynamic Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      {/* Randomized High-Tech Bulbs */}
      {[...Array(25)].map((_, i) => {
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        const size = Math.random() * 8 + 4; // Varying sizes from 4px to 12px
        const duration = 1.5 + Math.random() * 4;
        const delay = Math.random() * 5;

        return (
          <RedBulb
            key={i}
            className="absolute"
            size={`${size}px`}
            style={{
              top: `${top}%`,
              left: `${left}%`,
              animation: `flicker ${duration}s infinite ease-in-out ${delay}s`,
            }}
          />
        );
      })}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flicker {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
          51% { opacity: 0.4; }
          52% { opacity: 1; }
        }
      `}} />
    </div>
  );
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const email = localStorage.getItem("session");

  const [rounds, setRounds] = useState<any[]>([]);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [selectedRound, setSelectedRound] = useState<string | null>(null);
  const [confirmVote, setConfirmVote] = useState<any>(null);

  useEffect(() => {
    if (!email || getUserRole(email) !== "user") {
      navigate("/");
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [roundsRes, compRes, voteRes] = await Promise.all([
        API.get("/rounds"),
        API.get("/competitors"),
        API.get("/votes"),
      ]);
      setRounds(roundsRes.data);
      setCompetitors(compRes.data);
      setVotes(voteRes.data);
    } catch (e) {
      console.error("Data load failed", e);
    }
  };

  const handleConfirmVote = async () => {
    if (!confirmVote) return;
    try {
      await API.post("/votes", {
        user_email: email,
        round_id: confirmVote.roundId,
        competitor_id: confirmVote.competitorId,
      });
      setConfirmVote(null);
      await loadData();
    } catch {
      alert("You already voted in this round");
    }
  };

  const round = selectedRound ? rounds.find((r) => r._id === selectedRound) : null;

  return (
    <div className="min-h-screen text-white font-sans selection:bg-red-600 selection:text-white pb-10">
      <AnimatedBackground />

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            {selectedRound && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedRound(null)}
                className="rounded-full bg-white/5 text-white hover:bg-red-600 transition-all"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="flex flex-col">
               <div className="flex items-center gap-2">
                 <RedBulb size="10px" className="animate-bounce" />
                 <h1 className="text-xl font-black uppercase tracking-tighter italic leading-none">
                  {selectedRound ? "Battle Detail" : "Arena Hub"}
                </h1>
               </div>
               {selectedRound && <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1">{round?.round_name}</span>}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="border-white/10 bg-white/5 text-white hover:bg-red-600 hover:border-red-600 rounded-full transition-all text-xs font-bold"
            onClick={() => {
              localStorage.removeItem("session");
              navigate("/");
            }}
          >
            <LogOut className="mr-2 h-3 w-3" />
            Exit
          </Button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-2xl px-4 py-8">
        {!selectedRound ? (
          <div className="space-y-8">
            <div className="px-2">
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-2">Active Battles</h2>
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                <span className="flex h-2 w-2 rounded-full bg-red-600 animate-ping" />
                Live outcome influence active
              </div>
            </div>
            <RoundsList rounds={rounds} onSelect={setSelectedRound} />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <RoundDetail
              roundId={selectedRound}
              email={email!}
              competitors={competitors}
              votes={votes}
              round={round}
              onVote={setConfirmVote}
            />
          </div>
        )}
      </main>

      {/* ALERT DIALOG */}
      <AlertDialog open={!!confirmVote} onOpenChange={() => setConfirmVote(null)}>
        <AlertDialogContent className="bg-[#0f0101] border border-red-900/50 shadow-[0_0_50px_rgba(220,38,38,0.15)] rounded-[2rem] max-w-[90vw] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Zap className="text-red-600 fill-red-600" /> Confirm Selection
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400 text-base">
              You are locking in your support for <span className="text-white font-bold underline decoration-red-600 underline-offset-4">{confirmVote?.competitorName}</span>. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-4">
            <AlertDialogCancel className="rounded-xl border-white/5 bg-white/5 text-white hover:bg-white/10">Abort</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmVote}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold px-8 shadow-lg shadow-red-900/40"
            >
              Lock Vote
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function RoundsList({ rounds, onSelect }: any) {
  return (
    <div className="grid gap-4">
      {rounds.map((r: any) => (
        <Card
          key={r._id}
          onClick={() => onSelect(r._id)}
          className="group cursor-pointer overflow-hidden border border-white/5 bg-white/[0.03] hover:bg-white/[0.07] backdrop-blur-md transition-all duration-500 hover:border-red-600/50 hover:shadow-[0_0_30px_rgba(220,38,38,0.1)] rounded-[1.5rem] relative"
        >
          {/* Internal Glow on Hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/0 to-red-600/0 group-hover:from-red-600/[0.05] group-hover:to-transparent transition-all duration-500" />
          
          <CardContent className="flex items-center justify-between p-5 relative z-10">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl transition-all duration-500 ${r.status === 'active' ? 'bg-red-600/10 text-red-500 group-hover:bg-red-600 group-hover:text-white shadow-[0_0_20px_rgba(220,38,38,0.15)]' : 'bg-zinc-900 text-zinc-600'}`}>
                <Vote className={`h-6 w-6 ${r.status === 'active' ? 'animate-pulse' : ''}`} />
              </div>
              <div>
                <h3 className="font-black text-white text-xl tracking-tighter uppercase italic group-hover:translate-x-1 transition-transform">{r.round_name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${r.status === 'active' ? 'bg-red-500' : 'bg-zinc-600'}`} />
                  <span className={`text-[10px] font-black tracking-widest uppercase ${r.status === 'active' ? 'text-red-500' : 'text-zinc-500'}`}>
                    {r.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
                {r.status === 'active' && <RedBulb size="6px" className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RoundDetail({ roundId, email, competitors, votes, round, onVote }: any) {
  const roundCompetitors = competitors.filter((c: any) => c.round_id === roundId);
  const hasVoted = votes.find((v: any) => v.user_email === email && v.round_id === roundId);
  const isClosed = round?.status === "closed";

  const voteCount = (id: string) => votes.filter((v: any) => v.competitor_id === id).length;

  const withVotes = roundCompetitors
    .map((c: any) => ({
      ...c,
      votes: voteCount(c._id),
    }))
    .sort((a: any, b: any) => b.votes - a.votes);

  const topVotes = withVotes[0]?.votes || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
          {isClosed ? (
            <Badge className="bg-zinc-900 border-zinc-800 text-zinc-500 py-2 px-4 rounded-full flex items-center gap-2 uppercase font-black tracking-widest text-[10px]">
              <Lock className="h-3 w-3" /> Final Results
            </Badge>
          ) : hasVoted ? (
            <Badge className="bg-red-600/20 border-red-600/50 text-red-500 py-2 px-4 rounded-full flex items-center gap-2 uppercase font-black tracking-widest text-[10px]">
              <Sparkles className="h-3 w-3" /> Selection Confirmed
            </Badge>
          ) : (
            <Badge className="bg-red-600 border-none text-white py-2 px-4 rounded-full flex items-center gap-2 uppercase font-black tracking-widest text-[10px] animate-pulse">
              <Zap className="h-3 w-3 fill-white" /> Live Voting
            </Badge>
          )}
      </div>

      <div className="grid gap-4">
        {withVotes.map((c: any, i: number) => (
          <Card
            key={c._id}
            className={`border-none transition-all duration-500 rounded-[2rem] overflow-hidden relative group ${
              i === 0 && topVotes > 0 
              ? "bg-gradient-to-r from-red-600/[0.15] to-zinc-900/80 border border-red-500/20" 
              : "bg-white/[0.02] border border-white/5"
            }`}
          >
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                   <div className="h-16 w-16 bg-zinc-900 rounded-[1.5rem] flex items-center justify-center font-black text-2xl text-white border border-white/10 group-hover:border-red-600/50 transition-colors">
                     {c.name.charAt(0)}
                   </div>
                   {i === 0 && topVotes > 0 && (
                     <div className="absolute -top-2 -right-2 bg-red-600 p-1.5 rounded-full shadow-[0_0_15px_red] animate-bounce">
                       <Trophy className="h-3 w-3 text-white" />
                     </div>
                   )}
                </div>

                <div>
                  <h4 className="font-black text-white text-2xl leading-none uppercase italic">{c.name}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <RedBulb size="6px" />
                    <p className="text-xs font-black text-red-500 tracking-[0.2em] uppercase">
                      {c.votes} {c.votes === 1 ? 'Power' : 'Powers'}
                    </p>
                  </div>
                </div>
              </div>

              {!hasVoted && !isClosed && (
                <Button
                  size="sm"
                  className="bg-white text-black hover:bg-red-600 hover:text-white font-black rounded-xl px-6 transition-all active:scale-90 uppercase tracking-tighter h-12"
                  onClick={() =>
                    onVote({
                      roundId,
                      competitorId: c._id,
                      competitorName: c.name,
                    })
                  }
                >
                  Vote
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}