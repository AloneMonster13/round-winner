export type UserRole = "admin" | "user";

export function getUserRole(): UserRole | null {
  const role = localStorage.getItem("role");

  if (role === "admin") return "admin";
  if (role === "user") return "user";

  return null;
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem("session");
}

export function logout() {
  localStorage.removeItem("session");
  localStorage.removeItem("role");
}