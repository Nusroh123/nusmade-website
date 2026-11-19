export function formatPlainError(err: unknown, fallback: string): string {
  const raw = err instanceof Error ? err.message : typeof err === 'string' ? err : '';
  const lower = raw.toLowerCase();

  if (lower.includes('popup-closed-by-user')) {
    return 'Google sign-in was closed before finishing. Click Sign in with Google and choose your account.';
  }
  if (lower.includes('popup-blocked')) {
    return 'Your browser blocked the Google sign-in window. Please allow popups for this site and try again.';
  }
  if (lower.includes('cancelled-popup-request')) {
    return 'A sign-in window is already open. Finish signing in there or try again.';
  }
  if (lower.includes('network-request-failed') || lower.includes('client is offline') || lower.includes('unavailable')) {
    return 'Cannot reach the server right now. Check your internet connection and try again.';
  }
  if (lower.includes('permission-denied') || lower.includes('missing or insufficient permissions')) {
    return 'Your signed-in account does not have permission for this action. Sign in with the assigned account and try again.';
  }
  if (lower.includes('not-found')) {
    return 'That record could not be found. It may have already been removed.';
  }

  // Handle structured FirestoreErrorInfo JSON strings cleanly
  if (raw.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(raw) as { error?: string };
      if (parsed.error) {
        return formatPlainError(parsed.error, fallback);
      }
    } catch {
      // Fall through to default message
    }
  }

  return fallback;
}
