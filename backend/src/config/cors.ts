const fallbackOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

export const getAllowedOrigins = () => {
  const envOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [...new Set([...envOrigins, ...fallbackOrigins])];
};

export const isAllowedOrigin = (origin?: string) => {
  if (!origin) {
    return true;
  }

  try {
    const { hostname } = new URL(origin);

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return true;
    }
  } catch {
    // Ignore invalid origin values and fall back to explicit allow-list check.
  }

  return getAllowedOrigins().includes(origin);
};