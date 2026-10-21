import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { nome, tipo } = await req.json();
  const { user } = await validateRequest();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const existe = await prisma.embarcacao.findFirst({
    where: {
      nome: {
        equals: nome,
        mode: "insensitive",
      },
    },
  });

  if (existe) {
    return new Response("Embarcação já existe", {
      status: 409,
      statusText: "Embarcação já existe",
    });
  }

  const result = await prisma.embarcacao.create({
    data: {
      nome: nome,
      tipo_embarcacao: {
        connect: {
          id: Number(tipo),
        },
      },
    },
  });
  return Response.json(result);
}
