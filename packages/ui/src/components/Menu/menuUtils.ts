import { cn } from '../../utils/cn';
import { MenuItemDefinition, MenuItemRenderProps } from './Menu';

export const defaultPopoverClassName =
  'ui:min-w-64 ui:max-w-[calc(100vw-2rem)] ui:rounded-xs ui:border ui:border-grey-300 ui:bg-white ui:p-2 ui:text-grey-900 ui:shadow-lg ui:outline-none ui:dark:border-grey-700 ui:dark:bg-grey-900 ui:dark:text-grey-100';

export function resolveContent(
  content: MenuItemDefinition['content'],
  renderProps: MenuItemRenderProps
) {
  return typeof content === 'function' ? content(renderProps) : content;
}

export function resolveTextValue(item: MenuItemDefinition) {
  if (item.textValue !== undefined) return item.textValue;
  if (typeof item.content === 'string') return item.content;

  throw new Error(
    `Menu item "${String(item.id)}" must provide textValue when content is not a string.`
  );
}

export function resolveItemClassName(
  item: MenuItemDefinition,
  renderProps: MenuItemRenderProps
) {
  const className =
    typeof item.className === 'function'
      ? item.className(renderProps)
      : item.className;

  return cn(
    'ui:flex ui:min-h-12 ui:cursor-pointer ui:items-center ui:gap-3 ui:rounded-xs ui:px-3 ui:py-2 ui:transition-colors ui:outline-none',
    renderProps.isFocused && 'ui:bg-grey-200 ui:dark:bg-grey-800',
    renderProps.isDisabled && 'ui:opacity-50',
    className
  );
}
