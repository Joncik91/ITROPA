/**
 * Async operation handler with integrated toast notifications.
 * Eliminates repetitive try/catch/toast patterns across the codebase.
 */

import toast from 'react-hot-toast';

export interface AsyncHandlerOptions<T> {
  /** Message to show while loading */
  loadingMessage: string;
  /** Message to show on success (can be a function that receives the result) */
  successMessage: string | ((result: T) => string);
  /** Message prefix for errors (default: "Failed") */
  errorPrefix?: string;
  /** Called on error with the error object */
  onError?: (error: Error) => void;
  /** Called in finally block regardless of success/failure */
  onFinally?: () => void;
  /** Custom toast options */
  toastOptions?: {
    duration?: number;
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  };
}

/**
 * Execute an async operation with automatic toast notifications.
 *
 * @param operation - Async function to execute
 * @param options - Configuration for messages and callbacks
 * @returns Promise that resolves to the operation result or undefined on error
 *
 * @example
 * ```ts
 * const result = await withAsyncToast(
 *   () => api.fetchData(),
 *   {
 *     loadingMessage: 'Fetching data...',
 *     successMessage: 'Data loaded!',
 *     errorPrefix: 'Failed to fetch data',
 *     onError: (e) => setError(e.message),
 *     onFinally: () => setLoading(false),
 *   }
 * );
 * ```
 */
export async function withAsyncToast<T>(
  operation: () => Promise<T>,
  options: AsyncHandlerOptions<T>
): Promise<T | undefined> {
  const {
    loadingMessage,
    successMessage,
    errorPrefix = 'Failed',
    onError,
    onFinally,
    toastOptions,
  } = options;

  const toastId = toast.loading(loadingMessage, toastOptions);

  try {
    const result = await operation();

    const message = typeof successMessage === 'function'
      ? successMessage(result)
      : successMessage;

    toast.success(message, { id: toastId, ...toastOptions });
    return result;
  } catch (error: any) {
    const errorMessage = `${errorPrefix}: ${error.message}`;
    toast.error(errorMessage, { id: toastId, ...toastOptions });

    if (onError) {
      onError(error);
    }

    return undefined;
  } finally {
    if (onFinally) {
      onFinally();
    }
  }
}

/**
 * Update an existing toast's loading message during a multi-step operation.
 *
 * @param toastId - The toast ID to update
 * @param message - New loading message
 */
export function updateToastMessage(toastId: string, message: string): void {
  toast.loading(message, { id: toastId });
}

/**
 * Create a toast handler bound to specific error/finally callbacks.
 * Useful when you have the same callbacks for multiple operations.
 *
 * @param defaultCallbacks - Default onError and onFinally callbacks
 * @returns A function that accepts operation and partial options
 */
export function createAsyncHandler(defaultCallbacks: {
  onError?: (error: Error) => void;
  onFinally?: () => void;
}) {
  return async <T>(
    operation: () => Promise<T>,
    options: Omit<AsyncHandlerOptions<T>, 'onError' | 'onFinally'> & {
      onError?: (error: Error) => void;
      onFinally?: () => void;
    }
  ): Promise<T | undefined> => {
    return withAsyncToast(operation, {
      ...options,
      onError: options.onError || defaultCallbacks.onError,
      onFinally: options.onFinally || defaultCallbacks.onFinally,
    });
  };
}

/**
 * Simple toast wrapper for operations that don't need loading state.
 * Shows success or error toast based on operation result.
 *
 * @param operation - Async function to execute
 * @param successMessage - Message on success
 * @param errorPrefix - Prefix for error message
 */
export async function toastOnComplete<T>(
  operation: () => Promise<T>,
  successMessage: string,
  errorPrefix: string = 'Error'
): Promise<T | undefined> {
  try {
    const result = await operation();
    toast.success(successMessage);
    return result;
  } catch (error: any) {
    toast.error(`${errorPrefix}: ${error.message}`);
    return undefined;
  }
}
