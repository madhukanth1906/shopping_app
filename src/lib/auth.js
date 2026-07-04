import { account } from './appwrite';
import { OAuthProvider } from 'appwrite';

export const loginWithGoogle = () => {
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('cookieFallback');
    }
    account.createOAuth2Session(
        OAuthProvider.Google,
        `${window.location.origin}/account`,
        `${window.location.origin}/account`
    );
};

export const logout = async () => {
    try {
        await account.deleteSession('current');
    } catch (e) {
        console.error(e);
    } finally {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('cookieFallback');
        }
    }
};

export const getUser = async () => {
    try {
        return await account.get();
    } catch (e) {
        return null;
    }
};
