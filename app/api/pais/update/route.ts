import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
  const { user } = await validateRequest();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id_pais, nome, gentilico } = await req.json();

  const existe = await prisma.pais.findFirst({
    where: {
      id: {
        not: Number(id_pais),
      },
      AND: {
        nome: {
          equals: nome,
          mode: "insensitive",
        },
        gentilico: {
          equals: gentilico,
          mode: "insensitive",
        },
      },
    },
  });

  if (existe) {
    return new Response("País já existe", {
      status: 409,
      statusText: "País já existe",
    });
  }

  const result = await prisma.pais.update({
    where: {
      id: Number(id_pais),
    },
    data: {
      nome: nome,
      gentilico: gentilico,
    },
  });

  return Response.json(result);
}
