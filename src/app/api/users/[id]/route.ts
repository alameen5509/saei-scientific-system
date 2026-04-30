// PUT    /api/users/[id] — تعديل مستخدم (ADMIN)
// DELETE /api/users/[id] — حذف مستخدم (ADMIN، لا يحذف نفسه)
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { ALL_ROLES } from "@/lib/rbac";
import type { UserRole } from "@/types";

export const runtime = "nodejs";

interface Params {
  params: { id: string };
}

export async function PUT(req: Request, { params }: Params) {
  const me = await requireRole("ADMIN");
  if (!me) {
    return NextResponse.json(
      { ok: false, error: "غير مصرّح" },
      { status: 401 }
    );
  }

  try {
    const target = await prisma.user.findUnique({ where: { id: params.id } });
    if (!target) {
      return NextResponse.json(
        { ok: false, error: "المستخدم غير موجود" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { name, email, role, password } = body as {
      name?: string;
      email?: string;
      role?: string;
      password?: string;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = {};

    if (typeof name === "string" && name.trim().length >= 2)
      data.name = name.trim();

    if (typeof email === "string" && email.includes("@")) {
      const e = email.toLowerCase().trim();
      if (e !== target.email) {
        const dup = await prisma.user.findUnique({ where: { email: e } });
        if (dup) {
          return NextResponse.json(
            { ok: false, error: "البريد مستخدم مسبقاً" },
            { status: 409 }
          );
        }
        data.email = e;
      }
    }

    if (role && typeof role === "string") {
      if (!ALL_ROLES.includes(role as UserRole)) {
        return NextResponse.json(
          { ok: false, error: "الدور غير صالح" },
          { status: 400 }
        );
      }
      // منع المدير من تخفيض دوره الخاص
      if (target.id === me.id && role !== "ADMIN") {
        return NextResponse.json(
          { ok: false, error: "لا يمكن للمدير تخفيض دوره الخاص" },
          { status: 400 }
        );
      }
      data.role = role;
    }

    if (typeof password === "string" && password.length > 0) {
      if (password.length < 8) {
        return NextResponse.json(
          { ok: false, error: "كلمة المرور يجب ألا تقل عن ٨ أحرف" },
          { status: 400 }
        );
      }
      data.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { ok: false, error: "لا توجد تغييرات" },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role as UserRole,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("PUT /api/users/[id]", err);
    return NextResponse.json(
      { ok: false, error: "تعذّر تحديث المستخدم" },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const me = await requireRole("ADMIN");
  if (!me) {
    return NextResponse.json(
      { ok: false, error: "غير مصرّح" },
      { status: 401 }
    );
  }

  if (params.id === me.id) {
    return NextResponse.json(
      { ok: false, error: "لا يمكن حذف حسابك الشخصي" },
      { status: 400 }
    );
  }

  try {
    // التحقق من ربط الباحث بأعمال (Restrict على ScientificWork)
    const researcher = await prisma.researcher.findUnique({
      where: { userId: params.id },
      include: { _count: { select: { works: true } } },
    });
    if (researcher && researcher._count.works > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: `لا يمكن الحذف — هذا الباحث مرتبط بـ${researcher._count.works} عمل علمي. أعِد إسناد الأعمال أولاً.`,
        },
        { status: 409 }
      );
    }

    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const code = (err as any)?.code;
    if (code === "P2025") {
      return NextResponse.json(
        { ok: false, error: "المستخدم غير موجود" },
        { status: 404 }
      );
    }
    console.error("DELETE /api/users/[id]", err);
    return NextResponse.json(
      { ok: false, error: "تعذّر حذف المستخدم" },
      { status: 500 }
    );
  }
}
