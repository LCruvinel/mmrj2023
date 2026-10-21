"use client";

import React, { Suspense, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import fetcher from "@/lib/fetch";
import Loader from "@/components/loader";
import useSWR from "swr";
import PaginacaoByTotal from "@/components/sharedpaginationbytotal";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

type PessoasAndTotal = {
  pessoas: Pessoa[];
  total: number;
};

function TabelaPessoasContent() {
  const router = useRouter();
  const [activePage, setPage] = useState(1);
  const [searchText, setSearchText] = useState<string>("");
  const { data, error, isLoading } = useSWR<PessoasAndTotal>(
    `/api/pessoa/read/bynamepagination?nome=${searchText}&page=${activePage}`,
    fetcher
  );

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <Loader classProp="w-24 h-24 self-center flex" />;

  return (
    <div className="flex flex-col p-2 mt-2 border-2 bg-white shadow-sm gap-2 rounded-xl dark:bg-slate-700">
      <div className="flex flex-col-reverse justify-between md:flex-row gap-4">
        <Input
          name="search"
          placeholder="Pesquisar por nome..."
          onChange={(e) => setSearchText(e.target.value)}
          value={searchText}
          className="rounded-xl"
        />
      </div>
      <div className="flex flex-col gap-4">
        <Table className="bg-white dark:bg-slate-700">
          <TableHeader className="p-2 border-t-0 bg-gradient-to-r from-blue-200 to-blue-400 dark:from-slate-700 dark:to-slate-950">
            <TableRow className="rounded-ss-xl">
              <TableHead className="w-96">Nome</TableHead>
              <TableHead className="hidden md:table-cell">Título</TableHead>
              <TableHead>País</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.pessoas?.map((pessoa) => (
              <TableRow
                className="cursor-pointer hover:bg-blue-100"
                key={pessoa.id}
                onClick={(e) => router.push(`/dados/pessoas/${pessoa.id}`)}
              >
                <TableCell className="font-medium">{pessoa.nome}</TableCell>
                <TableCell className="font-medium hidden md:table-cell">
                  {pessoa?.titulo_nobreza?.titulo}
                </TableCell>
                <TableCell className="font-medium">
                  {pessoa.pais?.nome}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <PaginacaoByTotal
          total={data?.total ? Math.ceil(data.total / 10) : 1}
          activePage={activePage}
          setPage={setPage}
        />
      </div>
    </div>
  );
}

export default function TabelaPessoas() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TabelaPessoasContent />
    </Suspense>
  );
}
