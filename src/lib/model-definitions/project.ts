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
