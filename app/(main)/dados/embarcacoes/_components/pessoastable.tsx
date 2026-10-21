'use client';

import Paginacao from '@/components/sharedpagination';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import chunk from '@/lib/chunk';
import dayjs from 'dayjs';
import { useState } from 'react';

interface PessoasTableProps {
  embarcacao: Embarcacao;
}

export const PessoasTable: React.FC<PessoasTableProps> = ({ embarcacao }) => {
  const pessoasRelacionadas = ((embarcacao as any)?.pessoas_via_viagem ?? []) as Array<{
    id: number;
    nome: string;
    funcao: string;
    pessoa?: { id?: number; nome?: string };
  }>;

  const [activePagePessoas, setPagePessoas] = useState(1);
  const chunkedpessoas = chunk(pessoasRelacionadas, 5);
  const pessoas = chunkedpessoas[activePagePessoas - 1];

  return (
    <>
      <Table>
        <TableHeader className='p-2 text-xs bg-blue-200  dark:bg-slate-900'>
          <TableRow className='rounded-ss-xl'>
            <TableHead>Pessoa</TableHead>
            <TableHead>Função</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pessoas?.map((relacao) => (
            <TableRow key={relacao.id ?? relacao.pessoa?.id ?? relacao.nome}>
              <TableCell className='text-xs font-medium'>
                {relacao.pessoa?.nome ?? relacao.nome ?? 'N/A'}
              </TableCell>
              <TableCell className='text-xs'>
                {relacao.funcao ?? 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        {pessoasRelacionadas.length === 0 && (
          <TableCaption>Nenhuma pessoa encontrada para esta embarcação</TableCaption>
        )}
      </Table>
      <Paginacao
        chunked={chunkedpessoas}
        activePage={activePagePessoas}
        setPage={setPagePessoas}
      />
    </>
  );
};

export default PessoasTable;
