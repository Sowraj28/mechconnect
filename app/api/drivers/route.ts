import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
  orgName: z.string().optional(),
  orgType: z.enum(['INDIVIDUAL', 'ORGANIZATION']).default('INDIVIDUAL'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    
    const existing = await prisma.driver.findUnique({ where: { email: data.email } });
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    
    const hashed = await bcrypt.hash(data.password, 12);
    const driver = await prisma.driver.create({
      data: { ...data, password: hashed },
      select: { id: true, name: true, email: true, phone: true, orgType: true },
    });
    
    return NextResponse.json({ success: true, driver });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  
  const driver = await prisma.driver.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, phone: true, orgName: true, orgType: true, city: true, state: true, avatar: true, isVerified: true, vehicles: { select: { id: true, vehicleNumber: true, vehicleType: true, capacity: true, photos: true, serviceAreas: true, isActive: true } } }
  });
  
  if (!driver) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(driver);
}
