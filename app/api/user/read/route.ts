import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user } = await validateRequest();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      active: true,
      role: true,
    },
    orderBy: {
      username: "asc",
    },
  });
  return Response.json(
    result.map((user) => ({
      ...user,
      email: user.username,
      nome: user.username,
      habilitado: user.active,
      role: user.role.toUpperCase(),
    }))
  );
}
