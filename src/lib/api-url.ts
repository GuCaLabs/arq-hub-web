const rawApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

/**
 * Base versionada da API. Configure NEXT_PUBLIC_API_URL sem o sufixo /v1,
 * por exemplo: https://api.exemplo.com/api.
 */
export const apiBaseUrl = `${rawApiUrl || "http://localhost:3000/api"}/v1`;

export function getApiUrl(path: string) {
  return `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
