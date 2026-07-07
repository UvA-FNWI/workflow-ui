import { cn } from '../../utils/cn';

export interface InputErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const InputError: React.FC<InputErrorProps> = ({
  children,
  className,
  ...rest
}) => (
  <div
    {...rest}
    className={cn(
      'ui:mt-1 ui:text-sm ui:text-red-600 ui:dark:text-red-400',
      className
    )}
  >
    {children}
  </div>
);
