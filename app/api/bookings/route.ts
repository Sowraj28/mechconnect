import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

function getDriverFromCookie(req: NextRequest) {
  try {
    const cookieValue = req.cookies.get("driver-token")?.value;
    if (!cookieValue) return null;
    return JSON.parse(Buffer.from(cookieValue, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

const schema = z.object({
  vehicleId: z.string(),
  area: z.string().min(2),
  cost: z.number().min(0),
  fuelExpense: z.number().min(0).default(0),
  driverSalary: z.number().min(0).default(0),
  otherExpense: z.number().min(0).default(0),
  notes: z.string().optional(),
  completedAt: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const driver = getDriverFromCookie(req);
  if (!driver)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = schema.parse(body);

    // verify vehicle belongs to driver
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: data.vehicleId, driverId: driver.id },
    });
    if (!vehicle)
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });

    const booking = await prisma.booking.create({
      data: {
        vehicleId: data.vehicleId,
        driverId: driver.id,
        area: data.area,
        cost: data.cost,
        fuelExpense: data.fuelExpense,
        driverSalary: data.driverSalary,
        otherExpense: data.otherExpense,
        notes: data.notes,
        status: "COMPLETED",
        completedAt: data.completedAt ? new Date(data.completedAt) : new Date(),
      },
    });

    // fire notification
    await prisma.notification.create({
      data: {
        driverId: driver.id,
        title: "Job Completed",
        message: `Booking recorded for vehicle ${vehicle.vehicleNumber} — Area: ${data.area}, Revenue: ₹${data.cost}`,
        type: "success",
      },
    });

    return NextResponse.json({ success: true, booking });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const driver = getDriverFromCookie(req);
  if (!driver)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const vehicleId = searchParams.get("vehicleId");

  const where: any = { driverId: driver.id };
  if (vehicleId) where.vehicleId = vehicleId;

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      vehicle: { select: { vehicleNumber: true, vehicleType: true } },
    },
    orderBy: { completedAt: "desc" },
  });

  return NextResponse.json(bookings);
}
