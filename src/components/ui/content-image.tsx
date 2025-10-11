import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

interface ContentImageProps extends ComponentProps<'img'> {
  src: string;
  alt: string;
  height?: number;
}

export function ContentImage({
  className,
  height = 96,
  ...props
}: ContentImageProps) {
  return (
    <div
      className="aspect-[16/9] w-auto min-w-0"
      style={{ height: `${height}px` }}
    >
      <img
        {...props}
        className={cn('w-full h-full object-contain rounded', className)}
      />
    </div>
  );
}
