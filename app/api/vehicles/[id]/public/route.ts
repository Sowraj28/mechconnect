import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — returns minimal vehicle info for the booking form
// No auth needed because the booking form link is public
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        vehicleNumber: true,
        vehicleType: true,
        capacity: true,
        tankSize: true,
        driverId: true,
        driver: {
          select: {
            name: true,
            orgName: true,
            orgType: true,
          },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(vehicle);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
