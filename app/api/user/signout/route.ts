import { createBlankSessionCookie, invalidateSession, validateRequest } from "@/auth";
import { cookies } from "next/headers";

export async function GET() {
  const { session } = await validateRequest();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  await invalidateSession(session.id);

  const sessionCookie = createBlankSessionCookie();
  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  return new Response("OK", {
    status: 200,
    statusText: "OK",
  });
}
