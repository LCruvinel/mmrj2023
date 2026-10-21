import { validateRequest } from '@/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export async function GET() {
  const { user } = await validateRequest();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const result = await prisma.viagem.findMany({
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

    take: 10,

    orderBy: {
      id: 'asc',
    },
  });
  return Response.json(result);
}
