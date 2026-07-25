// Shared helper for reading errors out of an axios error response.
//
// Every backend error follows the standard envelope (API Contract, section
// 0.2): { success: false, message, errors: [{ field, message }, ...] }.
// This helper exists so Register and Login (and any future form) don't each
// re-implement the same "dig into error.response.data" logic — both pages
// use this the same way: field-level errors go to react-hook-form's
// setError, and the top-level message is shown as a general form error.

export function extractApiError(error) {
  const data = error?.response?.data;

  if (!data) {
    // Network failure, timeout, or something that never reached the
    // backend at all — there's no structured envelope to read.
    return { message: 'Unable to reach the server. Please try again.', fieldErrors: [] };
  }

  return {
    message: data.message || 'Something went wrong. Please try again.',
    fieldErrors: Array.isArray(data.errors) ? data.errors : [],
  };
}