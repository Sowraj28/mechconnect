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
  vehicleNumber: z.string().min(1),
  vehicleType: z.string().min(1),
  capacity: z.string().min(1),
  planType: z.string().default("MONTHLY"),
  services: z.array(z.string()).default([]),
  photos: z.array(z.string()).default([]), // ✅ photos (not images)
  images: z.array(z.string()).default([]), // accept images too for backward compat
  bookingFormQuestions: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        type: z.string(),
        required: z.boolean(),
      }),
    )
    .optional(),
});

export async function GET(req: NextRequest) {
  const driver = getDriverFromCookie(req);
  if (!driver)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vehicles = await prisma.vehicle.findMany({
    where: { driverId: driver.id },
    include: {
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = vehicles.map((v) => ({
    ...v,
    bookingCount: v._count.bookings,
  }));

  return NextResponse.json({ vehicles: result });
}

export async function POST(req: NextRequest) {
  const driver = getDriverFromCookie(req);
  if (!driver)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = schema.parse(body);

    // Accept either photos or images field
    const finalPhotos = data.photos.length > 0 ? data.photos : data.images;

    const vehicle = await prisma.vehicle.create({
      data: {
        vehicleNumber: data.vehicleNumber,
        vehicleType: data.vehicleType,
        capacity: data.capacity,
        planType: data.planType as any,
        services: data.services,
        photos: finalPhotos, // ✅ correct field name
        bookingFormQuestions: data.bookingFormQuestions || [],
        driverId: driver.id,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, vehicle });
  } catch (err: any) {
    console.error("Vehicle create error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const driver = getDriverFromCookie(req);
  if (!driver)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = await req.json();

  const vehicle = await prisma.vehicle.findFirst({
    where: { id, driverId: driver.id },
  });
  if (!vehicle)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updateData: any = {};
  if (body.vehicleNumber !== undefined)
    updateData.vehicleNumber = body.vehicleNumber;
  if (body.vehicleType !== undefined) updateData.vehicleType = body.vehicleType;
  if (body.capacity !== undefined) updateData.capacity = body.capacity;
  if (body.planType !== undefined) updateData.planType = body.planType;
  if (body.services !== undefined) updateData.services = body.services;
  if (body.isActive !== undefined) updateData.isActive = body.isActive;
  if (body.bookingFormQuestions !== undefined)
    updateData.bookingFormQuestions = body.bookingFormQuestions;

  // Accept photos or images
  if (body.photos !== undefined) updateData.photos = body.photos;
  else if (body.images !== undefined) updateData.photos = body.images;

  const updated = await prisma.vehicle.update({
    where: { id },
    data: updateData,
  });
  return NextResponse.json({ success: true, vehicle: updated });
}

export async function DELETE(req: NextRequest) {
  const driver = getDriverFromCookie(req);
  if (!driver)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const vehicle = await prisma.vehicle.findFirst({
    where: { id, driverId: driver.id },
  });
  if (!vehicle)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.vehicle.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
