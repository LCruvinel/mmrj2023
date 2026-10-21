import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nome = searchParams.get('nome');
  const page = searchParams.get('page');

  const embarcacoes = await prisma.embarcacao.findMany({
    where: {
      nome: {
        startsWith: nome?.toString(),
        mode: 'insensitive',
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
      nome: 'asc',
    },
    take: 10,
    skip: page ? 10 * (+page - 1) : 0,
  });

  const total = await prisma.embarcacao.count({
    where: {
      nome: {
        startsWith: nome?.toString(),
        mode: 'insensitive',
      },
    },
  });

  const result = {
    embarcacoes: embarcacoes.map((embarcacao) => ({ ...embarcacao, observacao: null })),
    total,
  };

  return Response.json(result);
}
