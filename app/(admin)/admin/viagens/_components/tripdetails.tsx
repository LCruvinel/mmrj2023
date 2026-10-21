import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import fetcher from '@/lib/fetch';
import { Dispatch, SetStateAction, useState } from 'react';
import useSWR from 'swr';
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
} from '@/components/ui/alert-dialog'; // import AddOwner from './addownerbutton';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import TableEscalas from './tables/tableescalas';
import TableMercadorias from './tables/tablemercadorias';
import Loader from '@/components/loader';
import { Trash } from 'lucide-react';
import BotaoNovaeEscala from './buttons/botaonovaescala';
import TableRefDocumental from './tables/tablerefdoc';
import TableNews from './tables/tablenews';
import TablePassageiros from './tables/tablepassageiros';
import TableArribas from './tables/tablearribas';

function formatStoredDateText(value: unknown) {
  if (value === null || value === undefined) return 'N/A';

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return 'N/A';

    if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
      return trimmed.slice(0, 10);
    }

    return trimmed;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? 'N/A' : value.toISOString().slice(0, 10);
  }

  return String(value);
}

function renderDbDate(value: unknown) {
  return formatStoredDateText(value);
}

export default function TripDetails(props: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  viagem_id: number | undefined;
  mutate: () => void;
}) {
  const { open, setOpen, viagem_id, mutate } = props;
  const [deleting, setDeleting] = useState(false);
  const {
    data: viagem,
    isLoading,
    mutate: mutateViagem,
  } = useSWR<Viagem>(
    viagem_id ? `/api/viagem/read/byid?id=${viagem_id}` : null,
    fetcher
  );

  async function handleDeletePerson(id: number) {
    setDeleting(true);
    const result = await fetch(`/api/pessoa/delete`, {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
    if (result.ok) {
      mutate();
      toast.success('Pessoa removida com sucesso');
      setOpen(false);
    } else {
      toast.error('Erro ao remover pessoa');
    }
    setDeleting(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className=' min-w-[75%] w-11/12 p-6 rounded-lg max-h-[95%] overflow-y-scroll'>
        <DialogHeader>
          <DialogTitle>
            {isLoading ? (
              <div className='flex items-center justify-center'>
                <Loader classProp='w-24 h-24' />
              </div>
            ) : (
              'Viagem #' + viagem_id + ' - ' + viagem?.embarcacao?.nome
            )}
          </DialogTitle>
        </DialogHeader>
        {!isLoading && (
          <>
            <div className='flex flex-col gap-2'>
              <div className='flex flex-wrap gap-2'>
                <div className='flex flex-col border gap-1 rounded-xl grow'>
                  <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                    Data Rio
                  </div>
                  <div className='p-2 text-xs'>
                    {formatStoredDateText(viagem?.data_rio)}
                  </div>
                </div>

                <div className='flex flex-col border gap-1 rounded-xl grow'>
                  <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                    Porto de Origem
                  </div>
                  <div className='p-2 text-xs'>
                    {viagem?.porto_origem?.nome
                      ? viagem?.porto_origem?.nome +
                        ' | ' +
                        viagem?.porto_origem?.pais?.nome
                      : 'N/A'}
                  </div>
                </div>
                <div className='flex flex-col border gap-1 rounded-xl grow'>
                  <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                    Dias no porto de origem
                  </div>
                  <div className='p-2 text-xs'>
                    {viagem?.dias_porto_origem || 'N/A'}
                  </div>
                </div>
              </div>

              <div className='flex flex-wrap gap-2'>
                <div className='flex flex-col border gap-1 rounded-xl grow'>
                  <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                    Data de Chegada
                  </div>
                  <div className='p-2 text-xs'>
                    {renderDbDate(viagem?.data_chegada)}
                  </div>
                </div>

                <div className='flex flex-col border gap-1 rounded-xl grow'>
                  <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                    Porto de Destino
                  </div>
                  <div className='p-2 text-xs'>
                    {viagem?.porto_destino?.nome +
                      ' | ' +
                      viagem?.porto_destino?.pais?.nome}
                  </div>
                </div>
                <div className='flex flex-col border gap-1 rounded-xl grow'>
                  <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                    Dias no porto de destino
                  </div>
                  <div className='p-2 text-xs'>
                    {viagem?.dias_porto_destino || 'N/A'}
                  </div>
                </div>
              </div>

              <div className='flex flex-wrap gap-2'>
                <div className='flex flex-col border gap-1 rounded-xl grow'>
                  <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                    Dias de Viagem
                  </div>
                  <div className='p-2 text-xs'>{viagem?.dias_viagem}</div>
                </div>
                {/* <div className='flex flex-col border gap-1 rounded-xl grow'>
                <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                  Tripulação
                </div>
                <div className='p-2 text-xs'>{viagem?.tripulacao}</div>
              </div> */}
                {/* <div className="flex flex-col border gap-1 rounded-xl grow">
                  <div className="p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl">
                    Passageiros
                  </div>
                  <div className="p-2 text-xs">{viagem?.total_passageiros}</div>
                </div> */}
              </div>
            </div>

            <div className='flex flex-col flex-1 w-full max-w-xs  md:max-w-full gap-2'>
              <Accordion
                type='single'
                collapsible
                className='flex flex-col flex-1 w-full'
              >
                <AccordionItem value='vessel' className='w-full'>
                  <AccordionTrigger>Embarcação</AccordionTrigger>
                  <AccordionContent>
                    <div className='flex flex-row flex-1 gap-2'>
                      <div className='flex flex-col border gap-1 rounded-xl grow'>
                        <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                          Nome
                        </div>
                        <div className='p-2 text-xs'>
                          {viagem?.embarcacao?.nome}
                        </div>
                      </div>
                      <div className='flex flex-col border gap-1 rounded-xl grow'>
                        <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                          Tipo
                        </div>
                        <div className='p-2 text-xs'>
                          {viagem?.embarcacao?.tipo_embarcacao?.tipo}
                        </div>
                      </div>
                    </div>
                    <div className='flex flex-col mt-2 border gap-1 rounded-xl grow'>
                      <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                        Descrição
                      </div>
                      <div className='p-2 text-xs'>
                        {viagem?.embarcacao?.tipo_embarcacao?.texto_descritivo}
                      </div>
                    </div>
                    {viagem?.embarcacao?.tipo_embarcacao?.imagem_embarcacao &&
                      viagem?.embarcacao?.tipo_embarcacao?.imagem_embarcacao
                        .length > 0 && (
                        <div className='flex flex-col p-2 gap-2'>
                          <div className='flex flex-wrap gap-2'>
                            {viagem?.embarcacao?.tipo_embarcacao?.imagem_embarcacao?.map(
                              (img) => (
                                // { X Button in upper right corner of the image}
                                <img
                                  key={img.id}
                                  src={img.imagem}
                                  alt={viagem?.embarcacao?.tipo_embarcacao.tipo}
                                  className='w-full border rounded-lg  max-h-64 md:max-w-96 md:w-auto'
                                />
                              )
                            )}
                          </div>
                        </div>
                      )}
                    <div className='flex flex-col w-full mt-2 border gap-1 rounded-xl'>
                      <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                        Observação
                      </div>
                      <div className='p-2 text-xs'>
                        {viagem?.embarcacao?.observacao}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='crew' className='w-full'>
                  <AccordionTrigger>Tripulação</AccordionTrigger>
                  <AccordionContent>
                    <div className='flex flex-wrap flex-1 gap-2'>
                      <div className='flex flex-col border gap-1 rounded-xl grow'>
                        <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                          Comandante
                        </div>
                        <div className='p-2 text-xs'>
                          {viagem?.comandante?.nome}
                        </div>
                      </div>
                      <div className='flex flex-col border gap-1 rounded-xl grow'>
                        <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                          Capitão
                        </div>
                        <div className='p-2 text-xs'>
                          {viagem?.capitao?.nome}
                        </div>
                      </div>
                      <div className='flex flex-col border gap-1 rounded-xl grow'>
                        <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                          Armador
                        </div>
                        <div className='p-2 text-xs'>
                          {viagem?.armador?.nome}
                        </div>
                      </div>
                      <div className='flex flex-col border gap-1 rounded-xl grow'>
                        <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                          Mestre
                        </div>
                        <div className='p-2 text-xs'>
                          {viagem?.mestre?.nome}
                        </div>
                      </div>
                      <div className='flex flex-col border gap-1 rounded-xl grow'>
                        <div className='p-2 text-sm bg-blue-200 dark:bg-slate-900 rounded-ss-xl rounded-se-xl'>
                          Cosignatário
                        </div>
                        <div className='p-2 text-xs'>
                          {viagem?.consignatario?.nome}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value='passengers' className='w-full'>
                  <AccordionTrigger>Passageiros</AccordionTrigger>
                  <AccordionContent>
                    <TablePassageiros
                      passageiros={viagem?.passageiro}
                      viagem_id={viagem?.id}
                      mutate={mutateViagem}
                    />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value='Escalas' className='w-full'>
                  <AccordionTrigger>Escalas</AccordionTrigger>
                  <AccordionContent>
                    <TableEscalas
                      escalas={viagem?.escala}
                      mutate={mutateViagem}
                    />
                    <BotaoNovaeEscala
                      mutate={mutateViagem}
                      viagem_id={viagem_id}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='arribas' className='w-full'>
                  <AccordionTrigger>Arribas</AccordionTrigger>
                  <AccordionContent>
                    <TableArribas
                      arribas={viagem?.arriba}
                      viagem_id={viagem?.id}
                      mutate={mutateViagem}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value='cargo' className='w-full'>
                  <AccordionTrigger>Mercadoria</AccordionTrigger>
                  <AccordionContent>
                    <TableMercadorias
                      mercadorias={viagem?.relac_mercadoria_viagem}
                      viagem_id={viagem?.id}
                      mutate={mutateViagem}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <AlertDialog>
                <AlertDialogTrigger className='self-end mt-10' asChild>
                  <Button
                    variant='destructive'
                    className='w-full md:self-end md:justify-end md:w-fit'
                  >
                    Remover <Trash className='w-5 h-5 ml-2' />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className='text-red-500'>
                      Tem a certeza?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Esta ação irá remover a
                      pessoa!
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      className='bg-red-500 hover:bg-red-600'
                      disabled={deleting}
                      onClick={() => {
                        if (viagem?.id) handleDeletePerson(viagem?.id);
                      }}
                    >
                      {deleting ? 'Aguarde...' : 'Remover'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </>
        )}
        {/* <AddOwner mutate={mutateEmbarcacao} embarcacaoId={embarcacao_id} /> */}
      </DialogContent>
    </Dialog>
  );
}
