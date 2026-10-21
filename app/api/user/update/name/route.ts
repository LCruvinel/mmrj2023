import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
  const { nome } = await req.json();
  const { user } = await validateRequest();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      username: nome,
    },
  });
  return Response.json(result);
}
