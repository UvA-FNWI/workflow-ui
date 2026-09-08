#### What

Unify the tag appearance and rendering between `TagInput`, `Select`, and multi-select `ComboBox`.

#### Why

The controls use the same visual tag primitive but duplicate their rendering and apply different sizes. This makes future visual changes easy to miss and makes the controls feel inconsistent.

#### How

Extend `SelectedTags` to support the shared tag options needed by `TagInput`, including tag size, custom rendering, and removal callbacks. Reuse it for tag rendering while keeping layout configurable: `TagInput` may wrap tags, while Select and ComboBox remain single-line and stable. Keep the existing full-field triggers and visible keyboard-focused option state.

#### Acceptance criteria

- All three controls use the same tag rendering and sizing options.
- TagInput keeps its wrapping, free-form entry, and custom tag behavior.
- Select and ComboBox keep their stable single-line layout and removable selected values.
- Tag appearance changes can be made in one shared implementation.
- Existing full-field triggers and visible keyboard navigation remain intact.
