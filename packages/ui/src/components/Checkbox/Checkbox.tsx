import React from 'react';
import styles from './Checkbox.module.scss';

type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
}) => (
  <label className={styles.checkbox}>
    <input
      type="checkbox"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
    />
    {label}
  </label>
);
