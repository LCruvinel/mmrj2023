import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { createAuthSession, createSessionCookie } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (username.length < 1 || username.length > 100) {
    return new Response("Password ou usuário errados", {
      status: 401,
      statusText: "Password ou usuário errados",
    });
  }

  if (
    typeof password !== "string" ||
    password.length < 1 ||
    password.length > 255
  ) {
    return new Response("Password ou usuário errados", {
      status: 401,
      statusText: "Password ou usuário errados",
    });
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
  });

  if (!existingUser) {
    return new Response("Password ou usuário errados", {
      status: 401,
      statusText: "Password ou usuário errados",
    });
  }

  const validPassword = await compare(password, existingUser.password_hash);
  if (!validPassword) {
    return new Response("Password ou usuário errados", {
      status: 401,
      statusText: "Password ou usuário errados",
    });
  }

  if (!existingUser.active) {
    return new Response("Password ou usuário errados", {
      status: 401,
      statusText: "Password ou usuário errados",
    });
  }

  const session = await createAuthSession(existingUser.id);
  const sessionCookie = createSessionCookie(session.id, session.expiresAt);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return new Response("OK", {
    status: 200,
    statusText: "OK",
  });
}
