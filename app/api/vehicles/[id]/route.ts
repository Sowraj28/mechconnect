import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: params.id },
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
          avatar: true,
          isVerified: true,
        },
      },
      reviews: {
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { bookings: true, reviews: true } },
    },
  });

  if (!vehicle)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(vehicle);
}
