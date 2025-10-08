import type { Field } from '@/types/model';
import { CheckSquare, FileText, Hash, Image } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function getFieldTypeIcon(type: Field['type']): LucideIcon {
  return (
    {
      text: FileText,
      boolean: CheckSquare,
      markdown: Hash,
      media: Image,
    }[type] || FileText
  );
}
