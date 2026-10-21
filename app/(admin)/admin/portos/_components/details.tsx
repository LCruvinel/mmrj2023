import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import fetcher from '@/lib/fetch';
import { Dispatch, SetStateAction, useState } from 'react';
import useSWR from 'swr';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/alert-dialog';
import Loader from '@/components/loader';
import { toast } from '@/components/ui/use-toast';
import chunk from '@/lib/chunk';
import Paginacao from '@/components/sharedpagination';

export default function PortoDetails(props: {
  open: boolean;
  setOpen: (boolean: boolean) => void;
  porto_id: number | undefined;
  mutate: () => void;
}) {
  const { open, setOpen, porto_id, mutate } = props;
  const [deleting, setDeleting] = useState(false);
  const [activePageOrigem, setPageOrigem] = useState(1);
  const [activePageDestino, setPageDestino] = useState(1);

  const {
    data: porto,
    isLoading,
    mutate: mutatePorto,
  } = useSWR<Porto>(
    porto_id ? `/api/porto/read/byid?id=${porto_id}` : null,
    fetcher
  );

  const chunked_origem = chunk(porto?.viagem_origem ?? [], 5);
  const porto_origem = chunked_origem[activePageOrigem - 1];

  const chunked_destino = chunk(porto?.viagem_destino ?? [], 5);
  const porto_destino = chunked_destino[activePageDestino - 1];

  async function handleDeletePorto(id: number | undefined) {
    setDeleting(true);
    await fetch(`/api/porto/delete`, {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
    mutate();
    toast({
      className: 'bg-green-200',
      title: 'Sucesso',
      duration: 5000,
      description: 'Porto removido com sucesso',
    });
    setDeleting(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='min-w-[50%] max-w-[95%] lg:max-w-[50%] p-6 rounded-lg max-h-[95%] overflow-y-scroll'>
        <DialogHeader>
          <DialogTitle>
            {isLoading ? (
              <div className='flex items-center justify-center'>
                <Loader classProp='w-24 h-24' />
              </div>
            ) : (
              'Embarcação #' + porto_id
            )}
          </DialogTitle>
        </DialogHeader>
        {!isLoading && (
          <>
            <div className='flex flex-wrap gap-2 '>
              <div className='flex w-full lg:w-auto flex-col gap-1 rounded-xl border min-w-[50%]'>
                <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                  Nome
                </div>
                <div className='p-2 text-xs'>{porto?.nome}</div>
              </div>
              <div className='flex flex-col border gap-1 rounded-xl grow'>
                <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                  País
                </div>
                <div className='p-2 text-xs'>{porto?.pais?.nome}</div>
              </div>
            </div>
            <div className='flex flex-col w-full border gap-1 rounded-xl'>
              <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                Viagens de Origem
              </div>
              <div className='flex-1 max-w-xs p-2  md:max-w-full rounded-ss-xl rounded-se-xl'>
                <Table>
                  <TableHeader className='p-2 text-xs bg-blue-200 dark:bg-slate-900 '>
                    <TableRow className='rounded-ss-xl'>
                      <TableHead>ID</TableHead>
                      <TableHead>Embarcação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {porto_origem?.map((viagem) => (
                      <TableRow key={viagem.id}>
                        <TableCell className='text-xs font-medium'>
                          {viagem.id}
                        </TableCell>
                        <TableCell className='text-xs'>
                          {viagem.embarcacao?.nome}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  {porto?.viagem_origem.length === 0 && (
                    <TableCaption>
                      Nenhuma viagem de origem encontrada
                    </TableCaption>
                  )}
                </Table>
                <Paginacao
                  chunked={chunked_origem}
                  activePage={activePageOrigem}
                  setPage={setPageOrigem}
                />
              </div>
            </div>

            {/* DESTINO */}
            <div className='flex flex-col w-full border gap-1 rounded-xl'>
              <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                Viagens de Destino
              </div>
              <div className='flex-1 max-w-xs p-2  md:max-w-full rounded-ss-xl rounded-se-xl'>
                <Table>
                  <TableHeader className='p-2 text-xs bg-blue-200 dark:bg-slate-900 '>
                    <TableRow className='rounded-ss-xl'>
                      <TableHead>ID</TableHead>
                      <TableHead>Embarcação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {porto_destino?.map((viagem) => (
                      <TableRow key={viagem.id}>
                        <TableCell className='text-xs font-medium'>
                          {viagem.id}
                        </TableCell>
                        <TableCell className='text-xs'>
                          {viagem.embarcacao?.nome}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  {porto?.viagem_destino?.length === 0 && (
                    <TableCaption>
                      Nenhuma viagem de origem encontrada
                    </TableCaption>
                  )}
                </Table>
                <Paginacao
                  chunked={chunked_origem}
                  activePage={activePageDestino}
                  setPage={setPageDestino}
                />
              </div>
            </div>
          </>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant='destructive'>Remover Porto</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className='text-red-500'>
                Tem a certeza?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Esta ação irá remover o porto.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                disabled={deleting}
                className='bg-red-500 hover:bg-red-600'
                onClick={() => handleDeletePorto(porto_id)}
              >
                {deleting && <Loader classProp='w-4 h-4 mr-2' />} Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
