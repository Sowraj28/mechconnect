import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z
  .object({
    vehicleId: z.string(),
    area: z.string().min(1).optional(),
    city: z.string().optional(),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    cost: z.number().min(0).default(0),
    fuelExpense: z.number().min(0).default(0),
    driverSalary: z.number().min(0).default(0),
    otherExpense: z.number().min(0).default(0),
    notes: z.string().optional(),
    completedAt: z.string().optional(),
  })
  .passthrough();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
      select: { id: true, driverId: true, vehicleNumber: true },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    // Use a plain string value — schema.prisma defines status as String, not an enum
    const booking = await prisma.booking.create({
      data: {
        vehicleId: data.vehicleId,
        driverId: vehicle.driverId,
        area: data.area ?? "",
        city: data.city ?? "",
        customerName: data.customerName ?? null,
        customerPhone: data.customerPhone ?? null,
        cost: data.cost,
        fuelExpense: data.fuelExpense,
        driverSalary: data.driverSalary,
        otherExpense: data.otherExpense,
        notes: data.notes ?? null,
        status: "COMPLETED", // plain string — matches @default("COMPLETED") in schema
        completedAt: data.completedAt ? new Date(data.completedAt) : new Date(),
      },
    });

    const netProfit =
      data.cost - data.fuelExpense - data.driverSalary - data.otherExpense;

    try {
      await prisma.notification.create({
        data: {
          driverId: vehicle.driverId,
          title: "New Job Recorded",
          message: `Job completed for ${vehicle.vehicleNumber} — Area: ${
            data.area || "N/A"
          }, Revenue: ₹${data.cost}, Net: ₹${netProfit}`,
          type: "success",
        },
      });
    } catch (_notifError) {
      // Notification failure should not block booking creation
      console.warn("Notification creation failed (non-critical)");
    }

    return NextResponse.json({ success: true, booking });
  } catch (err: any) {
    console.error("Public booking error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create booking" },
      { status: 400 },
    );
  }
}
