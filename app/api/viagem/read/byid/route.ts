import { validateRequest } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const { user } = await validateRequest();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  const viagem = await prisma.viagem.findUnique({
    where: {
      id: Number(id),
    },
    select: {
      id: true,
      data_viagem: true,
      dias_viagem: true,
      entrada_saida: true,
      dias_porto_destino: true,
      dias_porto_origem: true,
      observacoes: true,
      id_embarcacao: true,
      id_porto_origem: true,
      id_porto_destino: true,
      embarcacao: {
        include: {
          tipo_embarcacao: {
            include: {
              imagem_embarcacao: true,
            },
          },
        },
      },
      porto_origem: {
        include: {
          pais: true,
        },
      },
      porto_destino: {
        include: {
          pais: true,
        },
      },
      mestre: true,
      capitao: true,
      comandante: true,
      armador: true,
      consignatario: true,
      escala: {
        select: {
          id: true,
          id_viagem: true,
          id_porto: true,
          porto: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
      },
      passageiro: {
        select: {
          id: true,
          tipo_passageiro: {
            select: {
              tipo: true,
            },
          },
          total: true,
          observacoes: true,
        },
      },
      relac_mercadoria_viagem: {
        include: {
          mercadoria: true,
          unidade_de_medida: true,
        },
      },
      relac_viagem_referencia_doc: {
        select: {
          id: true,
          data_publicacao: true,
          referencia_documental: {
            select: {
              id: true,
              nome_periodico: true,
            },
          },
        },
      },
      noticia: {
        select: {
          id: true,
          assunto: true,
        },
      },
      arriba: {
        select: {
          id: true,
          observacoes: true,
        },
      },
    },
  });

  const rawDates = await prisma.$queryRaw<{ data_chegada: string | null; data_rio: string | null }[]>`
    SELECT
      "data_chegada"::text AS "data_chegada",
      "data_rio"::text AS "data_rio"
    FROM "viagem"
    WHERE "id_viagem" = ${Number(id)}
  `;

  const rawDateValues = rawDates[0] ?? { data_chegada: null, data_rio: null };

  return Response.json({
    ...viagem,
    data_chegada: rawDateValues.data_chegada,
    data_rio: rawDateValues.data_rio,
  });
}
