import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Upsert the profile
        const profile = await prisma.financialProfile.upsert({
            where: { userId: user.id },
            update: {
                data: JSON.stringify(data),
            },
            create: {
                userId: user.id,
                data: JSON.stringify(data),
            },
        });

        return NextResponse.json({ success: true, profile });
    } catch (error) {
        console.error("Error saving checklist:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
