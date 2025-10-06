import { ISODateString } from "../definitions";

export type Module = {
  id: string;
  projectId: string;
  parentModuleId: string | null;
  name: string;
  description: string | null;
  isRoot: boolean;
  sortOrder: number;
  path: string | null;
  depth: number | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  lastModifiedById: string | null;
  publishedVersionId: string | null;
};
