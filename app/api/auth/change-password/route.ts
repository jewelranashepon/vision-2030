import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { email, newPassword } = await req.json()

    if (!email || !newPassword) {
      return NextResponse.json({ message: "Email and new password are required." }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters long." }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ message: "Password changed successfully." }, { status: 200 })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json({ message: "Internal server error." }, { status: 500 })
  }
}
