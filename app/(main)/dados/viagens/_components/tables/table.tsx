"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
// import utc from 'dayjs/plugin/utc';
import fetcher from "@/lib/fetch";
import useSWR from "swr";
import { useEffect, useState } from "react";
import Loader from "@/components/loader";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import PaginacaoByTotal from "@/components/sharedpaginationbytotal";

//extend dayjs with utc plugin
dayjs.extend(utc);
dayjs.extend(tz);

type ViagensAndTotal = {
  viagens: Viagem[];
  total: number;
};

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

export default function TripsTable() {
  const [activePage, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [selectedYear, setSelectedYear] = useState("none");
  const [selectedType, setSelectedType] = useState("none");

  const router = useRouter();
  const {
    data: viagensdata,
    isLoading,
    mutate,
  } = useSWR<ViagensAndTotal>(
    `/api/viagem/read/bysearch?search=${searchText}&ano=${selectedYear}&tipo=${selectedType}&page=${activePage}`,
    // : '/api/viagem/read/',
    fetcher
  );

  useEffect(() => {
    setPage(1);
  }, [searchText, selectedYear, selectedType]);

  return (
    <>
      <div className="flex flex-col-reverse justify-between lg:flex-row md:flex-nowrap gap-4 mb-4">
        <Input
          name="search"
          className="rounded-xl "
          placeholder="Pesquisar por nome de embarcação..."
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div className="flex flex-col md:flex-row gap-4 ">
          <Select onValueChange={(e) => setSelectedYear(e)}>
            <SelectTrigger
              aria-label="Ano"
              name="ano"
              className="rounded-xl w-full md:w-1/2 lg:w-[180px]"
            >
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="empty" value="none">
                {"Sem filtro"}
              </SelectItem>

              {Array.from({ length: 23 }, (_, i) => 1808 + i).map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(e) => setSelectedType(e)}>
            <SelectTrigger
              aria-label="Tipo"
              className="rounded-xl w-full md:w-1/2 lg:w-[180px]"
            >
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem key="empty" value="none">
                {"Sem filtro"}
              </SelectItem>
              <SelectItem value="Sahida">Sahida</SelectItem>
              <SelectItem value="Entrada">Entrada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {isLoading ? (
        <div className="flex flex-row justify-center p-4">
          <Loader classProp="w-24 h-24 self-center flex" />
        </div>
      ) : (
        <Table className="bg-white dark:bg-slate-700">
          <TableHeader className="p-2 border-t-0 bg-gradient-to-r from-blue-200 to-blue-400 dark:from-slate-700 dark:to-slate-950">
            <TableRow className="rounded-ss-xl">
              {/* <TableHead className='w-4 hidden md:table-cell'>ID</TableHead> */}
              <TableHead className="w-96">Data Rio</TableHead>
              <TableHead className="w-96">Tipo</TableHead>
              <TableHead>Embarcação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {viagensdata?.viagens?.map((viagem) => (
              <TableRow
                className="cursor-pointer hover:bg-blue-100"
                key={viagem.id}
                onClick={(e) => {
                  router.push(`/dados/viagens/${viagem.id}`);
                }}
              >
                {/* <TableCell className='font-medium hidden md:table-cell'>
                  {viagem.id}
                </TableCell> */}
                <TableCell className="font-medium">
                  {formatStoredDateText(viagem.data_rio)}
                </TableCell>
                <TableCell className="font-medium">
                  {viagem.entrada_saida}
                </TableCell>
                <TableCell className="font-medium">
                  {viagem.embarcacao.nome}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {!isLoading && (
        <PaginacaoByTotal
          total={viagensdata?.total ? Math.ceil(viagensdata.total / 10) : 1}
          activePage={activePage}
          setPage={setPage}
        />
      )}
    </>
  );
}
