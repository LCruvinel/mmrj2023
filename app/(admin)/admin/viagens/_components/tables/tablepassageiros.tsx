import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState } from 'react';
import Loader from '@/components/loader';
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
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import chunk from '@/lib/chunk';
import Paginacao from '@/components/sharedpagination';
import BotaoNovoPassageiro from '../buttons/buttonnovopassageiro';

export default function TablePassageiros(props: {
  passageiros: Passageiro[] | undefined;
  mutate: () => void;
  viagem_id: number | undefined;
}) {
  const { passageiros, mutate, viagem_id } = props;
  const [deleting, setDeleting] = useState(false);
  const [activePage, setPage] = useState(1);

  const chunked = chunk(passageiros ?? [], 5);
  const passageirosdata = chunked[activePage - 1];

  async function handleDeletePassageiro(id: number) {
    setDeleting(true);
    await fetch(`/api/passageiros/delete`, {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
    mutate();
    setDeleting(false);
  }

  if (deleting) {
    return <Loader classProp='w-10 h-10' />;
  }

  return (
    <>
      <Table className='border-b'>
        <TableHeader className='p-2 text-xs bg-blue-200 border-t-0 dark:bg-slate-900 '>
          <TableRow className='rounded-ss-xl'>
            <TableHead>Nome</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {passageirosdata?.map((passageiro) => (
            <TableRow
              className='cursor-pointer hover:bg-blue-100'
              key={passageiro.id}
            >
              <TableCell className='text-xs font-medium'>
                {(passageiro as any)?.nome ||
                  passageiro?.tipo_passageiro?.tipo ||
                  'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>

        {passageiros?.length === 0 && (
          <TableCaption>
            Não registámos qualquer passageiro nesta viagem
          </TableCaption>
        )}
      </Table>
      <Paginacao chunked={chunked} activePage={activePage} setPage={setPage} />
      <BotaoNovoPassageiro mutate={mutate} viagem_id={viagem_id} />
    </>
  );
}
