export interface Field {
  id?: string;
  name: string;
  description: string;
  type: 'text' | 'boolean' | 'markdown' | 'media' | 'datetime';
  required: boolean;
  appId: string;
  useAsTitle: boolean;
  order: number;
}

export interface Model {
  id?: string;
  name: string;
  description: string;
  appId?: string;
  fields?: Field[];
  createdAt?: Date;
  updatedAt?: Date;
}
