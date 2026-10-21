import prisma from "@/lib/prisma";
import TabelaPessoaCargo from "../_components/tablerelaccargo";
import PersonRelacaoEmbarcacaoTable from "../_components/personrelacembarcacaotable";

async function getData(id: string) {
  const res = await prisma.pessoa.findUnique({
    where: {
      id: parseInt(id),
    },
    select: {
      id: true,
      nome: true,
    },
  });

  if (!res) {
    return null;
  }

  return {
    ...res,
    titulo_nobreza: null,
    minibiografia: null,
    relacao_pessoa_cargo: [],
    relacao_embarcacao_proprietario: [],
  };
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;
  const pessoa = (await getData(id)) as unknown as Pessoa;

  return (
    <div className="p-1 md:p-4 mt-10 lg:mx-24 bg-white rounded-xl flex flex-col gap-2 shadow-2xl dark:bg-slate-700">
      <div className="flex flex-wrap gap-2">
        <div className="flex w-full lg:w-auto flex-col gap-1 rounded-xl border min-w-[50%]">
          <div className="p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl">
            Nome
          </div>
          <div className="p-2 text-md">{pessoa?.nome}</div>
        </div>

        <div className="flex flex-col border gap-1 rounded-xl grow">
          <div className="p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl">
            Título de Nobreza
          </div>
          <div className="p-2 text-md">{pessoa?.titulo_nobreza?.titulo}</div>
        </div>
      </div>

      <div className="flex flex-col border gap-1 rounded-xl grow">
        <div className="p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl">
          Mini biografia
        </div>
        <div className="p-2 text-md">{pessoa?.minibiografia?.biografia}</div>
      </div>

      <div className="flex flex-col mt-4">
        <div className="flex gap-1 p-2 bg-blue-200 dark:bg-slate-900 justify-center mx-auto w-[50%] rounded-ss-xl rounded-se-xl text-sm">
          Cargos
        </div>
        <TabelaPessoaCargo pessoa={pessoa} />
      </div>

      <div className="flex flex-col mt-4 overflow-hidden">
        <div className="flex gap-1 p-2 bg-blue-200 dark:bg-slate-900 justify-center mx-auto w-[50%] rounded-ss-xl rounded-se-xl text-sm">
          Embarcações
        </div>
        <PersonRelacaoEmbarcacaoTable pessoa={pessoa} />
      </div>
    </div>
  );
}
