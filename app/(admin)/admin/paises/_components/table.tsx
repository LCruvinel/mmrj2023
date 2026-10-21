"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Loader from "@/components/loader";
import useSWR from "swr";
import fetcher from "@/lib/fetch";
import BotaoNovoPais from "./buttonnew";
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
import { Button } from "@/components/ui/button";
import { EditIcon, XIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import Paginacao from "@/components/sharedpagination";
import chunk from "@/lib/chunk";
import { useState } from "react";
import DialogEditarPais from "./dialogedit";
import { Input } from "@/components/ui/input";
import BotaoExportarParaExcel from "./buttonexport";

export default function TabelaPaises() {
  const [openEdit, setOpenEdit] = useState(false);
  const [paisId, setPaisId] = useState<number | undefined>();
  const [activePage, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const {
    data: paisesdata,
    isLoading,
    mutate,
  } = useSWR<Pais[]>(
    searchText ? "/api/pais/read/byname?pais=" + searchText : "/api/pais/read",
    fetcher,
  );

  const chunked = chunk(paisesdata ?? [], 10);
  const paises = chunked[activePage - 1];

  async function handleDeletePais(id: number) {
    await fetch(`/api/pais/delete`, {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    mutate();
    toast({
      className: "bg-green-200",
      title: "Sucesso",
      duration: 5000,
      description: "Unidade removida com sucesso",
    });
  }

  return (
    <>
      <div className="flex flex-col-reverse justify-between md:flex-row gap-4 ">
        <Input
          name="search"
          className="rounded-xl"
          placeholder="Pesquisar por nome..."
          onChange={(e) => setSearchText(e.target.value)}
        />
        <BotaoNovoPais mutate={mutate} />
        <BotaoExportarParaExcel paises={paisesdata} />
      </div>
      {isLoading ? (
        <div className="flex flex-row justify-center p-4">
          <Loader classProp="w-24 h-24 self-center flex" />
        </div>
      ) : (
        <Table>
          <TableHeader className="p-2 border-t-0 bg-gradient-to-r from-blue-200 to-blue-400 dark:from-slate-700 dark:to-slate-950">
            <TableRow>
              {/* <TableHead className='w-4'>ID</TableHead> */}
              <TableHead className="w-96">Nome</TableHead>
              <TableHead>Gentílico</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paises?.map((pais) => (
              <TableRow
                className="cursor-pointer hover:bg-blue-100"
                key={pais.id}
              >
                {/* <TableCell className='w-10 font-medium'>{pais.id}</TableCell> */}
                <TableCell className="font-medium">{pais.nome}</TableCell>
                <TableCell className="font-medium">{pais.gentilico}</TableCell>
                <TableCell className="w-4">
                  <div className="flex gap-2">
                    <Button
                      className="text-blue-500 bg-transparent hover:bg-blue-500 hover:text-white rounded-xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPaisId(pais.id);
                        setOpenEdit(true);
                      }}
                    >
                      <EditIcon size={24} />
                    </Button>
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
                          <AlertDialogTitle className="text-red-500">
                            Tem a certeza?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Esta ação irá
                            remover a unidade de medida.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            disabled={isLoading}
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => handleDeletePais(pais.id)}
                          >
                            {isLoading ? "Aguarde..." : "Remover"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <DialogEditarPais
        open={openEdit}
        setOpen={setOpenEdit}
        id_pais={paisId}
        nome={paises?.find((pais) => pais.id === paisId)?.nome}
        gentilico={paises?.find((pais) => pais.id === paisId)?.gentilico}
        mutate={mutate}
      />

      <Paginacao chunked={chunked} activePage={activePage} setPage={setPage} />

      {/* <VesselDetails
        open={open}
        setOpen={setOpen}
        embarcacao_id={embarcacao_id}
      /> */}
    </>
  );
}
