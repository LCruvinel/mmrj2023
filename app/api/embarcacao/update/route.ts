import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
  const { user } = await validateRequest();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id, nome, tipo } = await req.json();
  const existe = await prisma.embarcacao.findFirst({
    where: {
      id: {
        not: Number(id),
      },
      AND: {
        nome: {
          equals: nome,
          mode: "insensitive",
        },
        tipo_embarcacao: {
          id: {
            equals: Number(tipo),
          },
        },
      },
    },
  });

  if (existe) {
    return new Response("Embarcação já existe", {
      status: 409,
      statusText: "Embarcação já existe",
    });
  }

  const result = await prisma.embarcacao.update({
    where: {
      id: Number(id),
    },
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
