'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { fetchUpdateCurrentUser } from '@/lib/data';
import { handleUnauthorized } from '@/lib/server-auth-helpers';
import { getSession } from '@/lib/session';
import { RoutesEnum } from '@/lib/utils';

export type GeneralFormState = {
  message?: string;
  success?: boolean;
};

export async function updateGeneralPreferencesAction(
  prevState: GeneralFormState,
  formData: FormData
): Promise<GeneralFormState> {
  const session = await getSession();
  if (!session?.token) redirect(RoutesEnum.LOGIN);

  const rawDarkMode = formData.get('darkMode');
  const darkMode =
    rawDarkMode === 'on' ||
    rawDarkMode === 'true' ||
    rawDarkMode === '1';

  try {
    await fetchUpdateCurrentUser(session.token, {
      preferences: { darkMode },
    });
  } catch (error) {
    await handleUnauthorized(error);
    return {
      success: false,
      message: 'error',
    };
  }

  revalidatePath('/app/settings/general');
  revalidatePath('/app');

  return {
    success: true,
    message: 'preferencesSaved',
  };
}
