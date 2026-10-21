'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import useSWR from 'swr';
import fetcher from '@/lib/fetch';
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronsUpDown, LucideCalendar } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import dayjs from 'dayjs';
import Loader from '@/components/loader';
import { useToast } from '@/components/ui/use-toast';
import { ptBR } from 'date-fns/locale';

var customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const formSchema = z.object({
  pessoa: z.string().min(1, { message: 'Selecione uma pessoa' }),
  data_inicio: z.string({ required_error: 'Selecione uma data de início' }),
  data_fim: z.string({ required_error: 'Selecione uma data de fim' }),
  pais: z.string().min(1, { message: 'Selecione um país' }),
});

type AddOwnerProps = {
  mutate: () => void;
  embarcacaoId: number | undefined;
};

export default function AddOwner({ mutate, embarcacaoId }: AddOwnerProps) {
  // const { mutate, embarcacaoId } = props;
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const [selectPessoa, setSelectPessoa] = useState(false);
  const [selectPais, setSelectPais] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchName, setSearchName] = useState('');
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pessoa: '',
      data_inicio: '',
      data_fim: '',
      pais: '',
    },
  });

  const { data: pessoas, isLoading } = useSWR<Pessoa[]>(
    '/api/pessoa/read/byname?nome=' + searchName,
    fetcher
  );

  const { data: pais, isLoading: isLoadingPais } = useSWR<Pais[]>(
    '/api/pais/read',
    fetcher
  );

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    setSubmitting(true);

    const data = {
      embarcacao: embarcacaoId,
      ...values,
    };

    const result = await fetch('/api/embarcacao/create/addowner', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (result.ok) {
      setOpen(false);
      form.reset();
      mutate();
      toast({
        className: 'bg-green-200',
        title: 'Sucesso',
        duration: 5000,
        description: 'Proprietário adicionado com sucesso',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro',
        duration: 5000,
        description: 'Erro ao adicionar proprietário',
      });
    }
    setSubmitting(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='bg-blue-500 rounded-xl'>
          Adicionar Proprietário
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='text-blue-500'>
            Adicionar Proprietário
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='flex flex-col gap-2'
          >
            <FormField
              control={form.control}
              name='pessoa'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Pessoa</FormLabel>
                  <Popover
                    modal
                    open={selectPessoa}
                    onOpenChange={setSelectPessoa}
                  >
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
                            ? pessoas?.find(
                                (pessoa) => pessoa.id.toString() === field.value
                              )?.nome
                            : 'Seleccionar Pessoa'}
                          <ChevronsUpDown className='w-4 h-4 ml-2 opacity-50 shrink-0' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height]'>
                      <Command>
                        <CommandInput
                          onValueChange={(value) => {
                            setSearchName(value);
                          }}
                          placeholder='Procurar pessoa...'
                        />
                        <CommandEmpty>Pessoa não encontrada</CommandEmpty>
                        <CommandGroup>
                          <CommandList>
                            {pessoas?.map((pessoa) => (
                              <CommandItem
                                value={pessoa.nome}
                                key={pessoa.id}
                                onSelect={() => {
                                  form.setValue('pessoa', pessoa.id.toString());
                                  setSelectPessoa(false);
                                }}
                              >
                                {pessoa.nome}
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
              name='data_inicio'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Data Início</FormLabel>
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
                          <LucideCalendar className='w-4 h-4' />
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
                              'data_inicio',
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
              name='data_fim'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Data Fim</FormLabel>
                  <div className='flex w-full gap-2'>
                    <Input
                      disabled={!form.getValues('data_inicio')}
                      placeholder='DD-MM-YYYY'
                      value={field.value}
                      onChange={(e) => {
                        //if date is after data_inicio
                        if (
                          dayjs(e.target.value, 'DD-MM-YYYY').isBefore(
                            dayjs(form.getValues('data_inicio'), 'DD-MM-YYYY')
                          )
                        ) {
                          form.setValue('data_fim', e.target.value);
                        } else {
                          toast({
                            variant: 'destructive',
                            title: 'Erro',
                            description:
                              'Data de fim deve ser após a data de início',
                          });
                        }
                        field.onChange(e.target.value);
                      }}
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          size='icon'
                          className='bg-blue-500 hover:bg-blue-600'
                          disabled={!form.watch('data_inicio')}
                        >
                          <LucideCalendar className='w-4 h-4 ' />
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
                            if (
                              dayjs(date).isAfter(
                                dayjs(form.watch('data_inicio'), 'DD-MM-YYYY')
                              )
                            ) {
                              form.setValue(
                                'data_fim',
                                dayjs(date).format('DD-MM-YYYY')
                              );
                            } else {
                              toast({
                                variant: 'destructive',
                                title: 'Erro',
                                description:
                                  'Data de fim deve ser após a data de início',
                              });
                            }
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
            {/* Selecionar País */}
            <FormField
              control={form.control}
              name='pais'
              render={({ field }) => (
                <FormItem className='flex flex-col basis-full md:basis-1/2'>
                  <FormLabel>País</FormLabel>
                  <Popover modal open={selectPais} onOpenChange={setSelectPais}>
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
                            ? pais?.find(
                                (pais) => pais.id.toString() === field.value
                              )?.nome
                            : 'Seleccionar País'}
                          <ChevronsUpDown className='w-4 h-4 ml-2 opacity-50 shrink-0' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height]'>
                      <Command>
                        <CommandInput placeholder='Procurar país...' />
                        <CommandEmpty>País não encontrado</CommandEmpty>
                        <CommandGroup>
                          <CommandList>
                            {pais?.map((pais) => (
                              <CommandItem
                                value={pais.nome}
                                key={pais.id}
                                onSelect={() => {
                                  form.setValue('pais', pais.id.toString());
                                  setSelectPais(false);
                                }}
                              >
                                {pais.nome}
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

            <Button
              type='submit'
              className='self-end mt-2 bg-blue-500 rounded-2xl hover:bg-blue-600 w-fit'
              disabled={submitting}
            >
              Adicionar Proprietário{' '}
              {submitting && <Loader classProp='ml-2 w-6 h-6' />}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
