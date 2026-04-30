// GET /api/profile — معلومات المستخدم الحالي
// PUT /api/profile — تعديل الاسم/البريد + تغيير كلمة المرور (يتطلب الكلمة الحالية)
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const me = await requireAuth();
  if (!me) {
    return NextResponse.json(
      { ok: false, error: "غير مصرّح" },
      { status: 401 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: me.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "المستخدم غير موجود" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      ok: true,
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("GET /api/profile", err);
    return NextResponse.json(
      { ok: false, error: "خطأ في الخادم" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const me = await requireAuth();
  if (!me) {
    return NextResponse.json(
      { ok: false, error: "غير مصرّح" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { name, email, currentPassword, newPassword } = body as {
      name?: string;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    const dbUser = await prisma.user.findUnique({ where: { id: me.id } });
    if (!dbUser) {
      return NextResponse.json(
        { ok: false, error: "المستخدم غير موجود" },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = {};

    if (typeof name === "string" && name.trim().length >= 2)
      data.name = name.trim();

    if (typeof email === "string" && email.includes("@")) {
      const e = email.toLowerCase().trim();
      if (e !== dbUser.email) {
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

    // تغيير كلمة المرور — يتطلب الكلمة الحالية
    if (newPassword && newPassword.length > 0) {
      if (newPassword.length < 8) {
        return NextResponse.json(
          { ok: false, error: "الكلمة الجديدة يجب ألا تقل عن ٨ أحرف" },
          { status: 400 }
        );
      }
      if (!currentPassword) {
        return NextResponse.json(
          { ok: false, error: "أدخل كلمة المرور الحالية للتأكيد" },
          { status: 400 }
        );
      }
      if (!dbUser.password) {
        return NextResponse.json(
          { ok: false, error: "لا يمكن تغيير الكلمة لهذا الحساب" },
          { status: 400 }
        );
      }
      const valid = await bcrypt.compare(currentPassword, dbUser.password);
      if (!valid) {
        return NextResponse.json(
          { ok: false, error: "كلمة المرور الحالية غير صحيحة" },
          { status: 401 }
        );
      }
      data.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { ok: false, error: "لا توجد تغييرات" },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: me.id },
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
      profile: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("PUT /api/profile", err);
    return NextResponse.json(
      { ok: false, error: "تعذّر تحديث الملف" },
      { status: 500 }
    );
  }
}
