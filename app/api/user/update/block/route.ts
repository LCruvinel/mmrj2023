import { invalidateUserSessions, validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
  const { id, habilitado } = await req.json();
  const { user } = await validateRequest();

  if (!user || user.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }
  await invalidateUserSessions(id);

  const result = await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      active: habilitado,
    },
  });
  return Response.json(result);
}
