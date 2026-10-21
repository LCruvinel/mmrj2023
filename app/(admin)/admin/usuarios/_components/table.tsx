"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import Loader from "@/components/loader";
import useSWR from "swr";
import fetcher from "@/lib/fetch";
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
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";
import { EditIcon, KeyIcon, LockIcon, UnlockIcon, XIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import Paginacao from "@/components/sharedpagination";
import chunk from "@/lib/chunk";
import BotaoNovoUsuario from "./buttonnew";
import { Badge } from "@/components/ui/badge";
import DialogEditarUsuario from "./edituserdialog";
import { Input } from "@/components/ui/input";
import { useSession } from "@/app/SessionContext";
import BotaoExportarBD from "./buttonexportdb";

export default function TabelaUsuarios() {
  const [activePage, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { user } = useSession();

  const {
    data: usuariosdata,
    isLoading,
    mutate,
  } = useSWR<User[]>(
    searchText
      ? "/api/user/read/byname?search=" + searchText
      : "/api/user/read",
    fetcher,
  );

  const chunked = chunk(usuariosdata ?? [], 10);
  const usuarios = chunked[activePage - 1];

  async function handleDeleteUser(id: string) {
    await fetch(`/api/user/delete`, {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    mutate();
    toast({
      className: "bg-green-200",
      title: "Sucesso",
      duration: 5000,
      description: "Usuário removido com sucesso",
    });
  }

  async function handleBlock(id: string, habilitado: boolean) {
    await fetch(`/api/user/update/block`, {
      method: "PUT",
      body: JSON.stringify({ id, habilitado }),
    });
    mutate();
    if (habilitado) {
      toast({
        className: "bg-green-200",
        title: "Sucesso",
        duration: 5000,
        description: "Usuário desbloqueado com sucesso",
      });
    } else {
      toast({
        className: "bg-green-200",
        title: "Sucesso",
        duration: 5000,
        description: "Usuário bloqueado com sucesso",
      });
    }
  }

  async function resetPassword(id: string) {
    await fetch(`/api/user/update/resetpassword`, {
      method: "PUT",
      body: JSON.stringify({ id }),
    });
    toast({
      className: "bg-green-200",
      title: "Sucesso",
      duration: 5000,
      description: "Senha resetada com sucesso",
    });
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col-reverse justify-between gap-4 md:flex-row">
        <Input
          name="search"
          className="rounded-xl"
          placeholder="Pesquisar por nome ou e-mail..."
          onChange={(e) => setSearchText(e.target.value)}
        />
        <BotaoNovoUsuario mutate={mutate} />
        <BotaoExportarBD />
      </div>

      <Table>
        <TableHeader className="p-2 text-xs border-t-0 bg-gradient-to-r from-blue-200 to-blue-400 dark:from-slate-700 dark:to-slate-950">
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Função</TableHead>
            <TableHead>Habilitado</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios?.map((usuario) => (
            <TableRow
              className="cursor-pointer hover:bg-blue-100"
              key={usuario.id}
            >
              <TableCell className="font-medium">{usuario.nome}</TableCell>
              <TableCell className="font-medium">{usuario.email}</TableCell>
              <TableCell className="font-medium">
                <Badge
                  className={
                    usuario.role === "ADMIN"
                      ? "bg-yellow-600 hover:bg-yellow-600"
                      : "bg-green-400 hover:bg-green-400"
                  }
                >
                  {usuario.role}{" "}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">
                <Badge
                  variant="outline"
                  className={
                    usuario.habilitado
                      ? "border-green-600 hover:border-green-600"
                      : "border-red-400 hover:border-red-400"
                  }
                >
                  {usuario.habilitado ? "Sim" : "Não"}
                </Badge>
              </TableCell>
              {Number(usuario.id) !== user?.id ? (
                <TableCell className="w-4">
                  <div className="flex flex-row gap-2">
                    {/* UPDATE USERS */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="link"
                          onClick={() => {
                            setSelectedUser(usuario);
                            setOpen(true);
                          }}
                        >
                          <EditIcon className="w-6 p-1 text-white bg-blue-500 rounded-lg" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Editar Usuário</TooltipContent>
                    </Tooltip>
                    {/* RESET PASSWORD */}
                    <AlertDialog>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="link"
                              className="text-xs text-blue-500"
                            >
                              <KeyIcon className="w-6 p-1 text-white bg-blue-500 rounded-lg" />
                            </Button>
                          </AlertDialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Resetar Senha</TooltipContent>
                      </Tooltip>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Resetar Senha</AlertDialogTitle>
                          <AlertDialogDescription>
                            Resetar a senha do usuário?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            disabled={isLoading}
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => resetPassword(usuario.id)}
                          >
                            {isLoading ? "Aguarde..." : "Sim"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {/* BLOCK/UNBLOCK USERS */}
                    <AlertDialog>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="link"
                              className="text-xs text-blue-500"
                            >
                              {usuario.habilitado ? (
                                <LockIcon className="w-6 p-1 text-white bg-red-700 rounded-lg" />
                              ) : (
                                <UnlockIcon className="w-6 p-1 text-white bg-green-700 rounded-lg" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                          {usuario.habilitado
                            ? "Bloquear Usuário"
                            : "Desbloquear Usuário"}
                        </TooltipContent>
                      </Tooltip>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {usuario.habilitado
                              ? "Bloquear Usuário"
                              : "Desbloquear Usuário"}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {usuario.habilitado
                              ? "Deseja bloquear o usuário?"
                              : "Deseja desbloquear o usuário?"}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            disabled={isLoading}
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() =>
                              handleBlock(usuario.id, !usuario.habilitado)
                            }
                          >
                            {isLoading ? "Aguarde..." : "Sim"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {/* DELETE USERS */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="link"
                          className="text-xs text-blue-500"
                        >
                          <XIcon className="w-4 text-red-700" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-red-500">
                            Tem a certeza?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Esta ação irá
                            remover o usuário.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            disabled={isLoading}
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => handleDeleteUser(usuario.id)}
                          >
                            {isLoading ? "Aguarde..." : "Remover"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              ) : (
                <TableCell></TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Paginacao chunked={chunked} activePage={activePage} setPage={setPage} />
      <DialogEditarUsuario
        mutate={mutate}
        open={open}
        setOpen={setOpen}
        user_id={selectedUser?.id}
        nome={selectedUser?.nome}
        email={selectedUser?.email}
        role={selectedUser?.role}
      />
    </TooltipProvider>
  );
}
