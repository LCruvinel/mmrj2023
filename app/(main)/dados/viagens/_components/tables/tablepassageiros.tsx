'use client';

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
import chunk from '@/lib/chunk';
import Paginacao from '@/components/sharedpagination';

export default function TablePassageiros(props: {
  passageiros: Passageiro[] | undefined;
  viagem_id: number | undefined;
}) {
  const { passageiros, viagem_id } = props;
  const [activePage, setPage] = useState(1);
  const chunked = chunk(passageiros ?? [], 5);
  const passageirosdata = chunked[activePage - 1];

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
    </>
  );
}
