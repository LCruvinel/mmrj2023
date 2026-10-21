import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import sendEmailNotification from "@/lib/sendemail";
import isEmail from "validator/es/lib/isEmail";
import { validateRequest } from "@/auth";

export async function POST(req: Request) {
  const { user } = await validateRequest();

  if (!user || user.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }

  const { useremail, role } = await req.json();
  const email = useremail.toLowerCase();

  if (!isEmail(email)) {
    return new Response("Email Inválido", {
      status: 400,
      statusText: "Email Inválido",
    });
  }

  const existe = await prisma.user.findFirst({
    where: {
      username: {
        equals: email,
        mode: "insensitive",
      },
    },
  });

  if (existe) {
    return new Response("Email já existe", {
      status: 409,
      statusText: "Email já existe",
    });
  }
  /* Function to generate combination of password */
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

  await prisma.user.create({
    data: {
      username: email,
      password_hash: passwordHash,
      role: role.toLowerCase(),
    },
  });
  await sendEmailNotification(email, "Sua senha temporária", `${password}`);

  return new Response("Usuário criado com sucesso.", {
    status: 201,
    statusText: "Usuário criado com sucesso",
  });
}
