export interface Field {
  id?: string;
  name: string;
  description: string;
  type: 'text' | 'boolean' | 'markdown' | 'media';
  required: boolean;
  order: number;
}

export interface Model {
  id?: string;
  name: string;
  description: string;
  fields?: Field[];
  createdAt?: Date;
  updatedAt?: Date;
}
