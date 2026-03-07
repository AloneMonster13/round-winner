import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/hooks/use-store";
import { store as rawStore } from "@/lib/store";
import { getUserRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { LogOut, ChevronRight, Trophy, Vote, ArrowLeft, Lock } from "lucide-react";

export default function UserDashboard() {
  const store = useStore();
  const navigate = useNavigate();
  const email = rawStore.getSession();
  const [selectedRound, setSelectedRound] = useState<string | null>(null);
  const [confirmVote, setConfirmVote] = useState<{ roundId: string; competitorId: string; competitorName: string } | null>(null);

  if (!email || getUserRole(email) !== "user") {
    navigate("/");
    return null;
  }

  const rounds = store.getRounds();
  const round = selectedRound ? rounds.find((r) => r.id === selectedRound) : null;

  const handleConfirmVote = () => {
    if (!confirmVote) return;
    const success = rawStore.castVote(email, confirmVote.roundId, confirmVote.competitorId);
    setConfirmVote(null);
    if (success) {
      toast({ title: "Vote Submitted! ✓", description: "Your vote has been successfully submitted. You cannot vote again in this round." });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            {selectedRound && (
              <Button variant="ghost" size="icon" onClick={() => setSelectedRound(null)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h1 className="text-xl font-bold">{selectedRound ? round?.round_name : "Rounds"}</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { rawStore.clearSession(); navigate("/"); }}>
            <LogOut className="mr-1 h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {!selectedRound ? (
          <RoundsList rounds={rounds} onSelect={setSelectedRound} />
        ) : (
          <RoundDetail roundId={selectedRound} email={email} onVote={setConfirmVote} />
        )}
      </main>

      <AlertDialog open={!!confirmVote} onOpenChange={() => setConfirmVote(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Vote</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to vote for <strong>{confirmVote?.competitorName}</strong>? You can only vote once in this round. This action cannot be changed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmVote}>Confirm Vote</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function RoundsList({ rounds, onSelect }: { rounds: ReturnType<typeof rawStore.getRounds>; onSelect: (id: string) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Select a round to view competitors and vote.</p>
      {rounds.length === 0 && <p className="py-12 text-center text-muted-foreground">No rounds available yet.</p>}
      {rounds.map((r) => (
        <Card key={r.id} className="cursor-pointer transition-shadow hover:shadow-md animate-fade-in" onClick={() => onSelect(r.id)}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className="font-medium">{r.round_name}</span>
              <Badge variant={r.status === "active" ? "default" : "secondary"}
                className={r.status === "active" ? "bg-success text-success-foreground" : ""}>
                {r.status === "active" ? "Active" : "Closed"}
              </Badge>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RoundDetail({ roundId, email, onVote }: {
  roundId: string;
  email: string;
  onVote: (v: { roundId: string; competitorId: string; competitorName: string }) => void;
}) {
  const store = useStore();
  const round = store.getRounds().find((r) => r.id === roundId);
  const competitors = store.getCompetitors(roundId);
  const hasVoted = rawStore.hasVoted(email, roundId);
  const isClosed = round?.status === "closed";
  const votingDisabled = hasVoted || isClosed;

  const withVotes = competitors.map((c) => ({ ...c, votes: rawStore.getVoteCount(c.id) })).sort((a, b) => b.votes - a.votes);
  const topVotes = withVotes[0]?.votes || 0;

  return (
    <div className="space-y-4">
      {isClosed && (
        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" /> This round is closed. Voting is disabled.
        </div>
      )}
      {hasVoted && !isClosed && (
        <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          <Vote className="h-4 w-4" /> You have already voted in this round.
        </div>
      )}

      <div className="grid gap-3">
        {withVotes.map((c, i) => (
          <Card key={c.id} className={`animate-fade-in ${i === 0 && topVotes > 0 && (hasVoted || isClosed) ? "ring-2 ring-warning/40" : ""}`}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {(hasVoted || isClosed) && i === 0 && topVotes > 0 && <Trophy className="h-5 w-5 text-warning" />}
                <div>
                  <p className="font-medium">{c.name}</p>
                  {(hasVoted || isClosed) && (
                    <p className="text-sm text-muted-foreground">{c.votes} vote{c.votes !== 1 ? "s" : ""}</p>
                  )}
                </div>
              </div>
              {!votingDisabled && (
                <Button size="sm" onClick={() => onVote({ roundId, competitorId: c.id, competitorName: c.name })}>
                  <Vote className="mr-1 h-4 w-4" /> Vote
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {withVotes.length === 0 && <p className="py-8 text-center text-muted-foreground">No competitors in this round.</p>}

      {(hasVoted || isClosed) && topVotes > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-5 w-5 text-warning" /> Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {withVotes.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <span>#{i + 1} {c.name}</span>
                <span className="font-medium">{c.votes}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
