import { cn } from '../../utils/cn';

export interface InputDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const InputDescription: React.FC<InputDescriptionProps> = ({
  children,
  className,
  ...rest
}) => (
  <div
    {...rest}
    className={cn(
      'ui:mt-1 ui:text-sm ui:text-grey-600 ui:dark:text-grey-400',
      className
    )}
  >
    {children}
  </div>
);
