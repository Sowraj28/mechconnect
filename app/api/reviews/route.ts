import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).userType !== 'user') {
    return NextResponse.json({ error: 'Login required to review' }, { status: 401 });
  }
  
  const body = await req.json();
  const { vehicleId, rating, comment } = body;
  const userId = (session.user as any).id;
  
  const existing = await prisma.review.findFirst({ where: { vehicleId, userId } });
  if (existing) return NextResponse.json({ error: 'Already reviewed' }, { status: 400 });
  
  const review = await prisma.review.create({
    data: { vehicleId, userId, rating, comment },
    include: { user: { select: { name: true, avatar: true } } }
  });
  
  // Notify driver
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (vehicle) {
    await prisma.notification.create({
      data: { driverId: vehicle.driverId, title: 'New Review', message: `You received a ${rating}-star review. "${comment}"`, type: rating >= 4 ? 'success' : 'info' }
    });
  }
  
  return NextResponse.json({ success: true, review });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const vehicleId = searchParams.get('vehicleId');
  const driverId = searchParams.get('driverId');
  
  const where: any = {};
  if (vehicleId) where.vehicleId = vehicleId;
  if (driverId) where.vehicle = { driverId };
  
  const reviews = await prisma.review.findMany({
    where,
    include: { user: { select: { name: true, avatar: true } }, vehicle: { select: { vehicleNumber: true, vehicleType: true } } },
    orderBy: { createdAt: 'desc' },
  });
  
  return NextResponse.json(reviews);
}
