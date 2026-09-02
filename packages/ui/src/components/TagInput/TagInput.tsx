import { forwardRef, Fragment, useId, useMemo, useRef, useState } from 'react';
import type {
  ClipboardEvent,
  FocusEvent,
  InputHTMLAttributes,
  KeyboardEvent,
  MouseEventHandler,
  ReactNode,
} from 'react';

import { cn } from '../../utils/cn';
import { InputDescription } from '../Input/InputDescription';
import { InputError } from '../Input/InputError';
import { InputLabel } from '../Input/InputLabel';
import { inputVariants } from '../Input/InputVariant';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';
import { Tag } from '../Tag';

export interface TagInputOption {
  value: string;
  label?: string;
  disabled?: boolean;
}

export interface TagInputGroup {
  group: string;
  items: readonly (string | TagInputOption)[];
}

export type TagInputData = readonly (string | TagInputOption | TagInputGroup)[];

export interface TagInputParsedOption {
  value: string;
  label: string;
  disabled: boolean;
  group?: string;
}

export interface TagInputFilterInput {
  options: TagInputParsedOption[];
  search: string;
  limit: number;
}

export interface TagInputRenderTagInput {
  value: string;
  onRemove: () => void;
  isDisabled: boolean;
}

export interface TagInputRenderOptionInput {
  option: TagInputOption;
  isActive: boolean;
}

export interface TagInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'defaultValue' | 'disabled' | 'onChange' | 'readOnly' | 'size' | 'value'
> {
  /** Suggestions displayed below the input. Custom values are still accepted. */
  data?: TagInputData;
  /** Controlled tag values. */
  value?: string[];
  /** Initial tag values for an uncontrolled input. */
  defaultValue?: string[];
  /** Called with the complete tag list whenever it changes. */
  onChange?: (value: string[]) => void;
  /** Called when a tag is removed. */
  onRemove?: (value: string) => void;
  /** Called when the field control is clicked, excluding nested action buttons. */
  onControlClick?: MouseEventHandler<HTMLDivElement>;
  /** Icon displayed after a separator at the end of the field. */
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
  /** Opens suggestions when the text field receives focus. */
  openOnFocus?: boolean;
  /** Maximum number of visible suggestions. */
  limit?: number;
  /** Custom suggestion filter. */
  filter?: (input: TagInputFilterInput) => TagInputParsedOption[];
  /** Custom suggestion renderer. */
  renderOption?: (input: TagInputRenderOptionInput) => ReactNode;
  /** Custom tag renderer. */
  renderTag?: (input: TagInputRenderTagInput) => ReactNode;
  /** Called when a suggestion or custom value is submitted. */
  onOptionSubmit?: (value: string) => void;
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
  /** Displays a loading indicator at the end of the field. */
  loading?: boolean;
  /** Input and tag size. */
  size?: 'sm' | 'md' | 'lg';
  /** Class applied to the field control. */
  className?: string;
  /** Class applied to the outer component wrapper. */
  wrapperClassName?: string;
  /** Class applied to the suggestions dropdown. */
  dropdownClassName?: string;
  /** Class applied to each default Tag. */
  tagClassName?: string;
  /** Divider used to serialize values into the hidden form input. */
  hiddenInputValuesDivider?: string;
}

