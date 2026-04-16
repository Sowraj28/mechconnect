import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const cookieValue = req.cookies.get("driver-token")?.value;
    if (!cookieValue) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const driverData = JSON.parse(
      Buffer.from(cookieValue, "base64").toString("utf-8"),
    );

    const driver = await prisma.driver.findUnique({
      where: { id: driverData.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        orgName: true,
        orgType: true,
        city: true,
        state: true,
        address: true,
        pincode: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
        vehicles: {
          select: {
            id: true,
            vehicleNumber: true,
            vehicleType: true,
            capacity: true,
            isActive: true,
            planType: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    return NextResponse.json(driver);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
