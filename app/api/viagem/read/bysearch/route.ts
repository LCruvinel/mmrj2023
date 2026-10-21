import prisma from '@/lib/prisma';
import dayjs from 'dayjs';

var customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const ano = searchParams.get('ano');
  const tipo = searchParams.get('tipo');
  const page = searchParams.get('page');

  const viagens = await prisma.viagem.findMany({
    where: {
      AND: [
        {
          embarcacao: {
            nome: { startsWith: search?.toString(), mode: 'insensitive' },
          },
        },
        ...(ano && ano !== 'none'
          ? [
              {
                data_rio: {
                  gte: new Date(`${ano}-01-01`),
                  lte: new Date(`${ano}-12-31`),
                },
              },
            ]
          : []),

        ...(tipo && tipo !== 'none'
          ? [
              {
                entrada_saida: tipo?.toString(),
              },
            ]
          : []),
      ],
    },

    take: 10,
    skip: page ? 10 * (+page - 1) : 0,
    select: {
      id: true,
      data_rio: true,
      entrada_saida: true,

      embarcacao: {
        select: {
          nome: true,
        },
      },
    },

    orderBy: {
      id: 'asc',
    },
  });

  const total = await prisma.viagem.count({
    where: {
      AND: [
        {
          embarcacao: {
            nome: { startsWith: search?.toString(), mode: 'insensitive' },
          },
        },
        ...(ano && ano !== 'none'
          ? [
              {
                data_rio: {
                  gte: new Date(`${ano}-01-01`),
                  lte: new Date(`${ano}-12-31`),
                },
              },
            ]
          : []),

        ...(tipo && tipo !== 'none'
          ? [
              {
                entrada_saida: tipo?.toString(),
              },
            ]
          : []),
      ],
    },
  });

  const result = {
    viagens,
    total,
  };

  return Response.json(result);
}
