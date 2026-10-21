import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { user } = await validateRequest();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await prisma.pais.findMany({
    select: {
      id: true,
      nome: true,
      gentilico: true,
    },
    orderBy: {
      nome: "asc",
    },
  });

  return NextResponse.json(result);
}
