import { invalidateUserSessions, validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function PUT(req: Request) {
  const { password } = await req.json();
  const { user } = await validateRequest();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }
  await invalidateUserSessions(user.id);

  const passwordHash = await hash(password, 10);

  const result = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password_hash: passwordHash,
    },
  });
  return Response.json(result);
}
