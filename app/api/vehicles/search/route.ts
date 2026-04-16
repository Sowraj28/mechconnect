import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUBLIC route - no auth needed - used by user search page
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const service = searchParams.get("service");

    const where: any = { isActive: true };

    // Filter by driver city
    if (city && city.trim()) {
      where.driver = {
        city: { contains: city.trim(), mode: "insensitive" },
      };
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            orgName: true,
            orgType: true,
            city: true,
            state: true,
            isVerified: true,
          },
        },
        reviews: {
          include: {
            user: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter by service keyword if provided
    let filtered = vehicles;
    if (service && service.trim()) {
      const q = service.trim().toLowerCase();
      filtered = vehicles.filter(
        (v) =>
          v.vehicleType?.toLowerCase().includes(q) ||
          v.description?.toLowerCase().includes(q) ||
          v.services?.some((s) => s.toLowerCase().includes(q)) ||
          v.driver?.name?.toLowerCase().includes(q) ||
          v.driver?.orgName?.toLowerCase().includes(q),
      );
    }

    const result = filtered.map((v) => ({
      ...v,
      bookingCount: v._count.bookings,
    }));

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Public vehicles search error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
