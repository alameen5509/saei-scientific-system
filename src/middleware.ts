// حماية المسارات حسب الأدوار — يعتمد على JWT الذي ينشئه NextAuth
// — المستخدم غير المسجَّل يُحوَّل إلى /login مع callbackUrl
// — المستخدم المسجَّل بدون صلاحية يُحوَّل إلى /dashboard
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { isPathAllowedForRole } from "@/lib/rbac";
import type { UserRole } from "@/types";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role as UserRole | undefined;

    // المستخدم مسجَّل لكن دوره لا يملك صلاحية الوصول
    if (!isPathAllowedForRole(pathname, role)) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      url.searchParams.set("denied", pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // إن لم يكن هناك token، ترجع false → NextAuth يحوّل إلى /login تلقائياً
      authorized: ({ token }) => !!token,
    },
  }
);

// نطبّق فقط على الصفحات المحمية — صفحة /login والصفحة الرئيسية والـAPI خارج النطاق
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/researchers/:path*",
    "/tasks/:path*",
    "/reports/:path*",
    "/users/:path*",
    "/profile/:path*",
    "/reviewers/:path*",
    "/reviews/:path*",
  ],
};
