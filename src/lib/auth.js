import { OAuthProvider } from 'appwrite';
import { account } from './appwrite.js';

/**
 * Initiates the Google OAuth2 login flow.
 */
export function loginWithGoogle() {
    // Determine current origin for callbacks
    const currentOrigin = window.location.origin;
    const successUrl = `${currentOrigin}/account.html`;
    const failureUrl = `${currentOrigin}/account.html?error=login_failed`;

    // Start OAuth flow
    account.createOAuth2Session(
        OAuthProvider.Google,
        successUrl,
        failureUrl
    );
}

/**
 * Logs out the current user.
 */
export async function logout() {
    try {
        await account.deleteSession('current');
    } catch (e) {
        console.error('Logout error:', e);
    }
}

/**
 * Fetches the currently logged-in user.
 * Returns null if no user is logged in.
 */
export async function getCurrentUser() {
    try {
        const user = await account.get();
        return user;
    } catch (e) {
        // Not logged in or error
        return null;
    }
}
