'use server';

import { deleteSession } from '@/lib/session';
import { redirect } from 'next/navigation';

type HttpLikeError = {
  status?: number;
  statusCode?: number;
  code?: string;
};

function toHttpError(e: unknown): HttpLikeError {
  if (typeof e === 'object' && e !== null) {
    const obj = e as Record<string, unknown>;
    return {
      status: typeof obj.status === 'number' ? obj.status : undefined,
      statusCode: typeof obj.statusCode === 'number' ? obj.statusCode : undefined,
      code: typeof obj.code === 'string' ? obj.code : undefined,
    };
  }
  return {};
}

export async function handleUnauthorized(error: unknown) {
  const http = toHttpError(error);
  const status = http.status ?? http.statusCode;
  if (status === 401) {
    await deleteSession();
    redirect('/login');
  }
}