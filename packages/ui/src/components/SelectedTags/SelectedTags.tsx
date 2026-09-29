import { type Key, type ReactNode } from 'react';

import { cn } from '../../utils/cn';
import { Tag } from '../Tag';

export interface SelectedTagItem {
  key: Key;
  rendered: ReactNode;
}

interface SelectedTagsProps {
  items: readonly SelectedTagItem[];
  isDisabled?: boolean;
  onRemove?: (key: Key) => void;
  className?: string;
}

export function SelectedTags({
  items,
  isDisabled = false,
  onRemove,
  className,
}: SelectedTagsProps) {
  return (
    <div
      className={cn(
        'ui:flex ui:min-w-0 ui:flex-1 ui:flex-nowrap ui:items-center ui:gap-1.5 ui:overflow-x-auto',
        className
      )}
    >
      {items.map(item => (
        <Tag
          key={item.key}
          isDisabled={isDisabled}
          onRemove={onRemove ? () => onRemove(item.key) : undefined}
        >
          {item.rendered}
        </Tag>
      ))}
    </div>
  );
}
