import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import useSWR, { KeyedMutator } from 'swr';
import fetcher from '@/lib/fetch';

import { useEffect, useState } from 'react';
import { ChevronsUpDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import Loader from '@/components/loader';
import { toast } from '@/components/ui/use-toast';

const formSchema = z.object({
  id: z.number(),
  nome: z.string().min(1, { message: 'Nome muito curto' }),
  titulo_nobreza: z
    .string()
    .min(1, { message: 'Selecione um título de Nobreza' }),
  pais: z.string().min(1, { message: 'Selecione um país' }),
});

type PessoasAndTotal = {
  pessoas: Pessoa[];
  total: number;
};

export default function DialogEditPessoa(props: {
  pessoa: Pessoa | undefined;
  mutate: KeyedMutator<PessoasAndTotal>;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { mutate, open, setOpen, pessoa } = props;
  const [selectPais, setSelectPais] = useState(false);
  const [selectNobreza, setSelectNobreza] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: pessoa?.id,
      nome: pessoa?.nome,
      titulo_nobreza: pessoa?.titulo_nobreza?.titulo,
      pais: pessoa?.pais?.nome,
    },
  });

  const { data: pais } = useSWR<Pais[]>(open && '/api/pais/read', fetcher);
  const { data: titulo_nobreza, isLoading } = useSWR<TituloNobreza[]>(
    open && '/api/titulo_nobreza/read',
    fetcher
  );

  useEffect(() => {
    if (open) {
      form.reset({
        id: pessoa?.id,
        nome: pessoa?.nome,
        titulo_nobreza: pessoa?.titulo_nobreza?.id?.toString(),
        pais: pessoa?.pais?.id?.toString(),
      });
    }
  }, [open]);

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    setSubmitting(true);
    const result = await fetch('/api/pessoa/update', {
      method: 'PUT',
      body: JSON.stringify(values),
    });

    if (result.ok) {
      setOpen(false);
      form.reset();
      mutate();
      toast({
        className: 'bg-green-200',
        title: 'Sucesso',
        duration: 5000,
        description: 'Pessoa editada com sucesso',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro',
        duration: 5000,
        description: 'Erro ao editar pessoa',
      });
    }
    setSubmitting(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className=' min-w-[75%] w-11/12 p-6 rounded-lg max-h-[95%] overflow-y-scroll'>
        <DialogHeader>
          <DialogTitle className='text-blue-500'>Criar Pessoa</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='flex flex-col gap-2'
          >
            <FormField
              control={form.control}
              name='nome'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder='Ex: António Palma' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='titulo_nobreza'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Título de Nobreza</FormLabel>
                  <Popover open={selectNobreza} onOpenChange={setSelectNobreza}>
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
                            ? titulo_nobreza?.find(
                                (titulo_nobreza) =>
                                  titulo_nobreza.id.toString() === field.value
                              )?.titulo
                            : 'Seleccionar Título'}
                          <ChevronsUpDown className='w-4 h-4 ml-2 opacity-50 shrink-0' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height]'>
                      <Command>
                        <CommandInput placeholder='Procurar...' />
                        <CommandEmpty>Sem resultados</CommandEmpty>
                        <CommandGroup>
                          <CommandList>
                            {titulo_nobreza?.map((titulo_nobreza) => (
                              <CommandItem
                                value={titulo_nobreza.titulo}
                                key={titulo_nobreza.id}
                                onSelect={() => {
                                  form.setValue(
                                    'titulo_nobreza',
                                    titulo_nobreza.id.toString()
                                  );
                                  setSelectNobreza(false);
                                }}
                              >
                                {titulo_nobreza.titulo}
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
              name='pais'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>País</FormLabel>
                  <Popover open={selectPais} onOpenChange={setSelectPais}>
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
              Editar {submitting && <Loader classProp='ml-2 w-6 h-6' />}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
