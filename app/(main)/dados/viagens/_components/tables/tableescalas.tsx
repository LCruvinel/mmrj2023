'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState } from 'react';
import Paginacao from '@/components/sharedpagination';
import chunk from '@/lib/chunk';
import MercadoriaEscalasDrawer from '../mercadoriaescaladrawer';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

export default function TableEscalas(props: { escalas: Escala[] | undefined }) {
  const [activePage, setPage] = useState(1);
  const { escalas } = props;
  const [open, setOpen] = useState(false);
  const [relacmercadoriaescala, setRelacMercadoriaEscala] = useState<
    RelacMercadoriaEscala[] | undefined
  >();
  const [escala_id, setEscalaId] = useState<number | undefined>();

  const chunked = chunk(escalas ?? [], 5);
  const escalasdata = chunked[activePage - 1];

  return (
    <>
      <Table className='border-b'>
        <TableHeader className='p-2 text-xs bg-blue-200 border-t-0 dark:bg-slate-900 '>
          <TableRow className='rounded-ss-xl'>
            <TableHead>Porto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {escalasdata?.map((escala) => (
            <HoverCard key={escala.id}>
              <HoverCardTrigger asChild>
                <TableRow
                  className='cursor-pointer hover:bg-blue-100'
                  key={escala.id}
                  onClick={(e) => {
                    setRelacMercadoriaEscala(escala.relac_mercadoria_escala);
                    setEscalaId(escala.id);
                    setOpen(true);
                  }}
                >
                  <TableCell className='text-xs font-medium '>
                    {escala.porto?.nome || 'N/A'}
                  </TableCell>
                </TableRow>
              </HoverCardTrigger>
              <HoverCardContent>
                <p>Escala {escala.id}</p>
              </HoverCardContent>
            </HoverCard>
          ))}
        </TableBody>
      </Table>
      <Paginacao chunked={chunked} activePage={activePage} setPage={setPage} />
      <MercadoriaEscalasDrawer
        open={open}
        setOpen={setOpen}
        escala_id={escala_id}
      />
    </>
  );
}
