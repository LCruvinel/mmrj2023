import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useState } from "react";
import fetcher from "@/lib/fetch";
import { XIcon } from "lucide-react";
import chunk from "@/lib/chunk";
import Paginacao from "@/components/sharedpagination";

dayjs.extend(utc);
dayjs.extend(tz);

export default function PersonRelacaoEmbarcacaoTable(props: {
  pessoa: Pessoa | undefined;
  mutatePessoa: () => void;
}) {
  const { pessoa, mutatePessoa } = props;
  const [deleting, setDeleting] = useState(false);
  const [activePage, setPage] = useState(1);

  const chunked = chunk(pessoa?.relacao_embarcacao_proprietario ?? [], 5);
  const pessoadata = chunked[activePage - 1];

  async function handleDeleteOwner(id: number) {
    setDeleting(true);
    await fetcher(`/api/embarcacao/delete/owner`, {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    mutatePessoa();
    setDeleting(false);
  }

  return (
    <div className="w-full rounded-ss-xl rounded-se-xl gap-4 antialiased">
      <Table className="shadow-xl">
        <TableHeader className="p-2 text-xs bg-blue-200 border-t-0 dark:bg-slate-900 ">
          <TableRow className="rounded-ss-xl">
            <TableHead className="hidden md:table-cell">ID</TableHead>
            <TableHead>Embarcação</TableHead>
            <TableHead>Início</TableHead>
            <TableHead>Fim</TableHead>
            <TableHead>País</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pessoadata?.map((relacao) => (
            <TableRow key={relacao.id}>
              <TableCell className="px-4 py-0 text-xs font-medium hidden md:table-cell">
                {relacao.embarcacao.id}
              </TableCell>
              <TableCell className="px-4 py-0 text-xs">
                {relacao.embarcacao.nome}
              </TableCell>
              <TableCell className="px-4 py-0 text-xs">
                {relacao.data_inicio
                  ? dayjs.tz(relacao.data_inicio, "UTC").format("DD/MM/YYYY")
                  : "N/A"}
              </TableCell>
              <TableCell className="px-4 py-0 text-xs">
                {relacao.data_fim
                  ? dayjs.tz(relacao.data_fim, "UTC").format("DD/MM/YYYY")
                  : "N/A"}
              </TableCell>

              <TableCell className="px-4 py-0 text-xs">
                {relacao.pais.nome}
              </TableCell>
              <TableCell className="px-4 py-0 text-xs">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="link"
                      className="text-xs text-blue-500"
                    >
                      <XIcon className="w-4 text-red-700" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Esta ação irá remover o
                        proprietário da embarcação.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 hover:bg-red-600"
                        disabled={deleting}
                        onClick={() => handleDeleteOwner(relacao.id)}
                      >
                        {deleting ? "Aguarde..." : "Remover"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        {pessoa?.relacao_embarcacao_proprietario?.length === 0 && (
          <TableCaption className="p-4">
            Nenhum registo de embarcação encontrado
          </TableCaption>
        )}
      </Table>
      <Paginacao chunked={chunked} activePage={activePage} setPage={setPage} />
    </div>
  );
}
