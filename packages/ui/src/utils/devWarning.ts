// `process.env.NODE_ENV` is intentionally not replaced in Vite library mode, so
// the consuming app's bundler decides whether these warnings are kept.
declare const process: { env: { NODE_ENV?: string } };

const warned = new Set<string>();

/**
 * Log a development-only accessibility/usage warning, once per message.
 */
export function devWarning(message: string) {
  try {
    if (process.env.NODE_ENV === 'production') return;
  } catch {
    // `process` is not defined in this environment: treat as production.
    return;
  }
  if (warned.has(message)) return;
  warned.add(message);
  // eslint-disable-next-line no-console
  console.warn(`[@uva-fnwi/datanose-ui] ${message}`);
}
