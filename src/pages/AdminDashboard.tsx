import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/hooks/use-store";
import { store as rawStore, Round, Competitor } from "@/lib/store";
import { getUserRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Trophy, LogOut, Users, LayoutList } from "lucide-react";

export default function AdminDashboard() {
  const store = useStore();
  const navigate = useNavigate();
  const email = rawStore.getSession();

  if (!email || getUserRole(email) !== "admin") {
    navigate("/");
    return null;
  }

  const rounds = store.getRounds();
  const allCompetitors = store.getCompetitors();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <Button variant="ghost" size="sm" onClick={() => { rawStore.clearSession(); navigate("/"); }}>
            <LogOut className="mr-1 h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Tabs defaultValue="rounds" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="rounds"><LayoutList className="mr-1 h-4 w-4" />Rounds</TabsTrigger>
            <TabsTrigger value="competitors"><Users className="mr-1 h-4 w-4" />Competitors</TabsTrigger>
            <TabsTrigger value="results"><Trophy className="mr-1 h-4 w-4" />Results</TabsTrigger>
          </TabsList>

          <TabsContent value="rounds">
            <RoundsTab rounds={rounds} />
          </TabsContent>
          <TabsContent value="competitors">
            <CompetitorsTab rounds={rounds} competitors={allCompetitors} />
          </TabsContent>
          <TabsContent value="results">
            <ResultsTab rounds={rounds} competitors={allCompetitors} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function RoundsTab({ rounds }: { rounds: Round[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRound, setEditRound] = useState<Round | null>(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"active" | "closed">("active");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAdd = () => { setEditRound(null); setName(""); setStatus("active"); setDialogOpen(true); };
  const openEdit = (r: Round) => { setEditRound(r); setName(r.round_name); setStatus(r.status); setDialogOpen(true); };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editRound) {
      rawStore.updateRound(editRound.id, { round_name: name.trim(), status });
    } else {
      const r = rawStore.addRound(name.trim());
      rawStore.updateRound(r.id, { status });
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Manage Rounds</h2>
        <Button onClick={openAdd} size="sm"><Plus className="mr-1 h-4 w-4" />Add Round</Button>
      </div>

      {rounds.length === 0 && <p className="py-8 text-center text-muted-foreground">No rounds yet.</p>}

      <div className="grid gap-3">
        {rounds.map((r) => (
          <Card key={r.id} className="animate-fade-in">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="font-medium">{r.round_name}</span>
                <Badge variant={r.status === "active" ? "default" : "secondary"}
                  className={r.status === "active" ? "bg-success text-success-foreground" : ""}>
                  {r.status === "active" ? "Active" : "Closed"}
                </Badge>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editRound ? "Edit Round" : "Add Round"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <Input placeholder="Round name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            <Select value={status} onValueChange={(v) => setStatus(v as "active" | "closed")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={!name.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Round?</AlertDialogTitle>
            <AlertDialogDescription>This will also delete all competitors and votes in this round.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) rawStore.deleteRound(deleteId); setDeleteId(null); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CompetitorsTab({ rounds, competitors }: { rounds: Round[]; competitors: Competitor[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editComp, setEditComp] = useState<Competitor | null>(null);
  const [name, setName] = useState("");
  const [roundId, setRoundId] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAdd = () => { setEditComp(null); setName(""); setRoundId(rounds[0]?.id || ""); setDialogOpen(true); };
  const openEdit = (c: Competitor) => { setEditComp(c); setName(c.name); setRoundId(c.round_id); setDialogOpen(true); };

  const handleSave = () => {
    if (!name.trim() || !roundId) return;
    if (editComp) {
      rawStore.updateCompetitor(editComp.id, { name: name.trim(), round_id: roundId });
    } else {
      rawStore.addCompetitor(name.trim(), roundId);
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Manage Competitors</h2>
        <Button onClick={openAdd} size="sm" disabled={rounds.length === 0}><Plus className="mr-1 h-4 w-4" />Add Competitor</Button>
      </div>

      {rounds.map((r) => {
        const rc = competitors.filter((c) => c.round_id === r.id);
        if (rc.length === 0) return null;
        return (
          <div key={r.id} className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">{r.round_name}</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {rc.map((c) => (
                <Card key={c.id} className="animate-fade-in">
                  <CardContent className="flex items-center justify-between p-3">
                    <span className="font-medium">{c.name}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {competitors.length === 0 && <p className="py-8 text-center text-muted-foreground">No competitors yet.</p>}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editComp ? "Edit Competitor" : "Add Competitor"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <Input placeholder="Competitor name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            <Select value={roundId} onValueChange={setRoundId}>
              <SelectTrigger><SelectValue placeholder="Select round" /></SelectTrigger>
              <SelectContent>
                {rounds.map((r) => <SelectItem key={r.id} value={r.id}>{r.round_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={!name.trim() || !roundId}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Competitor?</AlertDialogTitle>
            <AlertDialogDescription>This will also remove all votes for this competitor.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) rawStore.deleteCompetitor(deleteId); setDeleteId(null); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ResultsTab({ rounds, competitors }: { rounds: Round[]; competitors: Competitor[] }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Results & Leaderboard</h2>
      {rounds.map((r) => {
        const rc = competitors.filter((c) => c.round_id === r.id);
        const withVotes = rc.map((c) => ({ ...c, votes: rawStore.getVoteCount(c.id) })).sort((a, b) => b.votes - a.votes);
        const topVotes = withVotes[0]?.votes || 0;

        return (
          <Card key={r.id} className="animate-fade-in">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{r.round_name}</CardTitle>
                <Badge variant={r.status === "active" ? "default" : "secondary"}
                  className={r.status === "active" ? "bg-success text-success-foreground" : ""}>
                  {r.status === "active" ? "Active" : "Closed"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {withVotes.length === 0 && <p className="text-sm text-muted-foreground">No competitors</p>}
              {withVotes.map((c, i) => (
                <div key={c.id} className={`flex items-center justify-between rounded-lg px-3 py-2 ${i === 0 && topVotes > 0 ? "bg-warning/10 ring-1 ring-warning/30" : "bg-muted/50"}`}>
                  <div className="flex items-center gap-2">
                    {i === 0 && topVotes > 0 && <Trophy className="h-4 w-4 text-warning" />}
                    <span className="text-sm font-medium text-muted-foreground">#{i + 1}</span>
                    <span className="font-medium">{c.name}</span>
                  </div>
                  <Badge variant="outline">{c.votes} vote{c.votes !== 1 ? "s" : ""}</Badge>
                </div>
              ))}
              {topVotes > 0 && (
                <p className="mt-1 text-sm font-semibold text-warning">
                  🏆 1st Place: {withVotes[0].name} ({topVotes} Votes)
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
      {rounds.length === 0 && <p className="py-8 text-center text-muted-foreground">No rounds yet.</p>}
    </div>
  );
}
