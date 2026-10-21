import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { user } = await validateRequest();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { nome, gentilico } = await req.json();

  const existe = await prisma.pais.findFirst({
    where: {
      nome: {
        equals: nome,
        mode: "insensitive",
      },
    },
  });

  if (existe) {
    return new Response("Unidade já existe", {
      status: 409,
      statusText: "Unidade já existe",
    });
  }

  const result = await prisma.pais.create({
    data: {
      nome: nome,
      gentilico: gentilico,
    },
  });
  return Response.json(result);
}
