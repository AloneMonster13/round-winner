import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserRole } from "@/lib/auth";
import { API } from "@/api/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

import { LogOut, ChevronRight, Trophy, Vote, ArrowLeft, Lock } from "lucide-react";

export default function UserDashboard() {
  const navigate = useNavigate();

  const email = localStorage.getItem("session");

  const [rounds, setRounds] = useState<any[]>([]);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [selectedRound, setSelectedRound] = useState<string | null>(null);

  const [confirmVote, setConfirmVote] = useState<{
    roundId: string;
    competitorId: string;
    competitorName: string;
  } | null>(null);

  useEffect(() => {
    if (!email || getUserRole(email) !== "user") {
      navigate("/");
      return;
    }

    loadData();
  }, []);

  const loadData = async () => {
    const roundsRes = await API.get("/rounds");
    const compRes = await API.get("/competitors");
    const voteRes = await API.get("/votes");

    setRounds(roundsRes.data);
    setCompetitors(compRes.data);
    setVotes(voteRes.data);
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

      alert("Vote Submitted ✓");

    } catch (err) {
      alert("You already voted in this round");
    }
  };

  const round = selectedRound
    ? rounds.find((r) => r._id === selectedRound)
    : null;

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

            <h1 className="text-xl font-bold">
              {selectedRound ? round?.round_name : "Rounds"}
            </h1>

          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              localStorage.removeItem("session");
              navigate("/");
            }}
          >
            <LogOut className="mr-1 h-4 w-4" /> Logout
          </Button>

        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">

        {!selectedRound ? (
          <RoundsList rounds={rounds} onSelect={setSelectedRound} />
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

      <AlertDialog open={!!confirmVote} onOpenChange={() => setConfirmVote(null)}>
        <AlertDialogContent>

          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Vote</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to vote for
              <strong> {confirmVote?.competitorName}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmVote}>
              Confirm Vote
            </AlertDialogAction>
          </AlertDialogFooter>

        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

function RoundsList({ rounds, onSelect }: any) {
  return (
    <div className="space-y-3">

      <p className="text-sm text-muted-foreground">
        Select a round to view competitors and vote.
      </p>

      {rounds.map((r: any) => (
        <Card
          key={r._id}
          className="cursor-pointer hover:shadow-md"
          onClick={() => onSelect(r._id)}
        >
          <CardContent className="flex items-center justify-between p-4">

            <div className="flex items-center gap-3">

              <span className="font-medium">{r.round_name}</span>

              <Badge
                variant={r.status === "active" ? "default" : "secondary"}
              >
                {r.status}
              </Badge>

            </div>

            <ChevronRight className="h-4 w-4 text-muted-foreground" />

          </CardContent>
        </Card>
      ))}

    </div>
  );
}

function RoundDetail({ roundId, email, competitors, votes, round, onVote }: any) {

  const roundCompetitors = competitors.filter(
    (c: any) => c.round_id === roundId
  );

  const hasVoted = votes.find(
    (v: any) => v.user_email === email && v.round_id === roundId
  );

  const isClosed = round?.status === "closed";

  const voteCount = (id: string) =>
    votes.filter((v: any) => v.competitor_id === id).length;

  const withVotes = roundCompetitors
    .map((c: any) => ({
      ...c,
      votes: voteCount(c._id),
    }))
    .sort((a: any, b: any) => b.votes - a.votes);

  const topVotes = withVotes[0]?.votes || 0;

  return (
    <div className="space-y-4">

      {isClosed && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          This round is closed
        </div>
      )}

      <div className="grid gap-3">

        {withVotes.map((c: any, i: number) => (

          <Card key={c._id}>

            <CardContent className="flex items-center justify-between p-4">

              <div className="flex items-center gap-3">

                {i === 0 && topVotes > 0 && <Trophy className="h-5 w-5 text-yellow-500" />}

                <div>

                  <p className="font-medium">{c.name}</p>

                  <p className="text-sm text-muted-foreground">
                    {c.votes} votes
                  </p>

                </div>

              </div>

              {!hasVoted && !isClosed && (
                <Button
                  size="sm"
                  onClick={() =>
                    onVote({
                      roundId,
                      competitorId: c._id,
                      competitorName: c.name,
                    })
                  }
                >
                  <Vote className="mr-1 h-4 w-4" /> Vote
                </Button>
              )}

            </CardContent>

          </Card>

        ))}

      </div>

    </div>
  );
}