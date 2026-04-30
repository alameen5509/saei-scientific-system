// GET  /api/users — قائمة كل المستخدمين (ADMIN)
// POST /api/users — إنشاء مستخدم (ADMIN)
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { ALL_ROLES } from "@/lib/rbac";
import type { UserRole } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface UserDto {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: string;
}

export async function GET() {
  const me = await requireRole("ADMIN");
  if (!me) {
    return NextResponse.json(
      { ok: false, error: "غير مصرّح بالوصول" },
      { status: 401 }
    );
  }

  try {
    const rows = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    const users: UserDto[] = rows.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role as UserRole,
      createdAt: u.createdAt.toISOString(),
    }));
    return NextResponse.json({ ok: true, users });
  } catch (err) {
    console.error("GET /api/users", err);
    return NextResponse.json(
      { ok: false, error: "تعذّر تحميل المستخدمين" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const me = await requireRole("ADMIN");
  if (!me) {
    return NextResponse.json(
      { ok: false, error: "غير مصرّح بالإنشاء" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { email, name, password, role } = body as {
      email?: string;
      name?: string;
      password?: string;
      role?: string;
    };

    if (!email || typeof email !== "string" || !email.includes("@"))
      return NextResponse.json(
        { ok: false, error: "البريد الإلكتروني غير صالح" },
        { status: 400 }
      );
    if (!name || typeof name !== "string" || name.trim().length < 2)
      return NextResponse.json(
        { ok: false, error: "الاسم قصير جداً" },
        { status: 400 }
      );
    if (!password || typeof password !== "string" || password.length < 8)
      return NextResponse.json(
        { ok: false, error: "كلمة المرور يجب ألا تقل عن ٨ أحرف" },
        { status: 400 }
      );
    if (!role || !ALL_ROLES.includes(role as UserRole))
      return NextResponse.json(
        { ok: false, error: "الدور غير صالح" },
        { status: 400 }
      );

    const normalizedEmail = email.toLowerCase().trim();
    const exists = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (exists)
      return NextResponse.json(
        { ok: false, error: "البريد مسجّل مسبقاً" },
        { status: 409 }
      );

    const hashed = await bcrypt.hash(password, 10);
    const created = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        password: hashed,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        role: role as any,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // إنشاء ملف Researcher/Reviewer تلقائياً للأدوار المرتبطة
    if (created.role === "RESEARCHER") {
      await prisma.researcher.create({
        data: { userId: created.id, displayName: created.name ?? "" },
      });
    } else if (created.role === "REVIEWER") {
      await prisma.reviewer.create({
        data: { userId: created.id },
      });
    }

    const dto: UserDto = {
      id: created.id,
      email: created.email,
      name: created.name,
      role: created.role as UserRole,
      createdAt: created.createdAt.toISOString(),
    };
    return NextResponse.json({ ok: true, user: dto }, { status: 201 });
  } catch (err) {
    console.error("POST /api/users", err);
    return NextResponse.json(
      { ok: false, error: "تعذّر إنشاء المستخدم" },
      { status: 500 }
    );
  }
}
