import { validateRequest } from '@/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export async function GET() {
  const { user } = await validateRequest();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const embarcacoes = await prisma.embarcacao.aggregate({
    _count: {
      id: true,
    },
  });

  const pessoas = await prisma.pessoa.aggregate({
    _count: {
      id: true,
    },
  });

  const viagens = await prisma.viagem.aggregate({
    _count: {
      id: true,
    },
  });

  const tipo_embarcacao = await prisma.tipo_embarcacao.aggregate({
    _count: {
      id: true,
    },
  });

  const titulo_nobreza = await prisma.titulo_nobreza.aggregate({
    _count: {
      id: true,
    },
  });

  const unidades_de_medida = await prisma.unidade_de_medida.aggregate({
    _count: {
      id: true,
    },
  });

  const cargos = await prisma.cargo.aggregate({
    _count: {
      id: true,
    },
  });

  const portos = await prisma.porto.aggregate({
    _count: {
      id: true,
    },
  });

  const usuarios = await prisma.user.aggregate({
    _count: {
      id: true,
    },
  });

  // Embarcacao com mais viagens

  let EmbarcacaoWithMostViagens: {
    count: number;
    name: string | null | undefined;
  } = {
    count: 0,
    name: '',
  };

  const queryEmbarcacaoWithMostViagens = await prisma.viagem.groupBy({
    by: ['id_embarcacao'],
    _count: {
      _all: true,
    },
    orderBy: {
      _count: {
        id_embarcacao: 'desc',
      },
    },
    take: 1,
  });

  const embarcacaoId = queryEmbarcacaoWithMostViagens[0].id_embarcacao;

  const queryEmbarcacao = await prisma.embarcacao.findUnique({
    where: {
      id: embarcacaoId || undefined,
    },
    select: {
      nome: true,
    },
  });

  EmbarcacaoWithMostViagens.count =
    queryEmbarcacaoWithMostViagens[0]._count._all;
  EmbarcacaoWithMostViagens.name = queryEmbarcacao?.nome;

  // Mestre com mais viagens
  let mestreWithMostViagens: {
    count: number;
    name: string | null | undefined;
  } = {
    count: 0,
    name: '',
  };

  const queryMestreWithMostViagens = await prisma.viagem.groupBy({
    by: ['mestre_id'],
    _count: {
      _all: true,
    },
    orderBy: {
      _count: {
        mestre_id: 'desc',
      },
    },
    take: 1,
  });

  const idmestre = queryMestreWithMostViagens[0].mestre_id;
  if (idmestre) {
    const queryMestre = await prisma.pessoa.findUnique({
      where: {
        id: idmestre,
      },
      select: {
        nome: true,
      },
    });

    mestreWithMostViagens.count = queryMestreWithMostViagens[0]._count._all;
    mestreWithMostViagens.name = queryMestre?.nome;
  }
  // Capitao com mais viagens
  let capitaoWithMostViagens: {
    count: number;
    name: string | null | undefined;
  } = {
    count: 0,
    name: '',
  };

  const queryCapitaoWithMostViagens = await prisma.viagem.groupBy({
    by: ['capitao_id'],
    _count: {
      _all: true,
    },
    orderBy: {
      _count: {
        capitao_id: 'desc',
      },
    },
    take: 1,
  });

  const idcapitao = queryCapitaoWithMostViagens[0].capitao_id;
  if (idcapitao) {
    const queryCapitao = await prisma.pessoa.findUnique({
      where: {
        id: idcapitao || undefined,
      },
      select: {
        nome: true,
      },
    });
    capitaoWithMostViagens.count = queryCapitaoWithMostViagens[0]._count._all;
    capitaoWithMostViagens.name = queryCapitao?.nome;
  }
  // Armador com mais viagens

  let armadorWithMostViagens: {
    count: number;
    name: string | null | undefined;
  } = {
    count: 0,
    name: '',
  };

  const queryArmadorWithMostViagens = await prisma.viagem.groupBy({
    by: ['armador_id'],
    _count: {
      _all: true,
    },
    orderBy: {
      _count: {
        armador_id: 'desc',
      },
    },
    take: 1,
  });

  const idarmador = queryArmadorWithMostViagens[0]?.armador_id;
  if (idarmador) {
    const queryArmador = await prisma.pessoa.findUnique({
      where: {
        id: idarmador || undefined,
      },
      select: {
        nome: true,
      },
    });
    armadorWithMostViagens.count = queryArmadorWithMostViagens[0]?._count._all;
    armadorWithMostViagens.name = queryArmador?.nome;
  }

  // Comandante com mais viagens
  let comandanteWithMostViagens: {
    count: number;
    name: string | null | undefined;
  } = {
    count: 0,
    name: '',
  };

  const queryComandanteWithMostViagens = await prisma.viagem.groupBy({
    by: ['comandante_id'],
    _count: {
      _all: true,
    },
    orderBy: {
      _count: {
        comandante_id: 'desc',
      },
    },
    take: 1,
  });

  const idcomandante = queryComandanteWithMostViagens[0]?.comandante_id;
  if (idcomandante) {
    const queryComandante = await prisma.pessoa.findUnique({
      where: {
        id: idcomandante || undefined,
      },
      select: {
        nome: true,
      },
    });
    comandanteWithMostViagens.count =
      queryComandanteWithMostViagens[0]._count._all;
    comandanteWithMostViagens.name = queryComandante?.nome;
  }
  //Porto com mais escalas
  let portoWithMostEscalas: {
    count: number;
    name: string | null | undefined;
    pais: string | null | undefined;
  } = {
    count: 0,
    name: '',
    pais: '',
  };

  const queryPortoWithMostEscalas = await prisma.escala.groupBy({
    by: ['id_porto'],
    _count: {
      _all: true,
    },
    orderBy: {
      _count: {
        id_porto: 'desc',
      },
    },
    take: 1,
  });

  const idporto = queryPortoWithMostEscalas[0]?.id_porto;
  if (idporto) {
    const queryPorto = await prisma.porto.findUnique({
      where: {
        id: idporto,
      },
      select: {
        nome: true,
        pais: {
          select: {
            nome: true,
          },
        },
      },
    });
    portoWithMostEscalas.count = queryPortoWithMostEscalas[0]._count._all;
    portoWithMostEscalas.name = queryPorto?.nome;
    portoWithMostEscalas.pais = queryPorto?.pais?.nome;
  }

  //viagem com mais total de passageiros

  let viagemWithMostPassageiros: {
    count: number;
    id: number | null | undefined;
  } = {
    count: 0,
    id: 0,
  };

  const queryViagensWithMostPassageiros = await prisma.passageiro.groupBy({
    by: ['id_viagem'],
    _sum: {
      total: true,
    },
    orderBy: {
      _count: {
        id_viagem: 'desc',
      },
    },
    take: 1,
  });

  viagemWithMostPassageiros.count =
    queryViagensWithMostPassageiros[0]._sum.total || 0;
  viagemWithMostPassageiros.id = queryViagensWithMostPassageiros[0].id_viagem;

  //Top 5 embarcacoes com mais viagens
  const topEmbarcacoesWithMostViagens = await prisma.viagem.groupBy({
    by: ['id_embarcacao'],
    _count: {
      _all: true,
    },
    orderBy: {
      _count: {
        id_embarcacao: 'desc',
      },
    },
    take: 5,
  });

  const top5Embarcacoes = await Promise.all(
    topEmbarcacoesWithMostViagens.map(
      async (item: { id_embarcacao: number | null; _count: { _all: number } }) => {
      const embarcacao = await prisma.embarcacao.findUnique({
        where: {
          id: item.id_embarcacao || undefined,
        },
        select: {
          nome: true,
        },
      });
      return {
        name: embarcacao?.nome || 'Desconhecida',
        viagens: item._count._all,
      };
      }
    )
  );

  // países com mais portos
  const topPaisesWithMostPortos = await prisma.porto.groupBy({
    by: ['id_pais'],
    _count: {
      _all: true,
    },
    orderBy: {
      _count: {
        id_pais: 'desc',
      },
    },
    take: 5,
  });

  const top5Paises = await Promise.all(
    topPaisesWithMostPortos.map(
      async (item: { id_pais: number | null; _count: { _all: number } }) => {
      const pais = await prisma.pais.findUnique({
        where: {
          id: item.id_pais || undefined,
        },
        select: {
          nome: true,
        },
      });
      return {
        name: pais?.nome || 'Desconhecido',
        portos: item._count._all,
      };
      }
    )
  );

  // top 5 tipos de embarcação mais populares

  const topTipoEmbarcacao = await prisma.embarcacao.groupBy({
    by: ['id_tipo_embarcacao'],
    _count: {
      _all: true,
    },
    orderBy: {
      _count: {
        id_tipo_embarcacao: 'desc',
      },
    },
    take: 5,
  });

  const top5TipoEmbarcacao = await Promise.all(
    topTipoEmbarcacao.map(
      async (item: { id_tipo_embarcacao: number | null; _count: { _all: number } }) => {
      const tipoEmbarcacao = await prisma.tipo_embarcacao.findUnique({
        where: {
          id: item.id_tipo_embarcacao || undefined,
        },
        select: {
          tipo: true,
        },
      });
      return {
        name: tipoEmbarcacao?.tipo || 'Desconhecido',
        embarcacoes: item._count._all,
      };
      }
    )
  );

  // top 5mercadorias mais transportadas

  // const topMercadoriasTransportadas =
  //   await prisma.relac_mercadoria_escala.groupBy({
  //     by: ['id_mercadoria'],
  //     _sum: {
  //       quantidade: true,
  //     },
  //     orderBy: {
  //       _sum: {
  //         quantidade: 'desc',
  //       },
  //     },
  //     take: 5,
  //   });

  // const top5Mercadorias = await Promise.all(
  //   topMercadoriasTransportadas.map(async (item) => {
  //     const mercadoria = await prisma.mercadoria.findUnique({
  //       where: {
  //         id: item.id_mercadoria || undefined,
  //       },
  //       select: {
  //         nome: true,
  //       },
  //     });
  //     return {
  //       name: mercadoria?.nome || 'Desconhecida',
  //       quantidade: item._sum.quantidade || 0,
  //     };
  //   })
  // );

  const result = {
    embarcacoes,
    pessoas,
    viagens,
    tipo_embarcacao,
    titulo_nobreza,
    unidades_de_medida,
    cargos,
    portos,
    usuarios,
    embarcacaoWithMostViagens: EmbarcacaoWithMostViagens,
    mestreWithMostViagens: mestreWithMostViagens,
    capitaoWithMostViagens: capitaoWithMostViagens,
    armadorWithMostViagens: armadorWithMostViagens,
    comandanteWithMostViagens: comandanteWithMostViagens,
    portoWithMostEscalas: portoWithMostEscalas,
    viagemWithMostPassageiros: viagemWithMostPassageiros,
    top5EmbarcacoesWithMostViagens: top5Embarcacoes,
    topPaisesWithMostPortos: top5Paises,
    top5TipoEmbarcacao: top5TipoEmbarcacao,
  };

  return Response.json(result);
}
