import { ISODateString, ProjectStatus, Visibility } from "../definitions";

export type Project = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  status: ProjectStatus;
  repositoryUrl: string | null;
  visibility: Visibility;
  deadline: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  ownerId: string;
};

// DTOs (alineados a tu back)
export type CreateProjectDto = {
  name: string;
  description?: string | null;
  status?: ProjectStatus;
  visibility?: Visibility;
  repositoryUrl?: string | null;
};

export type UpdateProjectDto = Partial<CreateProjectDto>;
