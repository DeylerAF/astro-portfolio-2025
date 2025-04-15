/**
 * Standardized error handler for Notion API calls
 * @param operation - Description of the operation that failed
 * @param error - The error that occurred
 * @param defaultValue - The default value to return on error
 */
export function handleNotionError<T>(
  operation: string,
  error: unknown,
  defaultValue: T,
): T {
  console.error(`Error ${operation}:`, error);
  return defaultValue;
}
