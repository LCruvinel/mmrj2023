import { invalidateUserSessions, validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import sendEmailNotification from "@/lib/sendemail";
import { hash } from "bcryptjs";

export async function PUT(req: Request) {
  const { id } = await req.json();
  const { user } = await validateRequest();

  if (!user || user.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }

  function generatePass() {
    let pass = "";
    let str =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "abcdefghijklmnopqrstuvwxyz0123456789@#$";

    for (let i = 1; i <= 16; i++) {
      let char = Math.floor(Math.random() * str.length + 1);

      pass += str.charAt(char);
    }

    return pass;
  }

  const password = generatePass();

  const passwordHash = await hash(password, 10);

  await invalidateUserSessions(id);

  const result = await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      password_hash: passwordHash,
    },
    select: {
      username: true,
    },
  });
  await sendEmailNotification(
    result.username,
    "Um Administrador resetou a sua senha.",
    `${password}`,
  );

  return new Response("Senha resetada com sucesso.", {
    status: 201,
    statusText: "Senha resetada com sucesso.",
  });
}
