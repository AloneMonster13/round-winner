// In-memory store with localStorage persistence

export interface Round {
  id: string;
  round_name: string;
  status: "active" | "closed";
  created_at: string;
}

export interface Competitor {
  id: string;
  name: string;
  round_id: string;
}

export interface Vote {
  id: string;
  user_email: string;
  round_id: string;
  competitor_id: string;
  created_at: string;
}

const STORAGE_KEYS = {
  rounds: "cv_rounds",
  competitors: "cv_competitors",
  votes: "cv_votes",
  session: "cv_session",
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Seed data
const defaultRounds: Round[] = [
  { id: "r1", round_name: "Round 1 — Singing", status: "active", created_at: new Date().toISOString() },
  { id: "r2", round_name: "Round 2 — Dancing", status: "active", created_at: new Date().toISOString() },
];

const defaultCompetitors: Competitor[] = [
  { id: "c1", name: "Alex Fernando", round_id: "r1" },
  { id: "c2", name: "Nimal Perera", round_id: "r1" },
  { id: "c3", name: "Sasha De Silva", round_id: "r1" },
  { id: "c4", name: "Ravi Kumar", round_id: "r2" },
  { id: "c5", name: "Tanya Jayasinghe", round_id: "r2" },
];

// Store
let rounds: Round[] = load(STORAGE_KEYS.rounds, defaultRounds);
let competitors: Competitor[] = load(STORAGE_KEYS.competitors, defaultCompetitors);
let votes: Vote[] = load(STORAGE_KEYS.votes, []);

let listeners: (() => void)[] = [];

function notify() {
  save(STORAGE_KEYS.rounds, rounds);
  save(STORAGE_KEYS.competitors, competitors);
  save(STORAGE_KEYS.votes, votes);
  listeners.forEach((l) => l());
}

export const store = {
  subscribe(fn: () => void) {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  },

  // Session
  getSession(): string | null {
    return localStorage.getItem(STORAGE_KEYS.session);
  },
  setSession(email: string) {
    localStorage.setItem(STORAGE_KEYS.session, email);
  },
  clearSession() {
    localStorage.removeItem(STORAGE_KEYS.session);
  },

  // Rounds
  getRounds() {
    return [...rounds];
  },
  addRound(name: string) {
    const r: Round = { id: "r" + Date.now(), round_name: name, status: "active", created_at: new Date().toISOString() };
    rounds = [...rounds, r];
    notify();
    return r;
  },
  updateRound(id: string, data: Partial<Pick<Round, "round_name" | "status">>) {
    rounds = rounds.map((r) => (r.id === id ? { ...r, ...data } : r));
    notify();
  },
  deleteRound(id: string) {
    rounds = rounds.filter((r) => r.id !== id);
    competitors = competitors.filter((c) => c.round_id !== id);
    votes = votes.filter((v) => v.round_id !== id);
    notify();
  },

  // Competitors
  getCompetitors(roundId?: string) {
    return roundId ? competitors.filter((c) => c.round_id === roundId) : [...competitors];
  },
  addCompetitor(name: string, roundId: string) {
    const c: Competitor = { id: "c" + Date.now(), name, round_id: roundId };
    competitors = [...competitors, c];
    notify();
    return c;
  },
  updateCompetitor(id: string, data: Partial<Pick<Competitor, "name" | "round_id">>) {
    competitors = competitors.map((c) => (c.id === id ? { ...c, ...data } : c));
    notify();
  },
  deleteCompetitor(id: string) {
    competitors = competitors.filter((c) => c.id !== id);
    votes = votes.filter((v) => v.competitor_id !== id);
    notify();
  },

  // Votes
  getVotes(roundId?: string) {
    return roundId ? votes.filter((v) => v.round_id === roundId) : [...votes];
  },
  hasVoted(email: string, roundId: string) {
    return votes.some((v) => v.user_email === email && v.round_id === roundId);
  },
  castVote(email: string, roundId: string, competitorId: string) {
    if (store.hasVoted(email, roundId)) return false;
    const v: Vote = { id: "v" + Date.now(), user_email: email, round_id: roundId, competitor_id: competitorId, created_at: new Date().toISOString() };
    votes = [...votes, v];
    notify();
    return true;
  },
  getVoteCount(competitorId: string) {
    return votes.filter((v) => v.competitor_id === competitorId).length;
  },
};
