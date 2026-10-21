import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import TablePassageiros from '../_components/tables/tablepassageiros';
import TableEscalas from '../_components/tables/tableescalas';
import TableRefDocumental from '../_components/tables/tablerefdoc';
import TableMercadorias from '../_components/tables/tablemercadorias';
import TableNews from '../_components/tables/tablenews';
import prisma from '@/lib/prisma';

function formatStoredDateText(value: unknown) {
  if (value === null || value === undefined) return 'N/A';

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return 'N/A';

    if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
      return trimmed.slice(0, 10);
    }

    return trimmed;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? 'N/A' : value.toISOString().slice(0, 10);
  }

  return String(value);
}

function renderDbDate(value: unknown) {
  return formatStoredDateText(value);
}

async function getData(id: string) {
  const res = await prisma.viagem.findUnique({
    where: {
      id: parseInt(id),
    },
    select: {
      id: true,
      entrada_saida: true,
      dias_viagem: true,
      embarcacao: {
        select: {
          nome: true,
          tipo_embarcacao: {
            select: {
              tipo: true,
              texto_descritivo: true,
              imagem_embarcacao: true,
            },
          },
        },
      },
      porto_destino: {
        select: {
          nome: true,
          pais: {
            select: {
              nome: true,
            },
          },
        },
      },
      porto_origem: {
        select: {
          nome: true,
          pais: {
            select: {
              nome: true,
            },
          },
        },
      },
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
      relac_mercadoria_viagem: {
        select: {
          id: true,
          id_mercadoria: true,
          mercadoria: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
      },
    },
  });

  if (!res) {
    return null;
  }

  const rawDates = await prisma.$queryRaw<{ data_chegada: string | null; data_rio: string | null }[]>`
    SELECT
      "data_chegada"::text AS "data_chegada",
      "data_rio"::text AS "data_rio"
    FROM "viagem"
    WHERE "id_viagem" = ${parseInt(id)}
  `;

  const rawDateValues = rawDates[0] ?? { data_chegada: null, data_rio: null };

  const passageirosRaw = await prisma.$queryRaw<
    Array<{ id_relac_pessoa_viagem: number; nome: string | null }>
  >`
    SELECT
      rpv."id_relac_pessoa_viagem" AS "id_relac_pessoa_viagem",
      p."nome" AS "nome"
    FROM "relac_pessoa_viagem" rpv
    JOIN "pessoa" p ON p."id_pessoa" = rpv."id_pessoa"
    WHERE rpv."id_viagem" = ${parseInt(id)}
      AND lower(rpv."funcao") = 'passageiro'
  `;

  const tripulacaoRaw = await prisma.$queryRaw<
    Array<{ funcao: string | null; nome: string | null }>
  >`
    SELECT
      rpv."funcao" AS "funcao",
      p."nome" AS "nome"
    FROM "relac_pessoa_viagem" rpv
    JOIN "pessoa" p ON p."id_pessoa" = rpv."id_pessoa"
    WHERE rpv."id_viagem" = ${parseInt(id)}
  `;

  const normalizeFuncao = (value: string | null | undefined) => {
    if (!value) return '';

    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z\s]/g, '')
      .trim()
      .toLowerCase();
  };

  const tripulacaoPorCargo = Object.fromEntries(
    tripulacaoRaw
      .filter((item) => item.funcao && item.nome)
      .map((item) => {
        const funcao = normalizeFuncao(item.funcao);
        const chave =
          funcao === 'comandante'
            ? 'comandante'
            : funcao === 'capitao'
              ? 'capitao'
              : funcao === 'armador'
                ? 'armador'
                : funcao === 'mestre'
                  ? 'mestre'
                  : funcao === 'consignatario' || funcao === 'cosignatario'
                    ? 'consignatario'
                    : funcao;

        return [chave, String(item.nome).trim()];
      })
  );

  return {
    ...res,
    data_rio: rawDateValues.data_rio,
    data_chegada: rawDateValues.data_chegada,
    data_viagem: null,
    dias_porto_origem: null,
    dias_porto_destino: null,
    armador: null,
    capitao: null,
    comandante: null,
    mestre: null,
    consignatario: null,
    passageiro: passageirosRaw.map((item) => ({
      id: Number(item.id_relac_pessoa_viagem),
      nome: item.nome ?? 'N/A',
      tipo_passageiro: null,
      total: null,
      observacoes: null,
    })),
    arriba: [],
    noticia: [],
    relac_viagem_referencia_doc: [],
    tripulacao: tripulacaoPorCargo,
  };
}

