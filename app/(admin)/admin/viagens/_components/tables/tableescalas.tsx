import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState } from 'react';
import MercadoriaEscalasDrawer from '../mercadoriaescaladrawer';
import { XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Loader from '@/components/loader';
import Paginacao from '@/components/sharedpagination';
import chunk from '@/lib/chunk';

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

export default function TableEscalas(props: {
  escalas: Escala[] | undefined;
  mutate: () => void;
}) {
  const [activePage, setPage] = useState(1);
  const { escalas, mutate } = props;
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [relacmercadoriaescala, setRelacMercadoriaEscala] = useState<
    RelacMercadoriaEscala[] | undefined
  >();
  const [escala_id, setEscalaId] = useState<number | undefined>();

  const chunked = chunk(escalas ?? [], 5);
  const escalasdata = chunked[activePage - 1];

  async function handleDeleteEscala(id: number) {
    setDeleting(true);
    await fetch(`/api/escala/delete`, {
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
            <TableHead>Porto</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {escalasdata?.map((escala) => (
            <HoverCard key={escala.id}>
              <HoverCardTrigger asChild>
                <TableRow
                  className='cursor-pointer hover:bg-blue-100'
                  onClick={(e) => {
                    setRelacMercadoriaEscala(escala.relac_mercadoria_escala);
                    setEscalaId(escala.id);
                    setOpen(true);
                  }}
                >
                  <TableCell className='text-xs font-medium '>
                    {escala.porto?.nome || 'N/A'}
                  </TableCell>
                  <TableCell className='w-4'>
                    <Button
                      variant='link'
                      size='icon'
                      className='rounded-full'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEscala(escala.id);
                      }}
                    >
                      <XIcon className='w-4 text-red-600' />
                    </Button>
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
