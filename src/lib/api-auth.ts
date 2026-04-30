// helpers لحماية API routes — تتحقق من JWT الجلسة الحالية والدور
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { UserRole } from "@/types";

export interface SessionUser {
  id: string;
  email: string | null;
  name: string | null;
  role: UserRole;
}

/** يُرجع المستخدم الحالي إن كان مسجَّلاً، وإلا null */
export async function requireAuth(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? null,
    name: session.user.name ?? null,
    role: session.user.role,
  };
}

/** يُرجع المستخدم إن كان مسجَّلاً وله أحد الأدوار المسموحة، وإلا null */
export async function requireRole(
  ...roles: UserRole[]
): Promise<SessionUser | null> {
  const user = await requireAuth();
  if (!user) return null;
  if (!roles.includes(user.role)) return null;
  return user;
}
