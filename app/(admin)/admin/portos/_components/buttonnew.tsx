import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ChevronsUpDown, Plus } from "lucide-react";
import Loader from "@/components/loader";
import { useToast } from "@/components/ui/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import fetcher from "@/lib/fetch";
import useSWR from "swr";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  nome: z.string().min(1, { message: "Nome muito curto" }),
  id_pais: z.number().nullable(),
});

export default function BotaoNovoPorto(props: { mutate: () => void }) {
  const { mutate } = props;
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectPais, setSelectPais] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      id_pais: null,
    },
  });

  const { data: paises } = useSWR<Pais[]>("/api/pais/read", fetcher);

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    setSubmitting(true);
    const result = await fetch("/api/porto/create", {
      method: "POST",
      body: JSON.stringify(values),
    });

    if (result.ok) {
      setOpen(false);
      form.reset();
      mutate();
      toast({
        className: "bg-green-200",
        title: "Sucesso",
        duration: 5000,
        description: "Porto criada com sucesso",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        duration: 5000,
        description: "Erro ao criar porto",
      });
    }
    setSubmitting(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="self-end w-full transition-all duration-500 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl md:w-fit hover:scale-105 hover:bg-gradient-to-l hover:from-blue-400 hover:to-blue-600 ">
          Novo Porto
          <Plus className="ml-2" size={24} />
        </Button>
      </DialogTrigger>
      <DialogContent className=" w-11/12 p-6 rounded-lg max-h-[95%] overflow-y-scroll">
        <DialogHeader>
          <DialogTitle className="text-blue-500">Novo Porto</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-2"
          >
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Porto</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Escreva aqui o nome do porto"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="id_pais"
              render={({ field }) => (
                <FormItem className="flex flex-col basis-full md:basis-1/2">
                  <FormLabel>País</FormLabel>
                  <Popover modal open={selectPais} onOpenChange={setSelectPais}>
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
                            ? paises?.find((pais) => pais.id === field.value)
                                ?.nome
                            : "Seleccionar País"}
                          <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height]">
                      <Command>
                        <CommandInput placeholder="Procurar país..." />
                        {field.value ? (
                          <CommandEmpty>País não encontrado</CommandEmpty>
                        ) : null}{" "}
                        <CommandGroup>
                          <CommandList>
                            {paises?.map((pais) => (
                              <CommandItem
                                value={pais.nome}
                                key={pais.id}
                                onSelect={() => {
                                  form.setValue("id_pais", pais.id);
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
              type="submit"
              className="self-end mt-2 bg-blue-500 rounded-2xl hover:bg-blue-600 w-fit"
              disabled={submitting}
            >
              Criar {submitting && <Loader classProp="ml-2 w-6 h-6" />}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
