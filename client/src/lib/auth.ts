const CUSTOMER_KEY = "st_fashions_customer";
const ADMIN_KEY = "st_fashions_admin";

export interface CustomerSession {
  id: string;
  name: string;
  phone: string;
}

export interface AdminSession {
  username: string;
  isDefaultPassword: boolean;
}

export function getAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  const session = localStorage.getItem(ADMIN_KEY);
  return session ? JSON.parse(session) : null;
}

export function setAdminSession(admin: AdminSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_KEY);
}