function parseData(data: TagInputData): TagInputParsedOption[] {
  return data.flatMap(item => {
    if (typeof item === 'string') {
      return [{ value: item, label: item, disabled: false }];
    }

    if ('group' in item) {
      return item.items.map(option => {
        if (typeof option === 'string') {
          return {
            value: option,
            label: option,
            disabled: false,
            group: item.group,
          };
        }

        return {
          value: option.value,
          label: option.label ?? option.value,
          disabled: option.disabled ?? false,
          group: item.group,
        };
      });
    }

    return [
      {
        value: item.value,
        label: item.label ?? item.value,
        disabled: item.disabled ?? false,
      },
    ];
  });
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

export const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
  function TagInput(
    {
      data = [],
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
      openOnFocus = true,
      limit = Infinity,
      filter,
      renderOption,
      renderTag,
      onOptionSubmit,
      label,
      description,
      errorMessage,
      isValid = true,
      isDisabled = false,
      readOnly = false,
      loading = false,
      size = 'lg',
      className,
      wrapperClassName,
      dropdownClassName,
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
    const listboxId = `${inputId}-suggestions`;
    const descriptionId = `${inputId}-description`;
    const errorId = `${inputId}-error`;
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [uncontrolledValue, setUncontrolledValue] =
      useState<string[]>(defaultValue);
    const [uncontrolledSearch, setUncontrolledSearch] =
      useState(defaultSearchValue);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const tags = value ?? uncontrolledValue;
    const search = searchValue ?? uncontrolledSearch;
    const parsedOptions = useMemo(() => parseData(data), [data]);

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
      setActiveIndex(-1);
    };

    const availableOptions = useMemo(() => {
      const unselectedOptions = allowDuplicates
        ? parsedOptions
        : parsedOptions.filter(option => !isDuplicate(option.value, tags));

      const filteredOptions = filter
        ? filter({ options: unselectedOptions, search, limit })
        : unselectedOptions.filter(option =>
            option.label
              .toLocaleLowerCase()
              .includes(search.trim().toLocaleLowerCase())
          );

      return filteredOptions.slice(0, limit);
    }, [
      allowDuplicates,
      filter,
      isDuplicate,
      limit,
      parsedOptions,
      search,
      tags,
    ]);

    const isDropdownVisible = dropdownOpen && availableOptions.length > 0;

    const addOne = (rawValue: string) => {
      const nextTag = rawValue.trim();
      if (!nextTag) return 'empty' as const;

      const duplicate = isDuplicate(nextTag, tags);
      if (duplicate) {
        onDuplicate?.(nextTag);
        if (!allowDuplicates) return 'duplicate' as const;
      }

      if (tags.length >= maxTags) {
        onMaxTags?.(nextTag);
        return 'max' as const;
      }

      updateTags([...tags, nextTag]);
      onOptionSubmit?.(nextTag);
      return 'added' as const;
    };

    const addMany = (newTags: string[]) => {
      const nextValue = [...tags];
      let changed = false;

      newTags.forEach(rawValue => {
        const nextTag = rawValue.trim();
        if (!nextTag) return;

        const duplicate = isDuplicate(nextTag, nextValue);
        if (duplicate) {
          onDuplicate?.(nextTag);
          if (!allowDuplicates) return;
        }

        if (nextValue.length >= maxTags) {
          onMaxTags?.(nextTag);
          return;
        }

        nextValue.push(nextTag);
        onOptionSubmit?.(nextTag);
        changed = true;
      });

      if (changed) updateTags(nextValue);
    };

    const submitSearch = () => {
      const result = addOne(search);
      if (result === 'added' || result === 'duplicate' || result === 'empty') {
        updateSearch('');
      }
    };

    const selectOption = (option: TagInputParsedOption) => {
      if (option.disabled || isDisabled || readOnly) return;
      const result = addOne(option.value);
      if (result !== 'max') updateSearch('');
      inputRef.current?.focus();
      setDropdownOpen(true);
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
      setDropdownOpen(true);
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

      const selectableIndexes = availableOptions.flatMap((option, index) =>
        option.disabled ? [] : [index]
      );

      if (event.key === 'ArrowDown' && selectableIndexes.length > 0) {
        event.preventDefault();
        setDropdownOpen(true);
        setActiveIndex(current => {
          const currentPosition = selectableIndexes.indexOf(current);
          return selectableIndexes[
            (currentPosition + 1) % selectableIndexes.length
          ];
        });
        return;
      }

      if (event.key === 'ArrowUp' && selectableIndexes.length > 0) {
        event.preventDefault();
        setDropdownOpen(true);
        setActiveIndex(current => {
          const currentPosition = selectableIndexes.indexOf(current);
          return currentPosition <= 0
            ? selectableIndexes[selectableIndexes.length - 1]
            : selectableIndexes[currentPosition - 1];
        });
        return;
      }

      if (event.key === 'Escape') {
        setDropdownOpen(false);
        setActiveIndex(-1);
        return;
      }

      if (
        event.key === 'Enter' &&
        isDropdownVisible &&
        activeIndex >= 0 &&
        availableOptions[activeIndex]
      ) {
        event.preventDefault();
        selectOption(availableOptions[activeIndex]);
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

    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (openOnFocus) setDropdownOpen(true);
      onFocus?.(event);
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (acceptValueOnBlur && !isDisabled && !readOnly && search.trim()) {
        submitSearch();
      }
      setDropdownOpen(false);
      setActiveIndex(-1);
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
      isFocusVisible: isFocused,
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
              const target = event.target as Element;
              if (!target.closest?.('button')) onControlClick?.(event);
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
              role="combobox"
              aria-label={label ? ariaLabel : (ariaLabel ?? 'Tags')}
              aria-labelledby={ariaLabelledBy}
              aria-describedby={describedBy}
              aria-invalid={!isValid || undefined}
              aria-expanded={isDropdownVisible}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={
                isDropdownVisible && activeIndex >= 0
                  ? `${listboxId}-option-${activeIndex}`
                  : undefined
              }
              className="ui:min-w-[8rem] ui:flex-1 ui:border-0 ui:bg-transparent ui:p-0 ui:text-inherit ui:outline-none ui:placeholder:text-grey-600 ui:disabled:cursor-not-allowed ui:dark:placeholder:text-grey-400"
              onChange={event => {
                updateSearch(event.currentTarget.value);
                setDropdownOpen(true);
              }}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
            />

            {loading && (
              <LoadingSpinner size="xs" label="Loading suggestions" />
            )}

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

          {isDropdownVisible && (
            <ul
              id={listboxId}
              role="listbox"
              className={cn(
                'ui:absolute ui:z-50 ui:mt-1 ui:max-h-64 ui:w-full ui:overflow-y-auto ui:rounded-xs ui:border ui:border-grey-300 ui:bg-grey-100 ui:p-1 ui:shadow-lg ui:outline-none ui:dark:border-grey-600 ui:dark:bg-grey-900',
                dropdownClassName
              )}
            >
              {availableOptions.map((option, index) => {
                const showGroup =
                  option.group &&
                  (index === 0 ||
                    availableOptions[index - 1]?.group !== option.group);
                const isActive = index === activeIndex;

                return (
                  <Fragment key={`${option.value}-${index}`}>
                    {showGroup && (
                      <li
                        role="presentation"
                        className="ui:px-3 ui:py-1 ui:text-xs ui:font-semibold ui:text-grey-600 ui:dark:text-grey-400"
                      >
                        {option.group}
                      </li>
                    )}
                    <li
                      id={`${listboxId}-option-${index}`}
                      role="option"
                      aria-selected={isActive}
                      aria-disabled={option.disabled || undefined}
                      className={cn(
                        'ui:flex ui:items-center ui:rounded-sm ui:px-3 ui:py-2 ui:text-sm ui:transition-colors ui:duration-150',
                        option.disabled
                          ? 'ui:cursor-not-allowed ui:opacity-50'
                          : 'ui:cursor-pointer',
                        isActive &&
                          'ui:bg-navy-100 ui:text-navy-900 ui:dark:bg-grey-700 ui:dark:text-white',
                        !isActive &&
                          !option.disabled &&
                          'ui:hover:bg-grey-300 ui:dark:hover:bg-grey-700'
                      )}
                      onMouseDown={event => event.preventDefault()}
                      onMouseEnter={() => {
                        if (!option.disabled) setActiveIndex(index);
                      }}
                      onClick={() => selectOption(option)}
                    >
                      {renderOption
                        ? renderOption({
                            option: {
                              value: option.value,
                              label: option.label,
                              disabled: option.disabled,
                            },
                            isActive,
                          })
                        : option.label}
                    </li>
                  </Fragment>
                );
              })}
            </ul>
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
