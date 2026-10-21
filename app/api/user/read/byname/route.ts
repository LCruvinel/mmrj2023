import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { user } = await validateRequest();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  const result = await prisma.user.findMany({
    where: {
      OR: [
        {
          username: { startsWith: search?.toString(), mode: "insensitive" },
        },
      ],
    },

    select: {
      id: true,
      username: true,
    },
  });

  return Response.json(
    result.map((user) => ({
      id: user.id,
      email: user.username,
      nome: user.username,
    }))
  );
}
