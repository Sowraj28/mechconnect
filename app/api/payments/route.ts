import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MONTHLY_PRICE = 99;
const ANNUAL_PRICE = 999;

// ─── Auth Helper ──────────────────────────────────────────────────────────────
// Calls your existing /api/drivers/me with the same cookies from the request.
// This reuses your custom driver auth — no next-auth needed.
async function getAuthenticatedDriver(
  req: NextRequest,
): Promise<{ id: string; name: string } | null> {
  try {
    const res = await fetch(new URL("/api/drivers/me", req.url).toString(), {
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.error || !data.id) return null;
    return data;
  } catch {
    return null;
  }
}

// ─── POST /api/payments ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const driver = await getAuthenticatedDriver(req);
  if (!driver) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const driverId = driver.id;

  try {
    const { planType, vehicleIds } = await req.json();

    if (!planType || !vehicleIds?.length) {
      return NextResponse.json(
        { error: "planType and vehicleIds are required" },
        { status: 400 },
      );
    }

    // Only vehicles belonging to this driver
    const vehicles = await prisma.vehicle.findMany({
      where: { driverId, id: { in: vehicleIds } },
    });

    if (vehicles.length === 0) {
      return NextResponse.json(
        { error: "No valid vehicles found for this driver" },
        { status: 400 },
      );
    }

    const vehicleCount = vehicles.length;
    const pricePerVehicle =
      planType === "ANNUAL" ? ANNUAL_PRICE : MONTHLY_PRICE;
    const amount = vehicleCount * pricePerVehicle;

    const periodStart = new Date();
    const periodEnd = new Date();
    if (planType === "ANNUAL") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Create payment record (demo bypass)
    const payment = await prisma.payment.create({
      data: {
        driverId,
        amount,
        vehicleCount,
        planType,
        status: "BYPASSED",
        periodStart,
        periodEnd,
        transactionId: `DEMO-${Date.now()}`,
      },
    });

    // Update all selected vehicles with plan dates
    await Promise.all(
      vehicles.map((v) =>
        prisma.vehicle.update({
          where: { id: v.id },
          data: {
            planType,
            planStartDate: periodStart,
            planEndDate: periodEnd,
            isActive: true,
          },
        }),
      ),
    );

    // Notify driver
    await prisma.notification.create({
      data: {
        driverId,
        title: "Payment Confirmed ✅",
        message: `₹${amount} payment confirmed for ${vehicleCount} vehicle(s). ${planType} plan active until ${periodEnd.toLocaleDateString("en-IN")}.`,
        type: "success",
      },
    });

    return NextResponse.json({ success: true, payment, amount });
  } catch (err: any) {
    console.error("[payments POST]", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// ─── GET /api/payments ────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const driver = await getAuthenticatedDriver(req);
  if (!driver) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const driverId = driver.id;

  try {
    const [payments, vehicles] = await Promise.all([
      prisma.payment.findMany({
        where: { driverId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.vehicle.findMany({
        where: { driverId },
      }),
    ]);

    const activeVehicles = vehicles.filter((v) => v.isActive);

    return NextResponse.json({
      payments,
      vehicles,
      vehicleCount: activeVehicles.length,
      monthlyTotal: activeVehicles.length * MONTHLY_PRICE,
      annualTotal: activeVehicles.length * ANNUAL_PRICE,
    });
  } catch (err: any) {
    console.error("[payments GET]", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
