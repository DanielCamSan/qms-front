import {
  ResponseLogin,
  ResponseForgotPass,
  ResponseRefresh,
} from "@/lib/definitions";
import { fetchWithAuth } from "./utils";
import { handleUnauthorized } from "@/lib/server-auth-helpers";
import { User } from "./model-definitions/user";
import { CreateProjectDto, UpdateProjectDto } from "./model-definitions/project";
import { CreateModuleDto, Module } from "./model-definitions/module";
import { CreateFeatureDto, Feature } from "./model-definitions/feature";

const apiUrl: string = process.env.NEXT_PUBLIC_API_URL ?? "";
// AUTH
export async function fetchLogin(
  email: string,
  password: string
): Promise<ResponseLogin> {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const raw = JSON.stringify({ email, password });
    console.log("fetchLogin > ", email, password);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };

    return await fetch(`${apiUrl}/auth/login`, requestOptions).then((res) => {
      if (!res.ok) {
        throw res;
      }
      return res.json();
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw error;
  }
}
export async function fetchLoginGoogle(data: {
  email: string;
  name: string;
  key: string;
  provider?: string;
}): Promise<ResponseLogin | void> {
  data.provider = "google";
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(data),
    };
    return await fetch(`${apiUrl}/auth/login-google`, requestOptions).then(
      (res) => {
        if (!res.ok) {
          throw res;
        }
        return res.json();
      }
    );
  } catch (error) {
    console.error("Database Error:", error);
    throw error;
  }
}
export async function fetchSignup(
  email: string,
  password: string
): Promise<ResponseLogin | void> {
  try {
    const rawName = email.split("@")[0].split(/[._]/)[0];
    const cleanName = rawName.replace(/\d+/g, "");
    const formattedName =
      cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const raw = JSON.stringify({ email, password, name: formattedName });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };

    const res = await fetch(`${apiUrl}/auth/register`, requestOptions).then(
      (res) => {
        if (!res.ok) {
          throw res;
        }
        res.json();
      }
    );
    return res;
  } catch (error) {
    console.error("Database Error:", error);
    throw error;
  }
}
export async function fetchRefreshToken(
  refreshToken: string,
  email: string
): Promise<ResponseRefresh | void> {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const raw = JSON.stringify({ email, refreshToken });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };

    return await fetch(`${apiUrl}/auth/refresh`, requestOptions).then((res) => {
      if (!res.ok) {
        throw res;
      }
      return res.json();
    });
  } catch (error) {
    if (error instanceof Response) {
      const errorBody = await error.json();
      console.log("error on refresh token >> ", errorBody);
    }
    throw error;
  }
}
export async function fetchForgotPassword(
  email: string
): Promise<ResponseForgotPass | void> {
  try {
    const raw = JSON.stringify({ email });
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };
    return await fetch(`${apiUrl}/auth/forgot-password`, requestOptions).then(
      (res) => {
        if (!res.ok) {
          throw res;
        }
        res.json();
      }
    );
  } catch (error) {
    console.error("Database Error:", error);
    throw error;
  }
}
export async function fetchResetPassword({
  token,
  password,
}: {
  token: string;
  password: string;
}): Promise<ResponseForgotPass> {
  try {
    const raw = JSON.stringify({ token, newPassword: password });
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };
    return await fetch(`${apiUrl}/auth/reset-password`, requestOptions).then(
      (res) => {
        if (!res.ok) {
          throw res;
        }
        return res.json();
      }
    );
  } catch (error) {
    console.error("Database Error:", error);
    throw error;
  }
}

