import type { UserRole } from "@/lib/roles";

export interface AdminUser {
  uid: string;
  email: string;
  name: string;
  picture: string;
  role: UserRole;
  created_at: string | null;
  last_login: string | null;
  onboarding_completed: boolean;
  track: string | null;
  path: string | null;
  interests: string[];
  prd_document: string | null;
}

export interface UsersApiResponse {
  users: AdminUser[];
  total: number;
}