export default async function TripPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;
  const viagem = (await getData(id)) as unknown as Viagem;
  const tripulacao = ((viagem as any)?.tripulacao ?? {}) as Record<string, string>;
  const tripulacaoNome = (chave: string) => tripulacao[chave] || 'N/A';
  const destinoValor =
    viagem?.entrada_saida?.trim().toLowerCase() === 'arribada'
      ? 'Arribada (reparos)'
      : viagem?.porto_destino?.nome && viagem?.porto_destino?.pais?.nome
        ? `${viagem.porto_destino.nome} | ${viagem.porto_destino.pais.nome}`
        : 'N/A';

  return (
    <div className='p-1 md:p-4 mt-10 lg:mx-24 bg-white rounded-xl flex flex-col gap-2 shadow-2xl dark:bg-slate-700'>
      <div className='flex flex-col gap-2'>
        <div className='flex flex-wrap gap-2'>
          <div className='flex flex-col border gap-1 rounded-xl grow'>
            <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
              Data Rio
            </div>
            <div className='p-2 text-xs'>
              {formatStoredDateText(viagem?.data_rio)}
            </div>
          </div>

          <div className='flex flex-col border gap-1 rounded-xl grow'>
            <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
              Porto de Origem
            </div>
            <div className='p-2 text-xs'>
              {viagem?.porto_origem?.nome
                ? viagem?.porto_origem?.nome +
                  ' | ' +
                  viagem?.porto_origem?.pais?.nome
                : 'N/A'}
            </div>
          </div>
          <div className='flex flex-col border gap-1 rounded-xl grow'>
            <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
              Dias no porto de origem
            </div>
            <div className='p-2 text-xs'>
              {viagem?.dias_porto_origem || 'N/A'}
            </div>
          </div>
        </div>

        <div className='flex flex-wrap gap-2'>
          <div className='flex flex-col border gap-1 rounded-xl grow'>
            <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
              Data de Chegada
            </div>
            <div className='p-2 text-xs'>
              {renderDbDate(viagem?.data_chegada)}
            </div>
          </div>

          <div className='flex flex-col border gap-1 rounded-xl grow'>
            <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
              Porto de Destino
            </div>
            <div className='p-2 text-xs'>{destinoValor}</div>
          </div>
          <div className='flex flex-col border gap-1 rounded-xl grow'>
            <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
              Dias no porto de destino
            </div>
            <div className='p-2 text-xs'>
              {viagem?.dias_porto_destino || 'N/A'}
            </div>
          </div>
        </div>

        <div className='flex flex-wrap gap-2'>
          <div className='flex flex-col border gap-1 rounded-xl grow'>
            <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
              Dias de Viagem
            </div>
            <div className='p-2 text-xs'>
              {viagem?.dias_viagem && viagem.dias_viagem !== 0
                ? viagem.dias_viagem
                : 'N/A'}
            </div>
          </div>
          {/* <div className='flex flex-col border gap-1 rounded-xl grow'>
                <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                  Tripulação
                </div>
                <div className='p-2 text-xs'>{viagem?.tripulacao}</div>
              </div> */}
          {/* <div className="flex flex-col border gap-1 rounded-xl grow">
                  <div className="p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl">
                    Passageiros
                  </div>
                  <div className="p-2 text-xs">{viagem?.total_passageiros}</div>
                </div> */}
        </div>
      </div>

      <div className='flex flex-col flex-1 w-full max-w-xs  md:max-w-full gap-2'>
        <Accordion
          type='single'
          collapsible
          className='flex flex-col flex-1 w-full'
        >
          <AccordionItem value='vessel' className='w-full'>
            <AccordionTrigger>Embarcação</AccordionTrigger>
            <AccordionContent>
              <div className='flex flex-row flex-1 gap-2'>
                <div className='flex flex-col border gap-1 rounded-xl grow'>
                  <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                    Nome
                  </div>
                  <div className='p-2 text-xs'>{viagem?.embarcacao?.nome}</div>
                </div>
                <div className='flex flex-col border gap-1 rounded-xl grow'>
                  <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                    Tipo
                  </div>
                  <div className='p-2 text-xs'>
                    {viagem?.embarcacao?.tipo_embarcacao?.tipo}
                  </div>
                </div>
              </div>
              <div className='flex flex-col mt-2 border gap-1 rounded-xl grow'>
                <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                  Descrição
                </div>
                <div className='p-2 text-xs'>
                  {viagem?.embarcacao?.tipo_embarcacao?.texto_descritivo}
                </div>
              </div>
              {viagem?.embarcacao?.tipo_embarcacao?.imagem_embarcacao &&
                viagem?.embarcacao?.tipo_embarcacao?.imagem_embarcacao.length >
                  0 && (
                  <div className='flex flex-col p-2 gap-2'>
                    <div className='flex flex-wrap gap-2'>
                      {viagem?.embarcacao?.tipo_embarcacao?.imagem_embarcacao?.map(
                        (img) => (
                          // { X Button in upper right corner of the image}
                          <img
                            key={img.id}
                            src={img.imagem}
                            alt={viagem?.embarcacao?.tipo_embarcacao?.tipo}
                            className='w-full border rounded-lg  max-h-64 md:max-w-96 md:w-auto'
                          />
                        )
                      )}
                    </div>
                  </div>
                )}
              <div className='flex flex-col w-full mt-2 border gap-1 rounded-xl'>
                <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                  Observação
                </div>
                <div className='p-2 text-xs'>
                  {viagem?.embarcacao?.observacao}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value='crew' className='w-full'>
            <AccordionTrigger>Tripulação</AccordionTrigger>
            <AccordionContent>
              <div className='flex flex-wrap flex-1 gap-2'>
                <div className='flex flex-col border gap-1 rounded-xl grow'>
                  <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                    Comandante
                  </div>
                  <div className='p-2 text-xs'>
                    {tripulacaoNome('comandante')}
                  </div>
                </div>
                <div className='flex flex-col border gap-1 rounded-xl grow'>
                  <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                    Capitão
                  </div>
                  <div className='p-2 text-xs'>
                    {tripulacaoNome('capitao')}
                  </div>
                </div>
                <div className='flex flex-col border gap-1 rounded-xl grow'>
                  <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                    Armador
                  </div>
                  <div className='p-2 text-xs'>
                    {tripulacaoNome('armador')}
                  </div>
                </div>
                <div className='flex flex-col border gap-1 rounded-xl grow'>
                  <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                    Mestre
                  </div>
                  <div className='p-2 text-xs'>
                    {tripulacaoNome('mestre')}
                  </div>
                </div>
                <div className='flex flex-col border gap-1 rounded-xl grow'>
                  <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                    Cosignatário
                  </div>
                  <div className='p-2 text-xs'>
                    {tripulacaoNome('consignatario')}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='passengers' className='w-full'>
            <AccordionTrigger>Passageiros</AccordionTrigger>
            <AccordionContent>
              <TablePassageiros
                passageiros={viagem?.passageiro}
                viagem_id={viagem?.id}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='Escalas' className='w-full'>
            <AccordionTrigger>Escalas</AccordionTrigger>
            <AccordionContent>
              <TableEscalas escalas={viagem?.escala} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value='cargo' className='w-full'>
            <AccordionTrigger>Mercadoria</AccordionTrigger>
            <AccordionContent>
              <TableMercadorias
                mercadorias={viagem?.relac_mercadoria_viagem}
                viagem_id={viagem?.id}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
