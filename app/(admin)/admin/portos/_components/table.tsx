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
import Loader from '@/components/loader';
import useSWR from 'swr';
import fetcher from '@/lib/fetch';
import BotaoNovaUnidade from './buttonnew';
import PortoDetails from './details';
import { Button } from '@/components/ui/button';
import { EditIcon } from 'lucide-react';
import DialogEditarPorto from './dialogedit';
import PaginacaoByTotal from '@/components/sharedpaginationbytotal';
import { Input } from '@/components/ui/input';
import BotaoExportarParaExcel from './buttonexport';
import { useSearchParams } from 'next/navigation';

type PortosAndTotal = {
  portos: Porto[];
  total: number;
};

export default function TabelaPortos() {
  const searchParams = useSearchParams();
  const name = searchParams.get('nome');
  const [activePage, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [porto_id, setPortoId] = useState<number | undefined>();
  const [openEdit, setOpenEdit] = useState(false);
  const [searchText, setSearchText] = useState(name ?? '');

  const {
    data: data,
    isLoading,
    mutate,
  } = useSWR<PortosAndTotal>(
    '/api/porto/read/bynamepagination?nome=' +
      searchText +
      '&page=' +
      activePage,
    fetcher
  );

  return (
    <>
      <div className='flex flex-col-reverse justify-between md:flex-row gap-4 '>
        <Input
          value={searchText}
          name='search'
          className='rounded-xl'
          placeholder='Pesquisar por nome...'
          onChange={(e) => setSearchText(e.target.value)}
        />
        <BotaoNovaUnidade mutate={mutate} />
        <BotaoExportarParaExcel portos={data?.portos} />
      </div>
      {isLoading ? (
        <div className='flex flex-row justify-center p-4'>
          <Loader classProp='w-24 h-24 self-center flex' />
        </div>
      ) : (
        <Table>
          <TableHeader className='p-2 border-t-0 bg-gradient-to-r from-blue-200 to-blue-400  dark:from-slate-700 dark:to-slate-950'>
            <TableRow>
              <TableHead className='w-4 hidden md:table-cell'>ID</TableHead>
              <TableHead className='w-96'>Nome</TableHead>
              <TableHead>País</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.portos?.map((porto) => (
              <TableRow
                className='cursor-pointer hover:bg-blue-100'
                key={porto.id}
                onClick={(e) => {
                  setPortoId(porto.id);
                  setOpen(true);
                }}
              >
                <TableCell className='w-10 font-medium hidden md:table-cell'>
                  {porto.id}
                </TableCell>
                <TableCell className='font-medium max-w-32'>
                  {porto.nome}
                </TableCell>
                <TableCell className='font-medium'>
                  {porto.pais?.nome}
                </TableCell>
                <TableCell className='w-4'>
                  <Button
                    className='text-blue-500 bg-transparent hover:bg-blue-500 hover:text-white rounded-xl'
                    onClick={(e) => {
                      e.stopPropagation();
                      setPortoId(porto.id);
                      setOpenEdit(true);
                    }}
                  >
                    <EditIcon size={24} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {!isLoading && (
        <PaginacaoByTotal
          total={data?.total ? Math.ceil(data.total / 10) : 1}
          activePage={activePage}
          setPage={setPage}
        />
      )}
      <PortoDetails
        open={open}
        setOpen={setOpen}
        porto_id={porto_id}
        mutate={mutate}
      />
      <DialogEditarPorto
        open={openEdit}
        setOpen={setOpenEdit}
        porto_id={porto_id}
        mutate={mutate}
        nome={data?.portos?.find((porto) => porto.id === porto_id)?.nome}
        pais={data?.portos?.find((porto) => porto.id === porto_id)?.pais?.id}
      />
    </>
  );
}
