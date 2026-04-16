import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getDriverFromCookie(req: NextRequest) {
  try {
    const cookieValue = req.cookies.get("driver-token")?.value;
    if (!cookieValue) return null;
    return JSON.parse(Buffer.from(cookieValue, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

// Explicit type so TS doesn't rely on Prisma inference
type RawBooking = {
  id: string;
  vehicleId: string;
  driverId: string;
  area: string | null;
  city: string | null;
  customerName: string | null;
  customerPhone: string | null;
  cost: number | null;
  fuelExpense: number | null;
  driverSalary: number | null;
  otherExpense: number | null;
  notes: string | null;
  status: string;
  completedAt: Date | null;
  createdAt: Date;
};

export async function GET(req: NextRequest) {
  const driver = getDriverFromCookie(req);
  if (!driver)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const vehicleId = searchParams.get("vehicleId");

  const vehicles = await prisma.vehicle.findMany({
    where: { driverId: driver.id as string },
    select: {
      id: true,
      vehicleNumber: true,
      vehicleType: true,
      capacity: true,
      planType: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const allVehicleIds: string[] = vehicles.map((v) => v.id);
  const filteredVehicleIds: string[] = vehicleId ? [vehicleId] : allVehicleIds;

  // Cast result to RawBooking[] to avoid Prisma Decimal/inference issues
  const bookings = (await prisma.$queryRaw`
    SELECT
      id, "vehicleId", "driverId",
      area, city,
      "customerName", "customerPhone",
      cost::float,
      "fuelExpense"::float,
      "driverSalary"::float,
      "otherExpense"::float,
      notes, status,
      "completedAt", "createdAt"
    FROM "Booking"
    WHERE "vehicleId" = ANY(${filteredVehicleIds}::text[])
    ORDER BY "completedAt" DESC
  `) as RawBooking[];

  const vehicleData = vehicles
    .filter((v) => !vehicleId || v.id === vehicleId)
    .map((v) => {
      const vBookings = bookings.filter((b) => b.vehicleId === v.id);

      const totalRevenue = vBookings.reduce((s, b) => s + (b.cost ?? 0), 0);
      const totalFuel = vBookings.reduce((s, b) => s + (b.fuelExpense ?? 0), 0);
      const totalSalary = vBookings.reduce(
        (s, b) => s + (b.driverSalary ?? 0),
        0,
      );
      const totalOther = vBookings.reduce(
        (s, b) => s + (b.otherExpense ?? 0),
        0,
      );
      const totalExpense = totalFuel + totalSalary + totalOther;
      const netProfit = totalRevenue - totalExpense;

      return {
        vehicleId: v.id,
        vehicleNumber: v.vehicleNumber,
        vehicleType: v.vehicleType,
        capacity: v.capacity,
        planType: v.planType,
        isActive: v.isActive,
        totalBookings: vBookings.length,
        totalRevenue,
        totalFuel,
        totalSalary,
        totalOther,
        totalExpense,
        netProfit,
        bookings: vBookings.map((b) => ({
          id: b.id,
          area: b.area ?? "—",
          city: b.city ?? "",
          customerName: b.customerName ?? "",
          customerPhone: b.customerPhone ?? "",
          cost: b.cost ?? 0,
          fuelExpense: b.fuelExpense ?? 0,
          driverSalary: b.driverSalary ?? 0,
          otherExpense: b.otherExpense ?? 0,
          notes: b.notes ?? null,
          status: b.status,
          completedAt: b.completedAt,
          createdAt: b.createdAt,
        })),
      };
    });

  const totals = {
    totalBookings: vehicleData.reduce((s, v) => s + v.totalBookings, 0),
    totalRevenue: vehicleData.reduce((s, v) => s + v.totalRevenue, 0),
    totalExpense: vehicleData.reduce((s, v) => s + v.totalExpense, 0),
    totalFuel: vehicleData.reduce((s, v) => s + v.totalFuel, 0),
    totalSalary: vehicleData.reduce((s, v) => s + v.totalSalary, 0),
    totalOther: vehicleData.reduce((s, v) => s + v.totalOther, 0),
    netProfit: vehicleData.reduce((s, v) => s + v.netProfit, 0),
  };

  return NextResponse.json({ vehicles: vehicleData, totals });
}
