import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserRole } from "@/lib/auth";
import { API } from "@/api/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Plus,
  Pencil,
  Trash2,
  Trophy,
  LogOut,
  Users,
  LayoutList,
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const email = localStorage.getItem("session");

  const [rounds, setRounds] = useState<any[]>([]);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!email || getUserRole(email) !== "admin") {
      navigate("/");
      return;
    }

    loadData();
  }, []);

  const loadData = async () => {
    const r = await API.get("/rounds");
    const c = await API.get("/competitors");
    const v = await API.get("/votes");
    const u = await API.get("/users");

    setRounds(r.data);
    setCompetitors(c.data);
    setVotes(v.data);
    setUsers(u.data);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 border-b bg-card/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              localStorage.removeItem("session");
              navigate("/");
            }}
          >
            <LogOut className="mr-1 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Tabs defaultValue="rounds" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="rounds">
              <LayoutList className="mr-1 h-4 w-4" />
              Rounds
            </TabsTrigger>

            <TabsTrigger value="competitors">
              <Users className="mr-1 h-4 w-4" />
              Competitors
            </TabsTrigger>

            <TabsTrigger value="results">
              <Trophy className="mr-1 h-4 w-4" />
              Results
            </TabsTrigger>

            <TabsTrigger value="users">
              <Users className="mr-1 h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rounds">
            <RoundsTab rounds={rounds} reload={loadData} />
          </TabsContent>

          <TabsContent value="competitors">
            <CompetitorsTab
              rounds={rounds}
              competitors={competitors}
              reload={loadData}
            />
          </TabsContent>

          <TabsContent value="results">
            <ResultsTab rounds={rounds} competitors={competitors} votes={votes} />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab users={users} reload={loadData} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/* ----------------------- RoundsTab ----------------------- */
function RoundsTab({ rounds, reload }: any) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [edit, setEdit] = useState<any>(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("active");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAdd = () => {
    setEdit(null);
    setName("");
    setStatus("active");
    setDialogOpen(true);
  };

  const openEdit = (r: any) => {
    setEdit(r);
    setName(r.round_name);
    setStatus(r.status);
    setDialogOpen(true);
  };

  const save = async () => {
    if (!name.trim()) return;

    if (edit)
      await API.put(`/rounds/${edit._id}`, { round_name: name, status });
    else
      await API.post("/rounds", { round_name: name, status });

    setDialogOpen(false);
    reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold">Manage Rounds</h2>

        <Button onClick={openAdd}>
          <Plus className="mr-1 h-4 w-4" />
          Add Round
        </Button>
      </div>

      {rounds.map((r: any) => (
        <Card key={r._id}>
          <CardContent className="flex justify-between p-4">
            <div className="flex gap-2">
              <span>{r.round_name}</span>
              <Badge>{r.status}</Badge>
            </div>

            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                <Pencil className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteId(r._id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{edit ? "Edit" : "Add"} Round</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Round name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <DialogFooter>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Round?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes competitors and votes.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={async () => {
                await API.delete(`/rounds/${deleteId}`);
                setDeleteId(null);
                reload();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ----------------------- CompetitorsTab ----------------------- */

function CompetitorsTab({ rounds, competitors, reload }: any) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [edit, setEdit] = useState<any>(null);
  const [name, setName] = useState("");
  const [roundId, setRoundId] = useState("");

  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const openAdd = () => {
    setEdit(null);
    setName("");
    setRoundId("");
    setPhoto(null);
    setPreview(null);
    setDialogOpen(true);
  };

  const save = async () => {

    const formData = new FormData();
    formData.append("name", name);
    formData.append("round_id", roundId);

    if (photo) {
      formData.append("photo", photo);
    }

    if (edit)
      await API.put(`/competitors/${edit._id}`, formData);
    else
      await API.post("/competitors", formData);

    setDialogOpen(false);
    reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold">Manage Competitors</h2>

        <Button onClick={openAdd}>
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>

      {competitors.map((c: any) => (
        <Card key={c._id}>
          <CardContent className="flex justify-between p-3">

            <div className="flex items-center gap-3">

              {c.photo && (
                <img
                  src={`https://round-winner-api.onrender.com/uploads/${c.photo}`}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}

              <span>{c.name}</span>

            </div>

          </CardContent>
        </Card>
      ))}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>

          <DialogHeader>
            <DialogTitle>Add Competitor</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {

              const file = e.target.files?.[0];
              if (!file) return;

              setPhoto(file);
              setPreview(URL.createObjectURL(file));

            }}
          />

          {preview && (
            <img
              src={preview}
              className="w-20 h-20 rounded-md object-cover"
            />
          )}

          <Select value={roundId} onValueChange={setRoundId}>
            <SelectTrigger>
              <SelectValue placeholder="Round" />
            </SelectTrigger>

            <SelectContent>
              {rounds.map((r: any) => (
                <SelectItem key={r._id} value={r._id}>
                  {r.round_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DialogFooter>
            <Button onClick={save}>Save</Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ----------------------- ResultsTab ----------------------- */

function ResultsTab({ rounds, competitors, votes }: any) {

  const count = (id: string) =>
    votes.filter((v: any) => v.competitor_id === id).length;

  return (
    <div className="space-y-6">

      {rounds.map((r: any) => {

        const rc = competitors.filter((c: any) => c.round_id === r._id);

        const withVotes = rc
          .map((c: any) => ({ ...c, votes: count(c._id) }))
          .sort((a, b) => b.votes - a.votes);

        return (
          <Card key={r._id}>

            <CardHeader>
              <CardTitle>{r.round_name}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">

              {withVotes.map((c: any, i: number) => (

                <div key={c._id} className="flex justify-between">

                  <span>
                    #{i + 1} {c.name}
                  </span>

                  <span>{c.votes}</span>

                </div>

              ))}

            </CardContent>

          </Card>
        );
      })}
    </div>
  );
}

/* ----------------------- UsersTab ----------------------- */

function UsersTab({ users, reload }: any) {

  const [email, setEmail] = useState("");

  const addUser = async () => {

    if (!email.trim()) return;

    try {

      await API.post("/users", { email: email.trim() });

      setEmail("");
      reload();

    } catch (err: any) {

      alert(err.response?.data?.message || "Error adding user");

    }
  };

  const deleteUser = async (id: string) => {

    if (!confirm("Delete this user?")) return;

    await API.delete(`/users/${id}`);
    reload();
  };

  return (
    <div className="space-y-4">

      <div className="flex gap-2">

        <Input
          placeholder="User email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button onClick={addUser}>
          Add User
        </Button>

      </div>

      {users.map((u: any) => (

        <Card key={u._id}>

          <CardContent className="flex justify-between p-3">

            <span>{u.email}</span>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteUser(u._id)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>

          </CardContent>

        </Card>

      ))}

    </div>
  );
}