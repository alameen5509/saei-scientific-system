// إعدادات NextAuth v4 — تستخدم في app/api/auth/[...nextauth]/route.ts
// مزود الاعتماد placeholder — سنفعّل قاعدة البيانات لاحقاً
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email" },
        password: { label: "كلمة المرور", type: "password" },
      },
      async authorize(credentials) {
        // TODO: ربط قاعدة البيانات والتحقق الفعلي
        if (!credentials?.email || !credentials?.password) return null;

        // مثال مؤقت لاختبار التدفق فقط
        if (
          credentials.email === "admin@saei.local" &&
          credentials.password === "saei-temp-password"
        ) {
          return {
            id: "1",
            email: "admin@saei.local",
            name: "مدير ساعي",
            role: "ADMIN",
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role = (user as any).role ?? "RESEARCHER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = token.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};
