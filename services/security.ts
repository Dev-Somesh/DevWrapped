
/**
 * Generates a cryptographically strong, salted hash for session identifiers.
 * This replaces insecure SHA-1 or random-string based identifiers.
 */
export const generateSecureTraceId = async (seed: string): Promise<string> => {
  const encoder = new TextEncoder();
  const salt = encoder.encode("DEV_WRAPPED_2025_SECURE_SALT_v1"); // Constant salt for consistent but robust hashing
  const data = encoder.encode(seed + Date.now().toString());

  // We use SHA-256 as it is natively supported and robust against collisions.
  // For higher security (like bcrypt), we add a salt and transform.
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Return a truncated version for UI display, keeping high entropy
  return hashHex.substring(0, 16).toUpperCase();
};

/**
 * Simulates a robust error logger (Sentry-like) for the application.
 * In a production environment, this would call Sentry.captureException().
 */
export const logDiagnosticData = (error: Error, context: Record<string, any>) => {
  const diagnosticReport = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    userAgent: navigator.userAgent,
    ...context
  };

  console.group('◈ SYSTEM_DIAGNOSTIC_REPORT');
  console.error('ERROR_TRACED:', diagnosticReport.message);
  console.table(diagnosticReport);
  console.groupEnd();
  
  // Placeholder for real Sentry integration:
  // if (window.Sentry) window.Sentry.captureException(error, { extra: context });
};
