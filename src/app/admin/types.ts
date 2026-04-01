export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
  role: "ADMIN" | "STUDENT";
  isBlocked: boolean;
  lastSeen: Date | string | null;
  createdAt: Date | string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string | null;
  createdAt: Date | string;
  user?: {
    name: string | null;
    email: string;
    image?: string | null;
  };
}

export interface AdminStats {
  totalStudents: number;
  totalAdmins: number;
  online: number;
  blocked: number;
  actionsToday: number;
}
