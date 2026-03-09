import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, ShieldAlert, Vote, Trophy, Star, Music, Mic2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [icons, setIcons] = useState<any[]>([]);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("session", email.trim().toLowerCase());
        localStorage.setItem("role", data.role);

        if (data.role === "admin") navigate("/admin");
        else navigate("/dashboard");
      } else {
        setError(data.message || "Access Denied. Your email is not authorized.");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    }

    setLoading(false);
  };

  // ICON TYPES (ONLY 4)
  const iconTypes = [Star, Mic2, Trophy, Music];

  // CREATE RANDOM ICONS
  useEffect(() => {
    const createIcons = () => {
      const newIcons = Array.from({ length: 12 }).map((_, i) => {
        const Icon = iconTypes[Math.floor(Math.random() * iconTypes.length)];

        return {
          id: i,
          Icon,
          top: Math.random() * 100,
          left: Math.random() * 100,
          size: 20 + Math.random() * 25,
          visible: Math.random() > 0.5,
        };
      });

      setIcons(newIcons);
    };

    createIcons();

    const interval = setInterval(createIcons, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black overflow-hidden px-4">

      {/* RED GLOW BACKGROUND */}
      <div className="absolute w-[600px] h-[600px] bg-red-600/30 blur-[200px] -top-40 -left-40 animate-pulse"></div>
      <div className="absolute w-[500px] h-[500px] bg-red-500/20 blur-[180px] bottom-0 right-0 animate-pulse"></div>

      {/* RANDOM BLINKING ICONS */}
      {icons.map(({ id, Icon, top, left, size, visible }) => (
        <Icon
          key={id}
          className={`absolute text-white/20 transition-opacity duration-700 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
          style={{
            top: `${top}%`,
            left: `${left}%`,
            width: size,
            height: size,
          }}
        />
      ))}

      {/* LOGIN CARD */}
      <Card className="w-full max-w-md border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl shadow-red-900/30 rounded-2xl">
        <CardContent className="p-8">

          {/* LOGO */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 shadow-lg shadow-red-600/40">
              <Vote className="h-8 w-8 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-white tracking-wide">
              Competition Vote
            </h1>

            <p className="text-white/60 text-sm mt-2">
              Sign in to cast your vote
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-5">

            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-white/50" />
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className="pl-10 bg-black/40 border-white/10 text-white placeholder:text-white/40 focus:border-red-500 focus:ring-red-500"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-300">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg shadow-red-600/30 transition-all duration-300"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Continue"}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}