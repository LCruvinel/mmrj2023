import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { user } = await validateRequest();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { nome, pais, titulo_nobreza } = await req.json();

  const existe = await prisma.pessoa.findFirst({
    where: {
      nome: {
        equals: nome,
        mode: "insensitive",
      },
      pais: {
        is: {
          id: Number(pais),
        },
      },
      titulo_nobreza: {
        is: {
          id: Number(titulo_nobreza),
        },
      },
    },
  });

  if (existe) {
    return new Response("Pessoa já existe", {
      status: 409,
      statusText: "Pessoa já existe",
    });
  }

  const result = await prisma.pessoa.create({
    data: {
      nome: nome,
      pais: {
        connect: {
          id: Number(pais),
        },
      },
      titulo_nobreza: {
        connect: {
          id: Number(titulo_nobreza),
        },
      },
    },
  });
  return Response.json(result);
}
