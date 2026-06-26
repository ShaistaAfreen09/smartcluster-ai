/**
 * SRE Platform Consolidated HTTP API client
 */
export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const mergedHeaders = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(endpoint, {
    ...options,
    headers: mergedHeaders,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let parsedError: string;
    try {
      const errJson = JSON.parse(errorText);
      parsedError = errJson.error || errJson.message || `HTTP_ERROR_${response.status}`;
    } catch {
      parsedError = errorText || `HTTP_ERROR_${response.status}`;
    }
    throw new Error(parsedError);
  }

  return response.json() as Promise<T>;
}
