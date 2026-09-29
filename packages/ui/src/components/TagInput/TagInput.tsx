import { forwardRef, Fragment, useId, useRef, useState } from 'react';
import type {
  ClipboardEvent,
  FocusEvent,
  InputHTMLAttributes,
  KeyboardEvent,
  MouseEventHandler,
  ReactNode,
} from 'react';

import { mergeProps, useFocusRing } from 'react-aria';

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
  'defaultValue' | 'disabled' | 'onChange' | 'readOnly' | 'size' | 'value'
> {
  /** Controlled tag values. */
  value?: string[];
  /** Initial tag values for an uncontrolled input. */
  defaultValue?: string[];
  /** Called with the complete tag list whenever it changes. */
  onChange?: (value: string[]) => void;
  /** Called when a tag is removed. */
  onRemove?: (value: string) => void;
  /** Called when the field is clicked, excluding tag and clear buttons. */
  onControlClick?: MouseEventHandler<HTMLDivElement>;
  /** Icon displayed at the end of the field. */
  rightIcon?: ReactNode;
  /** Controlled text currently being entered. */
  searchValue?: string;
  /** Initial search text for an uncontrolled input. */
  defaultSearchValue?: string;
  /** Called whenever the search text changes. */
  onSearchChange?: (value: string) => void;
  /** Maximum number of tags. */
  maxTags?: number;
  /** Called when a value cannot be added because maxTags was reached. */
  onMaxTags?: (value: string) => void;
  /** Allows the same value to be added more than once. */
  allowDuplicates?: boolean;
  /** Custom duplicate check. */
  isDuplicate?: (value: string, currentValues: string[]) => boolean;
  /** Called when a duplicate value is submitted. */
  onDuplicate?: (value: string) => void;
  /** Characters that create and split tags. Defaults to comma. */
  splitChars?: string[];
  /** Adds unfinished text when focus leaves the input. */
  acceptValueOnBlur?: boolean;
  /** Shows a clear button when tags are present. */
  clearable?: boolean;
  /** Called after all tags are cleared. */
  onClear?: () => void;
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
  /** Class applied to the outer component wrapper. */
  wrapperClassName?: string;
  /** Class applied to each default Tag. */
  tagClassName?: string;
  /** Divider used to serialize values into the hidden form input. */
  hiddenInputValuesDivider?: string;
}

