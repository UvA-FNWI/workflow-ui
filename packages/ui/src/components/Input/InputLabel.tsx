import { cn } from '../../utils/cn';

export interface InputLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export const InputLabel: React.FC<InputLabelProps> = ({
  children,
  className,
  ...rest
}) => (
  <label
    {...rest}
    className={cn(
      'ui:text-md ui:mb-1 ui:block ui:font-semibold ui:text-black ui:dark:text-white',
      className
    )}
  >
    {children}
  </label>
);
