import { forwardRef, Fragment, useId, useRef, useState } from 'react';
import type {
  ClipboardEvent,
  FocusEvent,
  InputHTMLAttributes,
  KeyboardEvent,
  MouseEventHandler,
  ReactNode,
} from 'react';

import { mergeProps, useFocusRing, useHover } from 'react-aria';

import { cn } from '../../utils/cn';
import { InputDescription } from '../Input/InputDescription';
import { InputError } from '../Input/InputError';
import { InputLabel } from '../Input/InputLabel';
import { inputVariants } from '../Input/InputVariant';
import { Tag } from '../Tag';

export interface TagInputRenderTagInput {
  value: string;
  onRemove: () => void;
  isDisabled: boolean;
}

export interface TagInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  | 'defaultValue'
  | 'disabled'
  | 'form'
  | 'name'
  | 'onChange'
  | 'readOnly'
  | 'size'
  | 'value'
> {
  /** Controlled tag values. */
  value?: string[];
  /** Initial tag values for an uncontrolled input. */
  defaultValue?: string[];
  /** Called with the complete tag list whenever it changes. */
  onChange?: (value: string[]) => void;
  /** Called when the field is clicked, excluding tag buttons. */
  onControlClick?: MouseEventHandler<HTMLDivElement>;
  /** Icon displayed at the end of the field. */
  rightIcon?: ReactNode;
  /** Custom tag renderer. */
  renderTag?: (input: TagInputRenderTagInput) => ReactNode;
  /** Label above the input. */
  label?: ReactNode;
  /** Supporting text below the input. */
  description?: ReactNode;
  /** Error text shown when isValid is false. */
  errorMessage?: ReactNode;
  /** Controls invalid styling and error visibility. */
  isValid?: boolean;
  /** Disables the input and all tag actions. */
  isDisabled?: boolean;
  /** Prevents changes while keeping the input focusable. */
  readOnly?: boolean;
  /** Input and tag size. */
  size?: 'sm' | 'md' | 'lg';
  /** Class applied to the field control. */
  className?: string;
}

function splitTags(value: string): string[] {
  return value
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean);
}

function defaultIsDuplicate(value: string, currentValues: string[]) {
  const normalized = value.trim().toLocaleLowerCase();
  return currentValues.some(
    current => current.trim().toLocaleLowerCase() === normalized
  );
}

function appendTag(currentValues: string[], rawValue: string) {
  const value = rawValue.trim();
  return value && !defaultIsDuplicate(value, currentValues)
    ? [...currentValues, value]
    : currentValues;
}

