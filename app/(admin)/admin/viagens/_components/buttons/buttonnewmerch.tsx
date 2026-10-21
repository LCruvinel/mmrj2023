import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Plus } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const formSchema = z.object({
  cosignatario: z.number().nullable(),
  mercadoria: z.number().nullable(),
  unidade_de_medida: z.number().nullable(),
  quantidade: z.string(),
});

import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import fetcher from "@/lib/fetch";
import useSWR from "swr";
import Loader from "@/components/loader";

export default function ButtonNewMerch(props: {
  mutate: () => void;
  viagem_id: number | undefined;
}) {
  const { viagem_id, mutate } = props;
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectCosignatario, setSelectCosignatario] = useState(false);
  const [searchCosignatario, setSearchCosignatario] = useState("");
  const [selectMercadoria, setSelectMercadoria] = useState(false);
  const [selectUnidadeMedida, setSelectUnidadeMedida] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cosignatario: null,
      mercadoria: null,
      unidade_de_medida: null,
      quantidade: "",
    },
  });

  const { data: cosignatarios } = useSWR<Pessoa[]>(
    searchCosignatario && "/api/pessoa/read/byname?nome=" + searchCosignatario,
    fetcher,
  );

  const { data: mercadorias } = useSWR<Mercadoria[]>(
    viagem_id ? "/api/mercadoria/read" : null,
    fetcher,
  );

  const { data: unidades_medida } = useSWR<UnidadeDeMedida[]>(
    viagem_id ? "/api/unidade_de_medida/read" : null,
    fetcher,
  );

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    setSubmitting(true);
    const result = await fetch("/api/viagem/create/mercadoria", {
      method: "POST",
      body: JSON.stringify({
        ...values,
        viagem_id,
      }),
    });

    if (result.ok) {
      mutate();
      toast({
        className: "bg-green-200",
        title: "Sucesso",
        duration: 5000,
        description: "Mercadoria adicionada com sucesso",
      });
      form.reset();
      setOpen(false);
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        duration: 5000,
        description: "Erro ao adicionadar mercadoria",
      });
    }
    setSubmitting(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-2 mb-2 bg-blue-400 rounded-lg  float-end">
          Adicionar Mercadoria <Plus size={24} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-blue-500">
            Adicionar Mercadoria
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="flex flex-col gap-2"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="cosignatario"
              render={({ field }) => (
                <FormItem className="flex flex-col basis-full md:basis-1/2">
                  <FormLabel>Cosignatário</FormLabel>
                  <Popover
                    modal
                    open={selectCosignatario}
                    onOpenChange={setSelectCosignatario}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value
                            ? cosignatarios?.find(
                                (pessoa) => pessoa.id === field.value,
                              )?.nome
                            : "Seleccionar Cosignatário"}
                          <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height]">
                      <Command>
                        <CommandInput
                          onValueChange={(value) => {
                            setSearchCosignatario(value);
                          }}
                          placeholder="Procurar cosignatário..."
                        />
                        {field.value ? (
                          <CommandEmpty> Pessoa não encontrada</CommandEmpty>
                        ) : null}{" "}
                        <CommandGroup>
                          <CommandList>
                            {cosignatarios?.map((pessoa) => (
                              <CommandItem
                                value={pessoa.nome}
                                key={pessoa.id}
                                onSelect={() => {
                                  form.setValue("cosignatario", pessoa.id);
                                  setSelectCosignatario(false);
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

            {/* MERCADORIAS */}

            <FormField
              control={form.control}
              name="mercadoria"
              render={({ field }) => (
                <FormItem className="flex flex-col basis-full md:basis-1/2">
                  <FormLabel>Mercadoria</FormLabel>
                  <Popover
                    modal
                    open={selectMercadoria}
                    onOpenChange={setSelectMercadoria}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value
                            ? mercadorias?.find(
                                (mercadoria) => mercadoria.id === field.value,
                              )?.nome
                            : "Seleccionar Mercadoria"}
                          <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height]">
                      <Command>
                        <CommandInput placeholder="Procurar mercadoria..." />
                        {field.value ? (
                          <CommandEmpty>Mercadoria não encontrada</CommandEmpty>
                        ) : null}{" "}
                        <CommandGroup>
                          <CommandList>
                            {mercadorias?.map((mercadoria) => (
                              <CommandItem
                                value={mercadoria.nome}
                                key={mercadoria.id}
                                onSelect={() => {
                                  form.setValue("mercadoria", mercadoria.id);
                                  setSelectMercadoria(false);
                                }}
                              >
                                {mercadoria.nome}
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

            {/* UNIDADES DE MEDIDA */}

            <FormField
              control={form.control}
              name="unidade_de_medida"
              render={({ field }) => (
                <FormItem className="flex flex-col basis-full md:basis-1/2">
                  <FormLabel>Unidade de Medida</FormLabel>
                  <Popover
                    modal
                    open={selectUnidadeMedida}
                    onOpenChange={setSelectUnidadeMedida}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value
                            ? unidades_medida?.find(
                                (unidade) => unidade.id === field.value,
                              )?.unidade_medida
                            : "Seleccionar Unidade de Medida"}
                          <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height]">
                      <Command>
                        <CommandInput placeholder="Procurar unidade de medida..." />
                        {field.value ? (
                          <CommandEmpty>Unidade não encontrada</CommandEmpty>
                        ) : null}{" "}
                        <CommandGroup>
                          <CommandList>
                            {unidades_medida?.map((unidade) => (
                              <CommandItem
                                value={unidade.unidade_medida}
                                key={unidade.id}
                                onSelect={() => {
                                  form.setValue(
                                    "unidade_de_medida",
                                    unidade.id,
                                  );
                                  setSelectUnidadeMedida(false);
                                }}
                              >
                                {unidade.unidade_medida}
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

            {/* QUANTIDADE */}

            <FormField
              control={form.control}
              name="quantidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade</FormLabel>
                  <Input
                    type="number"
                    placeholder="Ex: 10"
                    className="w-full"
                    {...field}
                  />
                </FormItem>
              )}
            />

            <Button
              disabled={submitting}
              className="self-end mt-2 bg-blue-500 rounded-2xl hover:bg-blue-600 w-fit"
            >
              {submitting ? (
                <>
                  <Loader classProp="w-4 h-4 mr-2" /> A adicionar...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
