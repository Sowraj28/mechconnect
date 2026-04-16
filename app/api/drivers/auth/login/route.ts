import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 },
      );
    }
    const driver = await prisma.driver.findUnique({ where: { email } });
    if (!driver) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }
    const isValid = await bcrypt.compare(password, driver.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }
    const driverData = {
      id: driver.id,
      name: driver.name,
      email: driver.email,
      orgName: driver.orgName,
      orgType: driver.orgType,
    };
    const response = NextResponse.json({ success: true, driver: driverData });
    // Set cookie with driver info (base64 encoded)
    const cookieValue = Buffer.from(JSON.stringify(driverData)).toString(
      "base64",
    );
    response.cookies.set("driver-token", cookieValue, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: "lax",
    });
    return response;
  } catch (error) {
    console.error("Driver login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
