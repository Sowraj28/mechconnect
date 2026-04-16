import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── Auth helper: supports both driver cookie and next-auth session ───────────
function getDriverFromCookie(req: NextRequest) {
  try {
    const cookieValue = req.cookies.get("driver-token")?.value;
    if (!cookieValue) return null;
    return JSON.parse(Buffer.from(cookieValue, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

// ─── GET /api/notifications ───────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  // Try driver cookie auth first
  const driver = getDriverFromCookie(req);
  if (driver) {
    const notifications = await prisma.notification.findMany({
      where: { driverId: driver.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        isRead: true,
        createdAt: true, // ← always included so frontend timestamp logic works
      },
    });
    return NextResponse.json(notifications);
  }

  // Fall back to next-auth session (for admin or other user types)
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = (session.user as any).id;
  const notifications = await prisma.notification.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      message: true,
      type: true,
      isRead: true,
      createdAt: true,
    },
  });
  return NextResponse.json(notifications);
}

// ─── PATCH /api/notifications ─────────────────────────────────────────────────
// Supports:
//   { id: "..." }           → mark single notification as read
//   { markAllRead: true }   → mark ALL notifications as read for this driver
export async function PATCH(req: NextRequest) {
  const driver = getDriverFromCookie(req);
  const session = await getServerSession(authOptions);

  if (!driver && !session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    if (body.markAllRead) {
      // Mark every notification as read for this driver/user
      if (driver) {
        await prisma.notification.updateMany({
          where: { driverId: driver.id },
          data: { isRead: true },
        });
      } else {
        const id = (session!.user as any).id;
        await prisma.notification.updateMany({
          where: { userId: id },
          data: { isRead: true },
        });
      }
      return NextResponse.json({ success: true, action: "markAllRead" });
    }

    // Mark a single notification as read
    if (body.id) {
      await prisma.notification.update({
        where: { id: body.id },
        data: { isRead: true },
      });
      return NextResponse.json({
        success: true,
        action: "markRead",
        id: body.id,
      });
    }

    return NextResponse.json({ error: "No action specified" }, { status: 400 });
  } catch (err: any) {
    console.error("[notifications PATCH]", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
