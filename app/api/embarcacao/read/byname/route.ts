import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nome = searchParams.get("nome");
  const { user } = await validateRequest();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await prisma.embarcacao.findMany({
    where: {
      nome: {
        startsWith: nome?.toString(),
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      nome: true,
      tipo_embarcacao: {
        select: {
          id: true,
          texto_descritivo: true,
          tipo: true,
          imagem_embarcacao: {
            select: {
              imagem: true,
            },
          },
        },
      },
    },
    orderBy: {
      nome: "asc",
    },
  });

  return Response.json(result.map((embarcacao) => ({ ...embarcacao, observacao: null })));
}