export const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
  function TagInput(
    {
      value,
      defaultValue = [],
      onChange,
      onControlClick,
      rightIcon,
      renderTag,
      label,
      description,
      errorMessage,
      isValid = true,
      isDisabled = false,
      readOnly = false,
      size = 'lg',
      className,
      id,
      placeholder,
      required,
      onFocus,
      onBlur,
      onKeyDown,
      onPaste,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      ...inputProps
    },
    forwardedRef
  ) {
    const generatedId = useId();
    const inputId = id ?? `tag-input-${generatedId}`;
    const descriptionId = `${inputId}-description`;
    const errorId = `${inputId}-error`;
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [uncontrolledValue, setUncontrolledValue] =
      useState<string[]>(defaultValue);
    const [search, setSearch] = useState('');
    const { focusProps, isFocusVisible } = useFocusRing();
    const { hoverProps, isHovered } = useHover({ isDisabled });

    const tags = value ?? uncontrolledValue;

    const setInputRef = (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    const updateTags = (nextValue: string[]) => {
      if (value === undefined) {
        setUncontrolledValue(nextValue);
      }
      onChange?.(nextValue);
    };

    const addMany = (newTags: string[]) => {
      const nextValue = newTags.reduce(
        (values, rawValue) => appendTag(values, rawValue),
        tags
      );
      if (nextValue !== tags) updateTags(nextValue);
    };

    const submitSearch = () => {
      addMany([search]);
      setSearch('');
    };

    const removeTag = (index: number) => {
      if (isDisabled || readOnly) return;
      updateTags(tags.filter((_, tagIndex) => tagIndex !== index));
      inputRef.current?.focus();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);
      if (
        event.defaultPrevented ||
        event.nativeEvent.isComposing ||
        isDisabled ||
        readOnly
      ) {
        return;
      }

      if (event.key === 'Enter' && search.trim()) {
        event.preventDefault();
        submitSearch();
        return;
      }

      if (event.key === ',' && search.trim()) {
        event.preventDefault();
        addMany(splitTags(search));
        setSearch('');
        return;
      }

      if (event.key === 'Backspace' && !search && tags.length > 0) {
        removeTag(tags.length - 1);
      }
    };

    const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
      onPaste?.(event);
      if (event.defaultPrevented || isDisabled || readOnly) return;

      event.preventDefault();
      addMany(
        splitTags(`${search}${event.clipboardData.getData('text/plain')}`)
      );
      setSearch('');
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      if (!isDisabled && !readOnly && search.trim()) {
        submitSearch();
      }
      onBlur?.(event);
    };

    const generatedDescribedBy = [
      description ? descriptionId : null,
      !isValid && errorMessage ? errorId : null,
    ]
      .filter(Boolean)
      .join(' ');
    const describedBy = ariaDescribedBy ?? (generatedDescribedBy || undefined);

    const controlClasses = inputVariants({
      isDisabled,
      isFocusVisible,
      isHovered,
      isValid,
      size,
      align: 'left',
    });

    return (
      <div>
        {label && <InputLabel htmlFor={inputId}>{label}</InputLabel>}

        <div className="ui:relative">
          <div
            {...hoverProps}
            className={cn(
              controlClasses,
              'ui:flex ui:flex-wrap ui:items-center ui:gap-1.5',
              rightIcon && 'ui:pr-12',
              className
            )}
            onClick={event => {
              inputRef.current?.focus();
              if (!(event.target as Element).closest('button')) {
                onControlClick?.(event);
              }
            }}
          >
            {tags.map((tag, index) => {
              const handleRemove = () => removeTag(index);
              return (
                <Fragment key={`${tag}-${index}`}>
                  {renderTag ? (
                    renderTag({
                      value: tag,
                      onRemove: handleRemove,
                      isDisabled: isDisabled || readOnly,
                    })
                  ) : (
                    <Tag
                      size={size}
                      isDisabled={isDisabled || readOnly}
                      onRemove={handleRemove}
                    >
                      {tag}
                    </Tag>
                  )}
                </Fragment>
              );
            })}

            <input
              {...inputProps}
              ref={setInputRef}
              id={inputId}
              value={search}
              placeholder={placeholder}
              disabled={isDisabled}
              readOnly={readOnly}
              required={required && tags.length === 0}
              autoComplete={inputProps.autoComplete ?? 'off'}
              aria-label={ariaLabel ?? (label ? undefined : 'Tags')}
              aria-labelledby={ariaLabelledBy}
              aria-describedby={describedBy}
              aria-invalid={!isValid || undefined}
              className="ui:min-w-[8rem] ui:flex-1 ui:border-0 ui:bg-transparent ui:p-0 ui:text-inherit ui:outline-none ui:placeholder:text-grey-600 ui:disabled:cursor-not-allowed ui:dark:placeholder:text-grey-400"
              onChange={event => {
                setSearch(event.currentTarget.value);
              }}
              {...mergeProps(focusProps, { onFocus, onBlur: handleBlur })}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
            />
          </div>
          {rightIcon && (
            <div className="ui:pointer-events-none ui:absolute ui:top-0 ui:right-0 ui:flex ui:h-full ui:items-start">
              <div className="ui:flex ui:h-full ui:py-3">
                <div className="ui:h-full ui:w-px ui:bg-grey-600" />
              </div>
              <div
                className={cn(
                  'ui:flex ui:items-center ui:px-2 ui:pt-2',
                  size === 'sm'
                    ? 'ui:h-6'
                    : size === 'md'
                      ? 'ui:h-8'
                      : 'ui:h-10'
                )}
              >
                {rightIcon}
              </div>
            </div>
          )}
        </div>

        {description && (
          <InputDescription id={descriptionId}>{description}</InputDescription>
        )}
        {!isValid && errorMessage && (
          <InputError id={errorId}>{errorMessage}</InputError>
        )}
      </div>
    );
  }
);

TagInput.displayName = 'TagInput';
