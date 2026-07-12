const LEGACY_SSL_MODES = ["prefer", "require", "verify-ca"] as const;

/**
 * pg v8 treats prefer/require/verify-ca as verify-full and warns about the
 * upcoming v9 behavior change. Use verify-full explicitly to keep current security.
 */
export function normalizeDatabaseUrl(url: string | undefined): string {
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  let normalized = url;
  for (const mode of LEGACY_SSL_MODES) {
    if (normalized.includes(`sslmode=${mode}`)) {
      normalized = normalized.replace(`sslmode=${mode}`, "sslmode=verify-full");
      break;
    }
  }

  return normalized;
}
