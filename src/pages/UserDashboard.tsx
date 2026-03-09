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
  Star 
} from "lucide-react";

/**
 * ANIMATED BACKGROUND COMPONENT
 * Creates blinking, floating icons in the background
 */
const AnimatedBackground = () => {
  const icons = [Sparkles, Flame, Star, Trophy];
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {[...Array(12)].map((_, i) => {
        const Icon = icons[i % icons.length];
        const randomTop = Math.random() * 100;
        const randomLeft = Math.random() * 100;
        const duration = 3 + Math.random() * 4;
        const delay = Math.random() * 5;

        return (
          <Icon
            key={i}
            className="absolute text-red-100 animate-pulse"
            style={{
              top: `${randomTop}%`,
              left: `${randomLeft}%`,
              width: `${Math.random() * 20 + 10}px`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              opacity: 0.4,
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-red-100">
      <AnimatedBackground />

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {selectedRound && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedRound(null)}
                className="rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-xl font-extrabold tracking-tight text-slate-800">
              {selectedRound ? round?.round_name : "Arena Dashboard"}
            </h1>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="border-slate-200 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 rounded-full transition-all"
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
      <main className="mx-auto max-w-2xl px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {!selectedRound ? (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-900">Active Competitions</h2>
              <p className="text-slate-500 text-sm">Pick a round to cast your vote.</p>
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
        <AlertDialogContent className="bg-white border-none shadow-2xl rounded-3xl max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold">Confirm Vote</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 text-base">
              You are about to vote for <span className="text-red-600 font-bold underline decoration-red-200 underline-offset-4">{confirmVote?.competitorName}</span>. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl border-slate-200">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmVote}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-200 transition-transform active:scale-95"
            >
              Confirm My Vote
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
          className="group cursor-pointer overflow-hidden border-none bg-white shadow-sm hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300 active:scale-[0.98] rounded-2xl"
        >
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl transition-colors ${r.status === 'active' ? 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white' : 'bg-slate-100 text-slate-400'}`}>
                <Vote className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{r.round_name}</h3>
                <Badge className={`mt-1 font-medium ${r.status === "active" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-slate-100 text-slate-500 hover:bg-slate-100"}`}>
                  {r.status.toUpperCase()}
                </Badge>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-red-500 transform group-hover:translate-x-1 transition-all" />
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
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      {isClosed && (
        <div className="flex items-center gap-3 bg-red-50 p-4 rounded-2xl text-red-700 border border-red-100">
          <div className="bg-red-600 p-1.5 rounded-full">
             <Lock className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold">Voting for this round has ended.</span>
        </div>
      )}

      {hasVoted && !isClosed && (
        <div className="bg-green-50 p-4 rounded-2xl text-green-700 border border-green-100 font-medium text-center">
          You have already cast your vote! 🎉
        </div>
      )}

      <div className="grid gap-4">
        {withVotes.map((c: any, i: number) => (
          <Card
            key={c._id}
            className={`border-none shadow-sm transition-all duration-300 rounded-2xl overflow-hidden ${
              i === 0 && topVotes > 0 ? "ring-2 ring-red-500/20 bg-gradient-to-br from-white to-red-50/30" : "bg-white"
            }`}
          >
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                   <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400">
                     {c.name.charAt(0)}
                   </div>
                   {i === 0 && topVotes > 0 && (
                     <div className="absolute -top-1 -right-1 bg-yellow-400 p-1 rounded-full shadow-sm">
                       <Trophy className="h-3 w-3 text-white" />
                     </div>
                   )}
                </div>

                <div>
                  <p className="font-bold text-slate-800 text-lg leading-tight">{c.name}</p>
                  <p className="text-sm font-medium text-red-600/70">
                    {c.votes} {c.votes === 1 ? 'vote' : 'votes'}
                  </p>
                </div>
              </div>

              {!hasVoted && !isClosed && (
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-5 shadow-lg shadow-red-200 transition-all active:scale-90"
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