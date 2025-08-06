import { NextResponse } from "next/server"

import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { email, oldPassword } = await req.json()

    if (!email || !oldPassword) {
      return NextResponse.json({ message: "Email and old password are required." }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 })
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.password)

    if (!passwordMatch) {
      return NextResponse.json({ message: "Incorrect old password." }, { status: 401 })
    }

    return NextResponse.json({ message: "Old password verified successfully." }, { status: 200 })
  } catch (error) {
    console.error("Error verifying old password:", error)
    return NextResponse.json({ message: "Internal server error." }, { status: 500 })
  }
}
