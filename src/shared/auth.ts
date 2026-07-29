// Small helper to read the `role` claim out of the JWT access token without
// a network round trip — the token is only ever trusted server-side for
// authorization, this is purely for deciding what the UI should render.
export function decodeRoleFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(normalized));
    return typeof json.role === 'string' ? json.role : null;
  } catch {
    return null;
  }
}

export function getUserRole(): string | null {
  const token = localStorage.getItem('accessToken');
  return token ? decodeRoleFromToken(token) : null;
}

export function isSuperAdmin(): boolean {
  return getUserRole() === 'super_admin';
}

/**
 * Reads the persisted `userRole` breadcrumb rather than decoding the live
 * token — used right after a session-expiry event, when the access token
 * has already been cleared but this breadcrumb hasn't.
 */
export function wasSuperAdminSession(): boolean {
  return localStorage.getItem('userRole') === 'super_admin';
}

/**
 * Call right after storing a fresh accessToken so a `userRole` breadcrumb
 * survives even after the token itself gets cleared on logout/session-expiry
 * (App.tsx uses it to decide whether an expired session should bounce back
 * to /admin's login or the regular student login).
 */
export function persistUserRole(token: string): void {
  const role = decodeRoleFromToken(token);
  if (role) {
    localStorage.setItem('userRole', role);
  } else {
    localStorage.removeItem('userRole');
  }
}
