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
  Flame, 
  Star,
  Zap
} from "lucide-react";

/**
 * MODERN RED BULB COMPONENT
 * A blinking bulb: Red outer glow, white-hot center.
 */
const RedBulb = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <div 
    className={`relative flex items-center justify-center ${className}`}
    style={style}
  >
    {/* Outer Glow */}
    <div className="absolute inset-0 bg-red-600 blur-[8px] rounded-full animate-pulse opacity-60" />
    {/* Middle Ring */}
    <div className="h-full w-full bg-red-500 rounded-full border border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
    {/* White Hot Center */}
    <div className="absolute h-[30%] w-[30%] bg-white rounded-full blur-[1px] shadow-white shadow-sm" />
  </div>
);

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0a0101] pointer-events-none">
      {/* Radial Gradient overlay for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(185,28,28,0.1)_0%,transparent_70%)]" />
      
      {/* Blinking Bulbs Grid */}
      {[...Array(20)].map((_, i) => {
        const randomTop = Math.random() * 100;
        const randomLeft = Math.random() * 100;
        const duration = 2 + Math.random() * 3;
        const delay = Math.random() * 5;
        const size = Math.random() * 6 + 4;

        return (
          <RedBulb
            key={i}
            className="absolute"
            style={{
              top: `${randomTop}%`,
              left: `${randomLeft}%`,
              width: `${size}px`,
              height: `${size}px`,
              animation: `pulse ${duration}s infinite ease-in-out ${delay}s`,
            }}
          />
        );
      })}
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
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
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
    <div className="min-h-screen text-white font-sans selection:bg-red-900 selection:text-white">
      <AnimatedBackground />

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {selectedRound && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedRound(null)}
                className="rounded-full text-white hover:bg-red-600/20 hover:text-red-400 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_red]" />
               <h1 className="text-xl font-black uppercase tracking-widest text-white italic">
                {selectedRound ? round?.round_name : "Arena Hub"}
              </h1>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="border-white/20 bg-transparent text-white hover:bg-red-600 hover:border-red-600 rounded-full transition-all duration-300"
            onClick={() => {
              localStorage.removeItem("session");
              navigate("/");
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-2xl px-6 py-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        {!selectedRound ? (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">Active Battles</h2>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                Select a live round to influence the outcome <Zap className="h-3 w-3 text-red-500 fill-red-500" />
              </p>
            </div>
            <RoundsList rounds={rounds} onSelect={setSelectedRound} />
          </div>
        ) : (
          <RoundDetail
            roundId={selectedRound}
            email={email!}
            competitors={competitors}
            votes={votes}
            round={round}
            onVote={setConfirmVote}
          />
        )}
      </main>

      {/* MODERN DIALOG */}
      <AlertDialog open={!!confirmVote} onOpenChange={() => setConfirmVote(null)}>
        <AlertDialogContent className="bg-zinc-900 border border-white/10 shadow-2xl rounded-3xl max-w-[90vw] sm:max-w-md text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold flex items-center gap-2">
              <RedBulb className="h-3 w-3" /> Confirm Your Pick
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400 text-base">
              You are backing <span className="text-red-500 font-bold underline decoration-red-500/50 underline-offset-4">{confirmVote?.competitorName}</span>. 
              This power move is permanent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
            <AlertDialogCancel className="rounded-xl border-white/10 bg-zinc-800 text-white hover:bg-zinc-700">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmVote}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-900/40 transition-transform active:scale-95"
            >
              Lock It In
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
          className="group cursor-pointer overflow-hidden border border-white/5 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 active:scale-[0.98] rounded-2xl relative"
        >
          {/* Decorative Red Corner Light */}
          {r.status === 'active' && (
             <div className="absolute top-0 right-0 p-2">
                <RedBulb className="h-2 w-2" />
             </div>
          )}
          
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-xl transition-all duration-500 ${r.status === 'active' ? 'bg-red-600/20 text-red-500 group-hover:bg-red-600 group-hover:text-white shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'bg-zinc-800 text-zinc-600'}`}>
                <Vote className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg tracking-tight group-hover:translate-x-1 transition-transform">{r.round_name}</h3>
                <Badge className={`mt-1 font-bold border-none ${r.status === "active" ? "bg-red-600 text-white animate-pulse" : "bg-zinc-800 text-zinc-500"}`}>
                  {r.status.toUpperCase()}
                </Badge>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-red-500 transform group-hover:translate-x-1 transition-all" />
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
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-700">
      {isClosed ? (
        <div className="flex items-center gap-3 bg-red-950/30 p-4 rounded-2xl text-red-400 border border-red-900/50 backdrop-blur-sm">
          <Lock className="h-5 w-5" />
          <span className="font-bold uppercase tracking-widest text-sm">Gate Closed - Results Finalized</span>
        </div>
      ) : hasVoted ? (
        <div className="bg-zinc-900/50 p-4 rounded-2xl text-red-500 border border-red-500/20 font-bold text-center tracking-wide flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4" /> VOTE REGISTERED <Sparkles className="h-4 w-4" />
        </div>
      ) : null}

      <div className="grid gap-4">
        {withVotes.map((c: any, i: number) => (
          <Card
            key={c._id}
            className={`border-none transition-all duration-500 rounded-2xl overflow-hidden relative group ${
              i === 0 && topVotes > 0 
              ? "bg-gradient-to-r from-red-900/20 to-zinc-900 border border-red-500/30" 
              : "bg-zinc-900/40 border border-white/5"
            }`}
          >
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                   <div className="h-14 w-14 bg-zinc-800 rounded-2xl flex items-center justify-center font-black text-xl text-white border border-white/10 group-hover:border-red-500/50 transition-colors">
                     {c.name.charAt(0)}
                   </div>
                   {i === 0 && topVotes > 0 && (
                     <div className="absolute -top-2 -right-2 bg-red-600 p-1 rounded-full shadow-[0_0_10px_red]">
                       <Trophy className="h-3 w-3 text-white" />
                     </div>
                   )}
                </div>

                <div>
                  <p className="font-black text-white text-xl leading-tight uppercase italic">{c.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <RedBulb className="h-2 w-2" />
                    <p className="text-sm font-bold text-red-500 tracking-widest">
                      {c.votes} {c.votes === 1 ? 'UNIT' : 'UNITS'}
                    </p>
                  </div>
                </div>
              </div>

              {!hasVoted && !isClosed && (
                <Button
                  size="sm"
                  className="bg-white text-black hover:bg-red-600 hover:text-white font-black rounded-lg px-6 transition-all active:scale-90 uppercase tracking-tighter shadow-lg"
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