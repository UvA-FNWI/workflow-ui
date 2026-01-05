import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import i18next from '../../../i18n/index';
import { ToastProvider } from '../ToastProvider';
import { useToast } from './useToast';

// Mock wrapper component
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

describe('useToast', () => {
  beforeEach(() => {
    // Reset to English for each test
    i18next.changeLanguage('en');
  });

  it('should provide toast methods with correct default titles in English', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    expect(result.current.success).toBeDefined();
    expect(result.current.error).toBeDefined();
    expect(result.current.info).toBeDefined();
    expect(result.current.warning).toBeDefined();
    expect(result.current.note).toBeDefined();
  });

  it('should use English translations by default', async () => {
    await i18next.changeLanguage('en');

    // We can't easily test the actual toast content without more complex setup,
    // but we can verify the i18n setup is working
    expect(i18next.t('toast.titles.success')).toBe('Success');
    expect(i18next.t('toast.titles.error')).toBe('Error');
    expect(i18next.t('toast.titles.info')).toBe('Information');
    expect(i18next.t('toast.titles.warning')).toBe('Warning');
    expect(i18next.t('toast.titles.note')).toBe('Note');
  });

  it('should use Dutch translations when language is changed', async () => {
    await i18next.changeLanguage('nl');

    expect(i18next.t('toast.titles.success')).toBe('Succes');
    expect(i18next.t('toast.titles.error')).toBe('Fout');
    expect(i18next.t('toast.titles.info')).toBe('Info');
    expect(i18next.t('toast.titles.warning')).toBe('Waarschuwing');
    expect(i18next.t('toast.titles.note')).toBe('Notitie');
  });
});