// ---------- PROTEGIDOS ----------
// AUTH
export async function fetchLogout(token: string): Promise<void> {
  try {
    await fetchWithAuth(
      `${apiUrl}/auth/logout`,
      {
        method: "POST",
      },
      token
    ).then((res) => {
      if (!res.ok) throw res;
      return res.json();
    });
  } catch (error) {
    console.error("Database Error:", error);
    await handleUnauthorized(error);
    throw error;
  }
}
export async function fetchGetUserProfile(token: string): Promise<User> {
  try {
    return await fetchWithAuth(
      `${apiUrl}/auth/me`,
      {
        method: "GET",
      },
      token
    ).then((res) => {
      if (!res.ok) throw res;
      return res.json();
    });
  } catch (error) {
    console.error("Database Error:", error);
    await handleUnauthorized(error);
    throw error;
  }
}
export async function fetchChangePassword({
  token,
  currentPassword,
  newPassword,
}: {
  token: string;
  currentPassword: string;
  newPassword: string;
}): Promise<ResponseForgotPass> {
  try {
    const raw = JSON.stringify({ currentPassword, newPassword });
    return await fetchWithAuth(
      `${apiUrl}/auth/change-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: raw,
      },
      token
    ).then((res) => {
      if (!res.ok) throw res;
      return res.json();
    });
  } catch (error) {
    console.error("Database Error:", error);
    throw error;
  }
}
// USERS & ADMIN
export async function fetchGetUsers(token: string): Promise<User[]> {
  try {
    const res = await fetchWithAuth(
      `${apiUrl}/users/me/profile`,
      { method: "GET" },
      token
    );
    if (!res.ok) throw res;
    return (await res.json()) as User[];
  } catch (error) {
    console.error("Database Error:", error);
    await handleUnauthorized(error);
    throw error;
  }
}

export async function fetchDeleteUser({
  token,
  userId,
}: {
  token: string;
  userId: string;
}) {
  try {
    const res = await fetchWithAuth(
      `${apiUrl}/users/${userId}`,
      { method: "DELETE" },
      token
    );
    if (!res.ok) throw res;
    return res.json();
  } catch (error) {
    console.error("Database Error:", error);
    await handleUnauthorized(error);
    throw error;
  }
}

//PROJECTS
export async function fetchProjectsMine(
  token: string,
  params?: { page?: number; limit?: number; sort?: string; q?: string }
){
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.sort) query.set("sort", params.sort); // ej: -updatedAt
  if (params?.q) query.set("q", params.q);

  try {
    const res = await fetchWithAuth(
      `${apiUrl}/projects/mine?${query.toString()}`,
      { method: "GET" },
      token
    );
    if (!res.ok) throw res;
    return (await res.json()) ;
  } catch (error) {
    await handleUnauthorized(error);
    throw error;
  }
}

export async function fetchProjectById(
  token: string,
  id: string
) {
  try {
    const res = await fetchWithAuth(
      `${apiUrl}/projects/${id}`,
      { method: "GET" },
      token
    );
    if (!res.ok) throw res;
    return (await res.json());
  } catch (error) {
    await handleUnauthorized(error);
    throw error;
  }
}

export async function fetchCreateProject(
  token: string,
  dto: CreateProjectDto
){
  try {
    const res = await fetchWithAuth(
      `${apiUrl}/projects`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      },
      token
    );
    if (!res.ok) throw res;
    return (await res.json());
  } catch (error) {
    await handleUnauthorized(error);
    throw error;
  }
}

export async function fetchUpdateProject(
  token: string,
  id: string,
  dto: UpdateProjectDto
) {
  try {
    const res = await fetchWithAuth(
      `${apiUrl}/projects/${id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      },
      token
    );
    if (!res.ok) throw res;
    return (await res.json());
  } catch (error) {
    await handleUnauthorized(error);
    throw error;
  }
}

export async function fetchDeleteProject(
  token: string,
  id: string
): Promise<{ ok: boolean; deletedId?: string }> {
  try {
    const res = await fetchWithAuth(
      `${apiUrl}/projects/${id}`,
      { method: "DELETE" },
      token
    );
    if (!res.ok) throw res;
    return await res.json();
  } catch (error) {
    await handleUnauthorized(error);
    throw error;
  }
}


//MODULES

export async function fetchCreateModule(
  token: string,
  projectId: string,
  dto: CreateModuleDto
): Promise<Module> {
  try {
    const res = await fetchWithAuth(
      `${apiUrl}/projects/${projectId}/modules`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      },
      token
    );
    if (!res.ok) throw res;
    return await res.json();
  } catch (error) {
    await handleUnauthorized(error);
    throw error;
  }
}

export async function fetchProjectModules(
  token: string,
  projectId: string,
  params?: { parent?: string | null; page?: number; limit?: number; sort?: string; q?: string }
) {
  const query = new URLSearchParams();
  if (params?.parent === null) query.set("parent", "null");
  else if (typeof params?.parent === "string") query.set("parent", params.parent);

  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.sort) query.set("sort", params.sort);
  if (params?.q) query.set("q", params.q);

  try {
    const res = await fetchWithAuth(
      `${apiUrl}/projects/${projectId}/modules?${query.toString()}`,
      { method: "GET" },
      token
    );
    if (!res.ok) throw res;
    return await res.json(); // { items, total, page, limit } según tu back
  } catch (error) {
    await handleUnauthorized(error);
    throw error;
  }
}

export async function fetchModuleById(token: string, moduleId: string) {
  try {
    const res = await fetchWithAuth(`${apiUrl}/modules/${moduleId}`, { method: "GET" }, token);
    if (!res.ok) throw res;
    return await res.json();
  } catch (error) {
    await handleUnauthorized(error);
    throw error;
  }
}


// FEATURES

export async function fetchFeatureById(token: string, featureId: string) {
  try {
    const res = await fetchWithAuth(`${apiUrl}/features/${featureId}`, { method: "GET" }, token);
    if (!res.ok) throw res;
    return await res.json();
  } catch (error) {
    await handleUnauthorized(error);
    throw error;
  }
}

// (Opcional) GET /features/:featureId/versions — si quieres pedirlas aparte
export async function fetchFeatureVersions(token: string, featureId: string) {
  try {
    const res = await fetchWithAuth(`${apiUrl}/features/${featureId}/versions`, { method: "GET" }, token);
    if (!res.ok) throw res;
    return await res.json();
  } catch (error) {
    await handleUnauthorized(error);
    throw error;
  }
}


export async function fetchCreateFeature(
  token: string,
  moduleId: string,
  dto: CreateFeatureDto
): Promise<Feature> {
  try {
    const res = await fetchWithAuth(
      `${apiUrl}/modules/${moduleId}/features`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      },
      token
    );
    if (!res.ok) throw res;
    return await res.json();
  } catch (error) {
    await handleUnauthorized(error);
    throw error;
  }
}