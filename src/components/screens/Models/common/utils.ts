import type { Field } from '@/types/model';
import { Calendar, CheckSquare, FileText, Hash, Image } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function getFieldTypeIcon(type: Field['type']): LucideIcon {
  return (
    {
      text: FileText,
      boolean: CheckSquare,
      markdown: Hash,
      media: Image,
      datetime: Calendar,
      number: Hash,
    }[type] || FileText
  );
}

export function toCamelCase(str: string): string {
  return (
    str
      // Convert to ASCII equivalent for non-ASCII chars (é -> e, ñ -> n, etc.)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
  ); // Remove non-alphanumeric characters
}

export function isValidCamelCase(str: string): boolean {
  return /^[a-z][a-zA-Z0-9]*$/.test(str);
}
