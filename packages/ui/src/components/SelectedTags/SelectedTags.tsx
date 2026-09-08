import { Fragment, type Key, type ReactNode } from 'react';

import { cn } from '../../utils/cn';
import { Tag, type TagVariantProps } from '../Tag';

export interface SelectedTagItem {
  key: Key;
  rendered: ReactNode;
}

interface SelectedTagsProps {
  items: readonly SelectedTagItem[];
  isDisabled?: boolean;
  onRemove?: (key: Key) => void;
  className?: string;
  layout?: 'inline' | 'contents';
  size?: TagVariantProps['size'];
  tagClassName?: string;
  renderTag?: (item: SelectedTagItem, onRemove: () => void) => ReactNode;
}

export function SelectedTags({
  items,
  isDisabled = false,
  onRemove,
  className,
  layout = 'inline',
  size = 'md',
  tagClassName,
  renderTag,
}: SelectedTagsProps) {
  return (
    <div
      className={cn(
        layout === 'contents'
          ? 'ui:contents'
          : 'ui:flex ui:min-w-0 ui:flex-1 ui:flex-nowrap ui:items-center ui:gap-1.5 ui:overflow-x-auto',
        className
      )}
    >
      {items.map(item =>
        renderTag ? (
          <Fragment key={item.key}>
            {renderTag(item, () => onRemove?.(item.key))}
          </Fragment>
        ) : (
          <Tag
            key={item.key}
            size={size}
            isDisabled={isDisabled}
            className={tagClassName}
            onRemove={onRemove ? () => onRemove(item.key) : undefined}
          >
            {item.rendered}
          </Tag>
        )
      )}
    </div>
  );
}
