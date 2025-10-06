import { FeaturePriority, FeatureStatus, ISODateString } from "../definitions";

export type Feature = {
  id: string;
  moduleId: string;
  name: string;
  description: string | null;
  priority: FeaturePriority | null; // por tu esquema, default MEDIUM pero nullable en versiones
  status: FeatureStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  lastModifiedById: string | null;
  publishedVersionId: string | null;
};