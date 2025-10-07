'use server';
import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import {
  SignupFormSchema,
  LoginFormSchema,
  ResetPassFormSchema,
  ChangePassFormSchema} from '@/lib/validation-schemas';
import {
  FormState,
  SignUpErrorState,
  ResetPassErrorState,
  ChangePassErrorState,
  ProjectStatus,
  Visibility,
  FeaturePriority,
  FeatureStatus,
} from '@/lib/definitions';
import {
  fetchSignup,
  fetchLogout,
  fetchForgotPassword,
  fetchResetPassword,
  fetchChangePassword,
  fetchRefreshToken,
  fetchDeleteUser,
  fetchCreateProject,
  fetchUpdateProject,
  fetchDeleteProject,
  fetchCreateModule,
  fetchCreateFeature,
}from '@/lib/data';
import {
  getSession,
  updateSession,
  deleteSession,
  updateRefreshInfo,
  getRefreshInfo
} from '@/lib/session';
import { RoutesEnum } from '@/lib/utils';
import { CreateProjectDto, UpdateProjectDto } from './model-definitions/project';
import { revalidatePath } from 'next/cache';
import { CreateModuleDto } from './model-definitions/module';
import { CreateFeatureDto } from './model-definitions/feature';

const texts = {
  invalidCredentials: 'Correo o Contraseña incorrectos.',
  somethingWentWrong: 'Algo salió mal. Inténtalo más tarde.',
  emailAlreadyExists: 'El correo ya está registrado.',
  invalidEmail: 'Este correo no esta registrado.',
  wrongCurrentPassword: 'La contraseña actual es incorrecta.'
};

export async function authenticate(
  prevState: { success: boolean; error: string } | undefined,
  formData: FormData
) {
  try {
    const validatedFields = (await LoginFormSchema()).safeParse({
      email: formData.get('email'),
      password: formData.get('password')
    });
    if (!validatedFields.success) {
      return {
        success: false,
        error: ''
      };
    }
    await signIn('credentials', {
      redirect: false,
      ...Object.fromEntries(formData)
    });
    return { success: true, error: '' };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.message === 'Invalid email') {
        return { success: false, error: texts.invalidEmail };
      }
      return { success: false, error: texts.invalidCredentials };
    }
    return { success: false, error: texts.somethingWentWrong };
  }
}
export async function signup(
  state: FormState<SignUpErrorState>,
  formData: FormData
) {
  const validatedFields = (await SignupFormSchema()).safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword')
  });
  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors
    };
  }
  try {
    const { email, password } = validatedFields.data;
    await fetchSignup(email, password);
    formData.delete('confirmPassword');
    await signIn('credentials', {
      redirect: false,
      ...Object.fromEntries(formData)
    });
    return { success: true, errors: {} };
  } catch (error) {
    if (error instanceof Response) {
      const statusCode = error.status;
      const errorBody = await error.json();
      if (statusCode === 400) {
        return {
          success: false,
          errors: {
            email:
              typeof errorBody.message === 'string' &&
                errorBody.message === 'User already exists'
                ? [texts.emailAlreadyExists]
                : ['']
          }
        };
      } else return { success: false, errors: {} };
    }
    return { success: false, errors: {} };
  }
}
export async function recoverPassword(
  state: FormState<SignUpErrorState>,
  formData: FormData
) {
  try {
    const email = formData.get('email') as string;
    await fetchForgotPassword(email);
    return { success: true, error: '' };
  } catch (error) {
    if (error instanceof Response) {
      const statusCode = error.status;
      const errorBody = await error.json();
      if (statusCode === 404 && errorBody.message === 'User not found') {
        return { success: false, error: texts.invalidEmail };
      }
    }
    return { success: false, error: texts.somethingWentWrong };
  }
}
export async function resetPassword(
  state: FormState<ResetPassErrorState>,
  formData: FormData
) {
  try {
    const validatedFields = (await ResetPassFormSchema()).safeParse({
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword')
    });
    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors
      };
    }
    const { password } = validatedFields.data;
    const token = formData.get('token') as string;
    await fetchResetPassword({ token, password });
    return { success: true };
  } catch (error) {
    if (error instanceof Response) {
      const statusCode = error.status;
      const errorBody = await error.json();
      console.error(statusCode, errorBody);
    }
    return { success: false };
  }
}
export async function changePassword(
  state: FormState<ChangePassErrorState>,
  formData: FormData
) {
  const validatedFields = (await ChangePassFormSchema()).safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword')
  });
  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors
    };
  }
  try {
    const { currentPassword, newPassword } = validatedFields.data;
    const session = await getSession();
    if (!session?.token) return { success: false };
    const token = session?.token;
    await fetchChangePassword({ token, currentPassword, newPassword });
    return { success: true };
  } catch (error) {
    if (error instanceof Response) {
      const statusCode = error.status;
      const errorBody = await error.json();
      if (
        statusCode === 401 &&
        errorBody.message === 'Current password is incorrect'
      ) {
        return {
          success: false,
          errors: {
            currentPassword: [texts.wrongCurrentPassword]
          }
        };
      } else return { success: false };
    }
    return { success: false };
  }
}
export async function logout() {
  await deleteSession();
  await signOut({
    redirectTo: RoutesEnum.HOME_LANDING
  });
  try {
    const session = await getSession();
    if (!session?.token) return;
    const token = session?.token;
    await fetchLogout(token);
  } catch (error) {
    console.error('Error during logout:', error);
  }
}
export async function logoutClient() {
  await deleteSession();
  await signOut();
  try {
    const session = await getSession();
    if (!session?.token) return;
    const token = session?.token;
    await fetchLogout(token);
  } catch (error) {
    console.error('Error during logout:', error);
  }
}
export async function refreshTokenAfterConfirmation() {
  try {
    const refreshInfo = await getRefreshInfo();

    if (!refreshInfo?.email || !refreshInfo?.refreshToken) {
      return { success: false, error: 'No session or refresh token found' };
    }
    const response = await fetchRefreshToken(
      refreshInfo.refreshToken,
      refreshInfo.email
    );
    if (!response) {
      return { success: false, error: 'Failed to refresh token' };
    }

    // Update session with new token
    await updateSession({
      token: response.accessToken
    });

    // Update refresh token info
    await updateRefreshInfo({
      refreshToken: response.refreshToken,
      refreshTokenExpirationDate: response.refreshTokenExpirationDate
    });

    return { success: true };
  } catch (error) {
    console.error('Error refreshing token:', error);
    return { success: false, error: 'Failed to refresh token' };
  }
}
export async function deleteUserById(
  userId: string
): Promise<{ success: boolean }> {
  try {
    const session = await getSession();
    if (!session?.token) return { success: false };

    await fetchDeleteUser({
      token: session.token,
      userId
    });

    return { success: true };
  } catch {
    return { success: false };
  }
}

