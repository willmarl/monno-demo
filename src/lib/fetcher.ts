import type { Options } from "ky";
import { handleDemoRequest } from "./demo/mockHandler";

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  error: string;
  statusCode: number;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Static demo build: every API call is routed to the in-memory mock handler.
// No real HTTP requests are made.
export async function fetcher<T>(url: string, options?: Options): Promise<T> {
  const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
  return handleDemoRequest<T>(cleanUrl, options as any);
}
