const ADMIN_EMAIL = "admin@cey.lk";
const ALLOWED_USERS = ["me@test.lk", "we@won.lk", "nisal@test.lk", "frog@vb.lk"];

export type UserRole = "admin" | "user";

export function authenticateEmail(email: string): { success: boolean; role?: UserRole } {
  const e = email.trim().toLowerCase();
  if (e === ADMIN_EMAIL) return { success: true, role: "admin" };
  if (ALLOWED_USERS.includes(e)) return { success: true, role: "user" };
  return { success: false };
}

export function getUserRole(email: string): UserRole | null {
  const e = email.trim().toLowerCase();
  if (e === ADMIN_EMAIL) return "admin";
  if (ALLOWED_USERS.includes(e)) return "user";
  return null;
}
