export function register() {
  if (process.env.NEXT_RUNTIME === 'edge' || process.env.NODE_ENV !== 'production') return;

  const required = ['AI_API_URL', 'AI_MODEL', 'NEXTAUTH_SECRET'] as const;
  const missing = required.filter((name) => !process.env[name]?.trim());
  if (missing.length > 0) {
    throw new Error(`Production configuration is incomplete. Missing: ${missing.join(', ')}`);
  }

  const aiUrl = new URL(process.env.AI_API_URL!);
  if (aiUrl.protocol !== 'https:') throw new Error('AI_API_URL must use HTTPS in production.');
  if (!process.env.AI_API_KEY?.trim() && process.env.AI_ALLOW_ANONYMOUS !== 'true') {
    throw new Error('Tokenless AI access requires AI_ALLOW_ANONYMOUS=true in production.');
  }
}
