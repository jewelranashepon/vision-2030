import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ message: "Email not found." }, { status: 404 })
    }

    return NextResponse.json({ message: "Email found. Proceed to verify old password." }, { status: 200 })
  } catch (error) {
    console.error("Error checking email:", error)
    return NextResponse.json({ message: "Internal server error." }, { status: 500 })
  }
}