function splitTags(value: string, splitChars: string[]): string[] {
  if (splitChars.length === 0) {
    return [value.trim()].filter(Boolean);
  }

  const escapedChars = splitChars.map(char =>
    char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  return value
    .split(new RegExp(escapedChars.join('|'), 'g'))
    .map(tag => tag.trim())
    .filter(Boolean);
}

function defaultIsDuplicate(value: string, currentValues: string[]) {
  const normalized = value.trim().toLocaleLowerCase();
  return currentValues.some(
    current => current.trim().toLocaleLowerCase() === normalized
  );
}

function appendTag(
  currentValues: string[],
  rawValue: string,
  rules: {
    allowDuplicates: boolean;
    isDuplicate: NonNullable<TagInputProps['isDuplicate']>;
    maxTags: number;
    onDuplicate?: TagInputProps['onDuplicate'];
    onMaxTags?: TagInputProps['onMaxTags'];
  }
) {
  const value = rawValue.trim();
  if (!value) return { values: currentValues, result: 'empty' as const };

  if (rules.isDuplicate(value, currentValues)) {
    rules.onDuplicate?.(value);
    if (!rules.allowDuplicates) {
      return { values: currentValues, result: 'duplicate' as const };
    }
  }

  if (currentValues.length >= rules.maxTags) {
    rules.onMaxTags?.(value);
    return { values: currentValues, result: 'max' as const };
  }

  return { values: [...currentValues, value], result: 'added' as const };
}

export const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
  function TagInput(
    {
      value,
      defaultValue = [],
      onChange,
      onRemove,
      onControlClick,
      rightIcon,
      searchValue,
      defaultSearchValue = '',
      onSearchChange,
      maxTags = Infinity,
      onMaxTags,
      allowDuplicates = false,
      isDuplicate = defaultIsDuplicate,
      onDuplicate,
      splitChars = [','],
      acceptValueOnBlur = true,
      clearable = false,
      onClear,
      renderTag,
      label,
      description,
      errorMessage,
      isValid = true,
      isDisabled = false,
      readOnly = false,
      size = 'lg',
      className,
      wrapperClassName,
      tagClassName,
      hiddenInputValuesDivider = ',',
      id,
      name,
      form,
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
    const [uncontrolledSearch, setUncontrolledSearch] =
      useState(defaultSearchValue);
    const [isHovered, setIsHovered] = useState(false);
    const { focusProps, isFocusVisible } = useFocusRing();

    const tags = value ?? uncontrolledValue;
    const search = searchValue ?? uncontrolledSearch;
    const rules = {
      allowDuplicates,
      isDuplicate,
      maxTags,
      onDuplicate,
      onMaxTags,
    };

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

    const updateSearch = (nextValue: string) => {
      if (searchValue === undefined) {
        setUncontrolledSearch(nextValue);
      }
      onSearchChange?.(nextValue);
    };

    const addOne = (rawValue: string) => {
      const { values, result } = appendTag(tags, rawValue, rules);
      if (values !== tags) updateTags(values);
      return result;
    };

    const addMany = (newTags: string[]) => {
      const nextValue = newTags.reduce(
        (values, rawValue) => appendTag(values, rawValue, rules).values,
        tags
      );
      if (nextValue !== tags) updateTags(nextValue);
    };

    const submitSearch = () => {
      const result = addOne(search);
      if (result === 'added' || result === 'duplicate' || result === 'empty') {
        updateSearch('');
      }
    };

    const removeTag = (index: number) => {
      if (isDisabled || readOnly) return;
      const removedTag = tags[index];
      updateTags(tags.filter((_, tagIndex) => tagIndex !== index));
      onRemove?.(removedTag);
      inputRef.current?.focus();
    };

    const clearTags = () => {
      if (isDisabled || readOnly) return;
      updateTags([]);
      updateSearch('');
      onClear?.();
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

      if (splitChars.includes(event.key) && search.trim()) {
        event.preventDefault();
        addMany(splitTags(search, splitChars));
        updateSearch('');
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
        splitTags(
          `${search}${event.clipboardData.getData('text/plain')}`,
          splitChars
        )
      );
      updateSearch('');
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      if (acceptValueOnBlur && !isDisabled && !readOnly && search.trim()) {
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
      <div className={wrapperClassName}>
        {label && <InputLabel htmlFor={inputId}>{label}</InputLabel>}

        <div className="ui:relative">
          <div
            className={cn(
              controlClasses,
              'ui:flex ui:flex-wrap ui:items-center ui:gap-1.5',
              rightIcon && 'ui:pr-12',
              className
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
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
                      className={tagClassName}
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
              form={form}
              required={required && tags.length === 0}
              autoComplete={inputProps.autoComplete ?? 'off'}
              aria-label={label ? ariaLabel : (ariaLabel ?? 'Tags')}
              aria-labelledby={ariaLabelledBy}
              aria-describedby={describedBy}
              aria-invalid={!isValid || undefined}
              className="ui:min-w-[8rem] ui:flex-1 ui:border-0 ui:bg-transparent ui:p-0 ui:text-inherit ui:outline-none ui:placeholder:text-grey-600 ui:disabled:cursor-not-allowed ui:dark:placeholder:text-grey-400"
              onChange={event => {
                updateSearch(event.currentTarget.value);
              }}
              {...mergeProps(focusProps, { onFocus, onBlur: handleBlur })}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
            />

            {clearable && tags.length > 0 && !isDisabled && !readOnly && (
              <button
                type="button"
                aria-label="Clear tags"
                className="ui:inline-flex ui:h-6 ui:w-6 ui:shrink-0 ui:cursor-pointer ui:items-center ui:justify-center ui:rounded-xs ui:border-0 ui:bg-transparent ui:p-0 ui:text-lg ui:text-grey-600 ui:hover:bg-grey-300 ui:focus-visible:ring-2 ui:focus-visible:ring-navy-600 ui:focus-visible:outline-none ui:dark:text-grey-400 ui:dark:hover:bg-grey-700 ui:dark:focus-visible:ring-sky-500"
                onMouseDown={event => event.preventDefault()}
                onClick={clearTags}
              >
                <span aria-hidden="true">×</span>
              </button>
            )}
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

        {name && (
          <input
            type="hidden"
            name={name}
            form={form}
            value={tags.join(hiddenInputValuesDivider)}
          />
        )}
      </div>
    );
  }
);

TagInput.displayName = 'TagInput';
