import { cookies } from 'next/headers';
import { cache } from 'react';
import prisma from './lib/prisma';
import { randomBytes } from 'crypto';

const SESSION_COOKIE_NAME = 'auth_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export interface AuthUser {
  id: number;
  email: string;
  role: 'EDITOR' | 'ADMIN';
  nome: string;
}

export interface AuthSession {
  id: string;
  userId: number;
  expiresAt: Date;
  fresh: boolean;
}

function getSessionCookieAttributes(expires: Date) {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    expires,
  };
}

export function createBlankSessionCookie() {
  return {
    name: SESSION_COOKIE_NAME,
    value: '',
    attributes: getSessionCookieAttributes(new Date(0)),
  };
}

export function createSessionCookie(sessionId: string, expiresAt: Date) {
  return {
    name: SESSION_COOKIE_NAME,
    value: sessionId,
    attributes: getSessionCookieAttributes(expiresAt),
  };
}

export async function createAuthSession(userId: number): Promise<AuthSession> {
  const sessionToken = randomBytes(24).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  const session = await prisma.session.create({
    data: {
      token: sessionToken,
      user_id: userId,
      expires_at: expiresAt,
    },
  });

  return {
    id: session.token,
    userId: session.user_id,
    expiresAt: session.expires_at,
    fresh: true,
  };
}

export async function invalidateSession(sessionToken: string) {
  await prisma.session.deleteMany({ where: { token: sessionToken } });
}

export async function invalidateUserSessions(userId: number) {
  await prisma.session.deleteMany({ where: { user_id: userId } });
}

export const validateRequest = cache(
  async (): Promise<
    { user: AuthUser; session: AuthSession } | { user: null; session: null }
  > => {
    const sessionId = (await cookies()).get(SESSION_COOKIE_NAME)?.value ?? null;
    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }

    const foundSession = await prisma.session.findFirst({
      where: { token: sessionId },
      include: { user: true },
    });

    if (!foundSession) {
      try {
        const sessionCookie = createBlankSessionCookie();
        (await cookies()).set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      } catch {}

      return { user: null, session: null };
    }

    if (foundSession.expires_at.getTime() <= Date.now()) {
      await invalidateSession(foundSession.token);
      try {
        const sessionCookie = createBlankSessionCookie();
        (await cookies()).set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      } catch {}

      return { user: null, session: null };
    }

    const refreshThresholdMs = 1000 * 60 * 60 * 24;
    const shouldRefresh =
      foundSession.expires_at.getTime() - Date.now() < refreshThresholdMs;

    let session: AuthSession = {
      id: foundSession.token,
      userId: foundSession.user_id,
      expiresAt: foundSession.expires_at,
      fresh: false,
    };

    if (shouldRefresh) {
      const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
      const updated = await prisma.session.update({
        where: { token: foundSession.token },
        data: { expires_at: expiresAt },
      });
      session = {
        id: updated.token,
        userId: updated.user_id,
        expiresAt: updated.expires_at,
        fresh: true,
      };
    }

    const user: AuthUser = {
      id: foundSession.user.id,
      email: foundSession.user.username,
      role: foundSession.user.role.toUpperCase() as 'EDITOR' | 'ADMIN',
      nome: foundSession.user.username,
    };

    // next.js can throw when setting cookies during some render paths
    try {
      if (session.fresh) {
        const sessionCookie = createSessionCookie(session.id, session.expiresAt);
        (await cookies()).set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
    } catch {}

    return { user, session };
  }
);
