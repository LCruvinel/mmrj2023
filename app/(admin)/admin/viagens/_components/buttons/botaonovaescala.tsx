import { Button } from '@/components/ui/button';
import { CalendarIcon, ChevronsUpDownIcon, Plus } from 'lucide-react';
import { useState } from 'react';
import Loader from '@/components/loader';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import dayjs from 'dayjs';
import { Calendar } from '@/components/ui/calendar';
import useSWR from 'swr';
import fetcher from '@/lib/fetch';
import { cn } from '@/lib/utils';
import { ptBR } from 'date-fns/locale';

const formSchema = z.object({
  data: z.string().min(1, { message: 'Nome muito curto' }),
  ano: z.string().min(4, { message: 'Insira o ano' }).max(4, 'Insira o ano'),
  dias_porto: z.number().gte(1, { message: 'Quantos dias esteve no porto?' }),
  porto_id: z.number().min(1, { message: 'Tem de selecionar um porto.' }),
  entrada_de_passageiros: z
    .number()
    .gte(0, { message: 'Tem de ser igual o maior que 0.' }),
  saida_de_passageiros: z
    .number()
    .gte(0, { message: 'Tem de ser igual o maior que 0.' }),
  observacoes: z.string().optional(),
});

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';

export default function BotaoNovaeEscala(props: {
  mutate: () => void;
  viagem_id: number | undefined;
}) {
  const { viagem_id, mutate } = props;
  const { toast } = useToast();
  const [selectPorto, setSelectPorto] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      data: '',
      ano: '',
      dias_porto: 0,
      porto_id: 0,
      entrada_de_passageiros: 0,
      saida_de_passageiros: 0,
      observacoes: '',
    },
  });

  const { data: portos } = useSWR<Porto[]>(
    viagem_id != undefined && '/api/porto/read/byname?name=' + searchName,
    fetcher
  );

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    setSubmitting(true);
    const result = await fetch('/api/escala/create', {
      method: 'POST',
      body: JSON.stringify({
        ...values,
        viagem_id,
      }),
    });

    if (result.ok) {
      mutate();
      toast({
        className: 'bg-green-200',
        title: 'Sucesso',
        duration: 5000,
        description: 'Escala adicionada com sucesso',
      });
      form.reset();
      setOpen(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro',
        duration: 5000,
        description: 'Erro ao adicionar escala',
      });
    }
    setSubmitting(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='mt-2 mb-2 bg-blue-400 rounded-lg float-end'>
          Adicionar Escala <Plus size={24} />
        </Button>
      </DialogTrigger>
      <DialogContent className=' min-w-[75%] w-11/12 p-6 rounded-lg max-h-[95%] overflow-y-scroll'>
        <DialogHeader>
          <DialogTitle className='text-blue-500'>Adicionar Escala</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className='flex flex-col gap-2'
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name='data'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Data</FormLabel>
                  <div className='flex w-full gap-2'>
                    <Input
                      placeholder='DD-MM-YYYY'
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          size='icon'
                          className='bg-blue-500 hover:bg-blue-600'
                        >
                          <CalendarIcon className='w-4 h-4' />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Calendar
                          fromDate={new Date('01-01-1808')}
                          toDate={new Date('12-31-1830')}
                          locale={ptBR}
                          defaultMonth={
                            dayjs(field.value, 'DD-MM-YYYY').isValid()
                              ? dayjs(field.value, 'DD-MM-YYYY').toDate()
                              : undefined
                          }
                          selected={
                            dayjs(field.value, 'DD-MM-YYYY').isValid()
                              ? dayjs(field.value, 'DD-MM-YYYY').toDate()
                              : undefined
                          }
                          onSelect={(date) => {
                            form.setValue(
                              'data',
                              dayjs(date).format('DD-MM-YYYY')
                            );
                          }}
                          mode='single'
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='ano'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ano</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='2022'
                      maxLength={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='porto_id'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Porto</FormLabel>
                  <Popover open={selectPorto} onOpenChange={setSelectPorto}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          role='combobox'
                          className={cn(
                            'w-full justify-between',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value
                            ? portos?.find((porto) => porto.id === field.value)
                                ?.nome
                            : 'Seleccionar Porto'}
                          <ChevronsUpDownIcon className='w-4 h-4 ml-2 opacity-50 shrink-0' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height]'>
                      <Command>
                        <CommandInput
                          onValueChange={(value) => {
                            setSearchName(value);
                          }}
                          placeholder='Procurar porto...'
                        />
                        <CommandEmpty>Porto não encontrado</CommandEmpty>
                        <CommandGroup>
                          <CommandList>
                            {portos?.map((porto) => (
                              <CommandItem
                                value={porto.nome}
                                key={porto.id}
                                onSelect={() => {
                                  form.setValue('porto_id', porto.id);
                                  setSelectPorto(false);
                                }}
                              >
                                {porto.nome}{' '}
                                {porto.pais?.nome && ' | ' + porto.pais.nome}
                              </CommandItem>
                            ))}
                          </CommandList>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='dias_porto'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dias no Porto</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Ex: 5'
                      {...field}
                      onChange={(event) =>
                        field.onChange(Number(event.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-flow-row grid-cols-2 gap-2 '>
              <FormField
                control={form.control}
                name='entrada_de_passageiros'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entraram</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ex: 100'
                        {...field}
                        onChange={(event) =>
                          field.onChange(Number(event.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='saida_de_passageiros'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saíram</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ex: 100'
                        {...field}
                        onChange={(event) =>
                          field.onChange(Number(event.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='observacoes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Ex: Escala tranquila.'
                      {...field}
                      onChange={(event) => field.onChange(event.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={submitting}
              className='self-end mt-2 bg-blue-500 rounded-2xl hover:bg-blue-600 w-fit'
            >
              {submitting ? (
                <>
                  <Loader classProp='w-4 h-4 mr-2' /> A adicionar...
                </>
              ) : (
                'Guardar'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
