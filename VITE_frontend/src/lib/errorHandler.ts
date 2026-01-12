/**
 * Error Handler Utility
 * Centralized error handling for API calls
 */

export interface ErrorHandlerResult {
  message: string;
  shouldRedirect: boolean;
  redirectPath?: string;
  shouldRetry: boolean;
}

/**
 * Handle API errors consistently across the application
 */
export function handleApiError(error: Response | Error): ErrorHandlerResult {
  // Network error (fetch failed)
  if (error instanceof Error) {
    return {
      message: "Connection error. Please check your internet and try again.",
      shouldRedirect: false,
      shouldRetry: true,
    };
  }

  // HTTP response errors
  const status = error.status;

  switch (status) {
    case 401:
      return {
        message: "Session expired. Please log in again.",
        shouldRedirect: true,
        redirectPath: "/login",
        shouldRetry: false,
      };

    case 400:
      return {
        message: "Invalid request. Please check your input.",
        shouldRedirect: false,
        shouldRetry: false,
      };

    case 403:
      return {
        message: "You don't have permission to perform this action.",
        shouldRedirect: false,
        shouldRetry: false,
      };

    case 404:
      return {
        message: "The requested resource was not found.",
        shouldRedirect: false,
        shouldRetry: false,
      };

    case 500:
    case 502:
    case 503:
      return {
        message: "Something went wrong. Please try again later.",
        shouldRedirect: false,
        shouldRetry: true,
      };

    default:
      return {
        message: "An unexpected error occurred.",
        shouldRedirect: false,
        shouldRetry: false,
      };
  }
}

/**
 * Wrapper for fetch with error handling
 */
export async function fetchWithErrorHandling<T>(
  url: string,
  options: RequestInit,
  onError?: (result: ErrorHandlerResult) => void
): Promise<{ data: T | null; error: ErrorHandlerResult | null }> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorResult = handleApiError(response);
      onError?.(errorResult);
      return { data: null, error: errorResult };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    const errorResult = handleApiError(error as Error);
    onError?.(errorResult);
    return { data: null, error: errorResult };
  }
}

/**
 * Parse validation errors from 400 response body
 */
export async function parseValidationErrors(
  response: Response
): Promise<Record<string, string>> {
  try {
    const body = await response.json();
    if (body.errors && typeof body.errors === "object") {
      return body.errors;
    }
    if (body.message) {
      return { _general: body.message };
    }
    return { _general: "Validation failed" };
  } catch {
    return { _general: "Invalid request" };
  }
}
