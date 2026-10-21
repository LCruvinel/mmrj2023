'use client';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';
import { useState } from 'react';
import chunk from '@/lib/chunk';
import Paginacao from '@/components/sharedpagination';

dayjs.extend(utc);
dayjs.extend(tz);

export default function PersonRelacaoEmbarcacaoTable(props: {
  pessoa: Pessoa | undefined;
}) {
  const { pessoa } = props;
  const [activePage, setPage] = useState(1);

  const chunked = chunk(pessoa?.relacao_embarcacao_proprietario ?? [], 5);
  const pessoadata = chunked[activePage - 1];

  return (
    <div className='w-full rounded-ss-xl rounded-se-xl gap-4 antialiased'>
      <Table className='shadow-xl'>
        <TableHeader className='p-2 text-md bg-blue-200 border-t-0 dark:bg-slate-900 '>
          <TableRow className='rounded-ss-xl'>
            <TableHead>Embarcação</TableHead>
            <TableHead>Início</TableHead>
            <TableHead>Fim</TableHead>
            <TableHead>País</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pessoadata?.map((relacao) => (
            <TableRow key={relacao.id}>
              <TableCell className='px-4 py-2 text-md'>
                {relacao.embarcacao.nome}
              </TableCell>
              <TableCell className='px-4 py-2 text-md'>
                {relacao.data_inicio
                  ? dayjs.tz(relacao.data_inicio, 'UTC').format('DD/MM/YYYY')
                  : 'N/A'}
              </TableCell>
              <TableCell className='px-4 py-2 text-md'>
                {relacao.data_fim
                  ? dayjs.tz(relacao.data_fim, 'UTC').format('DD/MM/YYYY')
                  : 'N/A'}
              </TableCell>

              <TableCell className='px-4 py-2 text-md'>
                {relacao.pais.nome}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        {pessoa?.relacao_embarcacao_proprietario?.length === 0 && (
          <TableCaption className='p-4'>
            Nenhum registo de embarcação encontrado
          </TableCaption>
        )}
      </Table>
      <Paginacao chunked={chunked} activePage={activePage} setPage={setPage} />
    </div>
  );
}
