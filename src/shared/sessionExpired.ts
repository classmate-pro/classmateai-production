/**
 * Bridges axios interceptors (outside the React tree) to App.tsx: when a
 * refresh-token attempt fails (the session is genuinely expired, not just
 * the short-lived access token), emit this event so App.tsx can clear state
 * and navigate to the login page — instead of leaving the user stuck on a
 * dashboard that silently fails every request.
 */
export const SESSION_EXPIRED_EVENT = 'auth:session-expired';

export function emitSessionExpired() {
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}
