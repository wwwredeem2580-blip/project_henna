export const COOKIE_CONFIG = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
};

export const ACCESS_TOKEN_CONFIG = {
  ...COOKIE_CONFIG,
  maxAge: 15 * 60 * 1000, // 15 minutes
};

export const REFRESH_TOKEN_CONFIG = {
  ...COOKIE_CONFIG,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};