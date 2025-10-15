export interface Field {
  id?: string;
  name: string;
  description: string;
  type:
    | 'text'
    | 'boolean'
    | 'markdown'
    | 'media'
    | 'datetime'
    | 'number'
    | 'color'
    | 'textList';
  required: boolean;
  appId: string;
  useAsTitle: boolean;
  showInList: boolean;
  order: number;
}

export interface Model {
  id?: string;
  name: string;
  description: string;
  appId?: string;
  previewUrl?: string;
  site?: string;
  fields?: Field[];
  createdAt?: Date;
  updatedAt?: Date;
}
