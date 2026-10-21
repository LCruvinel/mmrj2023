import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import fetcher from "@/lib/fetch";
import { Dispatch, SetStateAction } from "react";
import useSWR from "swr";
import Loader from "@/components/loader";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import chunk from "@/lib/chunk";
import Paginacao from "@/components/sharedpagination";
import { useState } from "react";

export default function CargoDetails(props: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  cargo_id: number | undefined;
}) {
  const [activePage, setPage] = useState(1);
  const { open, setOpen, cargo_id } = props;
  const { data: relacs, isLoading } = useSWR<RelacPessoaCargo[]>(
    cargo_id ? `/api/pessoa/read/bycargo?id=${cargo_id}` : null,
    fetcher,
  );

  const chunked = chunk(relacs ?? [], 5);
  const relacsdata = chunked[activePage - 1];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="min-w-[50%] max-w-[95%] lg:max-w-[50%] p-6 rounded-lg max-h-[95%] overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>Pessoas com este cargo</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader classProp="w-24 h-24" />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader className="p-2 text-xs border-t-0 bg-gradient-to-r from-blue-200 to-blue-400 dark:from-slate-700 dark:to-slate-950">
                <TableRow className="rounded-ss-xl">
                  <TableHead>Nome</TableHead>
                  <TableHead>País</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relacsdata?.map((relac) => (
                  <TableRow
                    className="cursor-pointer hover:bg-blue-100"
                    key={relac.pessoa.id}
                  >
                    <TableCell className="text-xs font-medium">
                      {relac.pessoa?.nome}
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {relac.pessoa?.pais?.nome}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {relacsdata?.length === 0 && (
                <TableCaption className="p-4">
                  Nenhuma pessoa com este cargo
                </TableCaption>
              )}
            </Table>
            <Paginacao
              chunked={chunked}
              activePage={activePage}
              setPage={setPage}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
