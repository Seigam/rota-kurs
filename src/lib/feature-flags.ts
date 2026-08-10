export function isFeatureEnabled(name: 'AI_FEATURE_ENABLED' | 'RIASEC_FEATURE_ENABLED'): boolean {
  const configured = process.env[name];
  if (configured === 'true') return true;
  if (configured === 'false') return false;
  return process.env.NODE_ENV !== 'production';
}
