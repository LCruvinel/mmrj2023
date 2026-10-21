'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState } from 'react';
import Paginacao from '@/components/sharedpagination';
import chunk from '@/lib/chunk';

export default function TableMercadorias(props: {
  mercadorias: RelacMercadoriaViagem[] | undefined;
  viagem_id: number | undefined;
}) {
  const { mercadorias } = props;
  const [activePage, setPage] = useState(1);

  const chunked = chunk(mercadorias ?? [], 5);
  const mercadoriasdata = chunked[activePage - 1];

  return (
    <>
      <Table>
        <TableHeader className='p-2 text-xs bg-blue-200 border-t-0 dark:bg-slate-900 '>
          <TableRow className='rounded-ss-xl'>
            <TableHead>Mercadoria</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mercadoriasdata?.map((mercadoria) => (
            <TableRow
              className='cursor-pointer hover:bg-blue-100'
              key={mercadoria.id}
            >
              <TableCell className='text-xs font-medium'>
                {mercadoria.mercadoria?.nome}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Paginacao chunked={chunked} activePage={activePage} setPage={setPage} />
    </>
  );
}
