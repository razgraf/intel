/**
 * Device-local marker recording that a Clerk session was active on this
 * browser. Cleared only on explicit sign-out, so finding it while Clerk
 * reports signed-out means the session ended without user intent (expiry,
 * revocation, or cleared cookies). Intentionally not part of the cloud
 * account/export system — it is session metadata, not user content.
 */
const SESSION_MARKER_KEY = "intel-session";

export function markSessionActive(): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(SESSION_MARKER_KEY, "1");
	} catch {
		// localStorage unavailable (private mode / quota) — feature degrades silently.
	}
}

export function clearSessionMarker(): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.removeItem(SESSION_MARKER_KEY);
	} catch {
		// localStorage unavailable — nothing to clear.
	}
}

export function hasSessionMarker(): boolean {
	if (typeof window === "undefined") return false;
	try {
		return window.localStorage.getItem(SESSION_MARKER_KEY) !== null;
	} catch {
		return false;
	}
}
