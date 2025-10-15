import { redirect, notFound } from "next/navigation";
import { handleUnauthorized, UnauthorizedError } from "@/lib/server-auth-helpers";
import { RoutesEnum } from "@/lib/utils";

export async function handlePageError(error: unknown) {
  const res = error instanceof Response ? error : undefined;

  // 🚫 Forbidden
  if (res?.status === 403) {
    redirect(RoutesEnum.ERROR_UNAUTHORIZED);
  }

  // ❌ Not Found
  if (res?.status === 404) {
    notFound();
  }

  // 🔒 Unauthorized or expired token
  try {
    await handleUnauthorized(error);
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      redirect(`/api/auth/logout?next=${encodeURIComponent(RoutesEnum.LOGIN)}`);
    }
    throw e;
  }

  // 🔁 Otros errores → relanzar
  throw error;
}