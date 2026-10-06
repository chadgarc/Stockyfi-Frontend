// Central error shape for API failures, mirroring the DataError pattern:
// a custom Error subclass plus one handler so reporting stays consistent.
import { getApiMessage, getApiStatus } from "../api/client";

/**
 * Error thrown for API failures such as bad input, expired sessions,
 * or forbidden store access. Carries the HTTP status for mapping.
 */
export class ApiError extends Error {
  /** HTTP status from the server, or null on network failure. */
  status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Builds an ApiError from any caught request error, reading the
 * backend JSON message and status via the shared api helpers.
 */
export const toApiError = (error: unknown): ApiError =>
  new ApiError(getApiMessage(error), getApiStatus(error));

/**
 * Centralized error reporter. ApiError instances log with their
 * status prefix; anything else logs raw for debugging.
 */
export const errorHandler = (error: unknown): void => {
  if (error instanceof ApiError) {
    console.error(`API Error ${error.status ?? "network"}:`, error.message);
  } else {
    console.error(error);
  }
};
