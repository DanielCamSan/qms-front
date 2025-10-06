import { ISODateString, UserRole } from "../definitions";
import { GithubIdentity } from "./github-identity";

export type User = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  // Opcionalmente puedes incluir username de GitHub si lo devuelves en /users/me/profile
  githubIdentity?: GithubIdentity | null;
  };
  