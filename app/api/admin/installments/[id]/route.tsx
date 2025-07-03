import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getSession(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { memberId, month, amount } = await request.json();
    const installmentId = context.params.id;

    if (!memberId || !month || !amount) {
      return NextResponse.json(
        { message: "Member, month, and amount are required" },
        { status: 400 }
      );
    }

    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return NextResponse.json(
        { message: "Invalid month format. Use YYYY-MM format." },
        { status: 400 }
      );
    }

    const existingInstallment = await prisma.installment.findUnique({
      where: { id: installmentId },
    });

    if (!existingInstallment) {
      return NextResponse.json(
        { message: "Installment not found" },
        { status: 404 }
      );
    }

    const duplicateInstallment = await prisma.installment.findFirst({
      where: {
        memberId,
        month,
        id: { not: installmentId },
      },
    });

    if (duplicateInstallment) {
      return NextResponse.json(
        {
          message:
            "Another installment already exists for this member and month",
        },
        { status: 400 }
      );
    }

    const [year, monthNum] = month.split("-");
    const paymentDate = new Date(parseInt(year), parseInt(monthNum) - 1, 15);

    const updatedInstallment = await prisma.installment.update({
      where: { id: installmentId },
      data: {
        memberId,
        month,
        amount: parseFloat(amount),
        paymentDate,
      },
      include: {
        member: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    return NextResponse.json({
      message: "Installment updated successfully",
      installment: updatedInstallment,
    });
  } catch (error) {
    console.error("Update installment error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getSession(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const installmentId = context.params.id;

    const existingInstallment = await prisma.installment.findUnique({
      where: { id: installmentId },
    });

    if (!existingInstallment) {
      return NextResponse.json(
        { message: "Installment not found" },
        { status: 404 }
      );
    }

    await prisma.installment.delete({
      where: { id: installmentId },
    });

    return NextResponse.json({
      message: "Installment deleted successfully",
    });
  } catch (error) {
    console.error("Delete installment error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
