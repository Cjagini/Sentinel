import { ApiResponse } from "@/types";

/**
 * Create a standardized API response wrapper for Next.js Route Handlers
 * @param data - The data to return in the response
 * @param statusCode - HTTP status code
 * @param message - Optional message
 * @returns Standardized API response object
 */
export function successResponse<T>(
  data: T,
  statusCode: number = 200,
  message?: string
): ApiResponse<T> {
  return {
    success: true,
    data,
    statusCode,
    message,
  };
}

/**
 * Create a standardized error response wrapper for Next.js Route Handlers
 * @param error - Error message or Error object
 * @param statusCode - HTTP status code
 * @returns Standardized error API response object
 */
export function errorResponse(
  error: string | Error,
  statusCode: number = 500
): ApiResponse {
  const errorMessage = typeof error === "string" ? error : error.message;
  return {
    success: false,
    error: errorMessage,
    statusCode,
  };
}

/**
 * Wrap a route handler with error handling
 * @param handler - The async route handler function
 * @returns Wrapped handler with error handling
 */
export function withErrorHandling(
  handler: (req: Request) => Promise<Response>
) {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (error) {
      console.error("[API Error]:", error);
      const response = errorResponse(error instanceof Error ? error : "Unknown error", 500);
      return new Response(JSON.stringify(response), {
        status: response.statusCode,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
}

/**
 * Convert API response to HTTP Response
 * @param response - The API response object
 * @returns HTTP Response object
 */
export function toHttpResponse(response: ApiResponse): Response {
  return new Response(JSON.stringify(response), {
    status: response.statusCode,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