//PROJECTS

export async function createProjectAction(formData: FormData) {
  const session = await getSession();
  if (!session?.token) return { success: false, error: "No session" };

  const dto: CreateProjectDto = {
    name: String(formData.get("name") ?? ""),
    description: (formData.get("description") as string) || null,
    repositoryUrl: (formData.get("repositoryUrl") as string) || null,
    status: (formData.get("status") as  ProjectStatus) ?? "ACTIVE",
    visibility: (formData.get("visibility") as  Visibility) ?? "PRIVATE",
  };

  const created = await fetchCreateProject(session.token, dto);
  revalidatePath("/app/projects");
  return { success: true, id: created.id };
}

export async function updateProjectAction(id: string, formData: FormData) {
  const session = await getSession();
  if (!session?.token) return { success: false, error: "No session" };

  const dto: UpdateProjectDto = {
    name: formData.get("name")?.toString(),
    description: (formData.get("description") as string) ?? undefined,
    repositoryUrl: (formData.get("repositoryUrl") as string) ?? undefined,
    status: formData.get("status") as ProjectStatus ?? undefined,
    visibility: (formData.get("visibility") as  Visibility) ?? undefined,
  };

  await fetchUpdateProject(session.token, id, dto);
  revalidatePath("/app/projects");
  revalidatePath(`/app/projects/${id}`);
  return { success: true };
}

export async function deleteProjectAction(id: string) {
  const session = await getSession();
  if (!session?.token) return { success: false, error: "No session" };
  await fetchDeleteProject(session.token, id);
  revalidatePath("/app/projects");
  return { success: true };
}

//MODULES

export async function createModuleAction(projectId: string, formData: FormData) {
  const session = await getSession();
  if (!session?.token) return { success: false, error: "No session" };

  const name = String(formData.get("name") ?? "").trim();
  const description = (formData.get("description") as string) || null;
  const parent = (formData.get("parentModuleId") as string) || "";
  const parentModuleId = parent ? parent : null;

  if (!name) return { success: false, error: "Name is required" };

  const dto: CreateModuleDto = {
    name,
    description,
    parentModuleId,
    isRoot: parentModuleId === null,
  };

  const created = await fetchCreateModule(session.token, projectId, dto);
  // revalidate listado del proyecto y módulo creado
  revalidatePath(`/app/projects/${projectId}`);
  revalidatePath(`/app/projects/${projectId}/modules/${created.id}`);

  return { success: true, id: created.id };
}

//FEATURES

export async function createFeatureAction(projectId: string, formData: FormData) {
  const session = await getSession();
  if (!session?.token) return { success: false, error: "No session" };

  const name = String(formData.get("name") ?? "").trim();
  const description = (formData.get("description") as string) || null;
  const moduleId = String(formData.get("moduleId") ?? "");
  const priority = (formData.get("priority") as FeaturePriority) || FeaturePriority.MEDIUM;
  const status = (formData.get("status") as FeatureStatus) || FeatureStatus.PENDING;

  if (!name) return { success: false, error: "Name is required" };
  if (!moduleId) return { success: false, error: "Module is required" };

  const dto: CreateFeatureDto = { name, description, priority, status };

  const created = await fetchCreateFeature(session.token, moduleId, dto);

  revalidatePath(`/app/projects/${projectId}`);
  revalidatePath(`/app/projects/${projectId}/modules/${moduleId}`);
  revalidatePath(`/app/projects/${projectId}/features/${created.id}`);

  return { success: true, id: created.id, moduleId };
}