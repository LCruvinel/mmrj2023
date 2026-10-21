import { validateRequest } from '@/auth';
import prisma from '@/lib/prisma';
import dayjs from 'dayjs';
var customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

export async function PUT(req: Request) {
  const { user } = await validateRequest();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const {
    id,
    id_embarcacao,
    porto_origem,
    porto_destino,
    data_viagem,
    dias_porto_destino,
    dias_porto_origem,
    id_mestre,
    id_capitao,
    id_comandante,
    id_armador,
    entrada_saida,
    dias_viagem,
    data_chegada,
    data_rio,
  } = await req.json();

  const result = await prisma.viagem.update({
    where: {
      id: Number(id),
    },
    data: {
      data_viagem: dayjs(data_viagem, 'DD-MM-YYYY').isValid()
        ? dayjs(data_viagem, 'DD-MM-YYYY').toDate()
        : null,
      dias_porto_destino: Number(dias_porto_destino) || null,
      dias_porto_origem: Number(dias_porto_origem) || null,
      entrada_saida: entrada_saida || null,
      dias_viagem: Number(dias_viagem) || null,
      data_chegada: dayjs(data_chegada, 'DD-MM-YYYY').isValid()
        ? dayjs(data_chegada, 'DD-MM-YYYY').toDate()
        : null,
      data_rio: dayjs(data_rio, 'DD-MM-YYYY').isValid()
        ? dayjs(data_rio, 'DD-MM-YYYY').toDate()
        : null,
      mestre_id: Number(id_mestre) || undefined,
      capitao_id: Number(id_capitao) || undefined,
      comandante_id: Number(id_comandante) || undefined,
      armador_id: Number(id_armador) || undefined,
      id_embarcacao: Number(id_embarcacao) || undefined,
      id_porto_origem: Number(porto_origem) || undefined,
      id_porto_destino: Number(porto_destino) || undefined,
    },
  });
  return Response.json(result);
}
