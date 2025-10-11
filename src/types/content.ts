// Content types for Firebase storage
export interface ContentItem {
  id?: string;
  modelId: string; // Reference to the model
  data: Record<string, string | boolean | string[] | number | undefined>; // Dynamic data based on model fields
  createdAt?: Date;
  updatedAt?: Date;
}
