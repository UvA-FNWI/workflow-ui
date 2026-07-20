import type { PageMarkVariant } from '../components/PageMark/PageMark';

export interface EnvData {
  /** Tailwind background class to apply to the app wrapper */
  bgClassName: string;
  /** PageMark color variant */
  variant: PageMarkVariant;
  /** Short label displayed in the ribbon */
  label: string;
}

/**
 * Returns environment display data for non-production environments.
 * Pass the current environment string (e.g. from VITE_ENV).
 * Returns null for production or unknown environments.
 */
export function useEnvData(env: string | undefined): EnvData | null {
  switch (env) {
    case 'test':
      return {
        bgClassName: 'ui:bg-orange-100',
        variant: 'primary',
        label: 'tst',
      };
    case 'accept':
      return {
        bgClassName: 'ui:bg-forest-100',
        variant: 'secondary',
        label: 'acc',
      };
    case 'pr-fe':
    case 'pr-be':
      return {
        bgClassName: 'ui:bg-lime-200',
        variant: 'tertiary',
        label: env,
      };
    case 'development':
      return {
        bgClassName: 'ui:bg-lime-200',
        variant: 'tertiary',
        label: 'dev',
      };
    default:
      return null;
  }
}
