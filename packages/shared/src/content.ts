export type ContentValue = string | boolean | string[] | number | undefined;

export interface ContentItem {
  id?: string;
  modelId: string;
  data: Record<string, ContentValue>;
  createdAt?: Date;
  updatedAt?: Date;
}
