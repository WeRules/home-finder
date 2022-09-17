import {
    LOCALSTORAGE_COOKIE_CONSENT_KEY,
    LOCALSTORAGE_COOKIE_CONSENT_VALUE,
    LOCALSTORAGE_MESSAGE_KEY,
} from './constants';

// example: snackbar_message_key -> your_comment_submitted:success
export const setSnackbarMessage = (message, severity) => {
    localStorage.setItem(
        LOCALSTORAGE_MESSAGE_KEY,
        `${message}:${severity}`
    );
};

export const isClient = () => typeof window !== 'undefined';

export const getSnackbarMessage = () => {
    // because of the SSR
    if (typeof localStorage === 'undefined') {
        return [];
    }

    const messageData = localStorage.getItem(LOCALSTORAGE_MESSAGE_KEY);
    if (messageData) {
        clearSnackbarMessage();
        return messageData.split(':');
    }

    return [];
};

export const clearSnackbarMessage = () => {
    localStorage.removeItem(LOCALSTORAGE_MESSAGE_KEY);
};

export const getCookieConsent = () => {
    // because of the SSR
    if (typeof localStorage === 'undefined') {
        return null;
    }

    return localStorage.getItem(LOCALSTORAGE_COOKIE_CONSENT_KEY) === LOCALSTORAGE_COOKIE_CONSENT_VALUE;
};

export const setCookieConsentSeen = () => {
    localStorage.setItem(
        LOCALSTORAGE_COOKIE_CONSENT_KEY,
        LOCALSTORAGE_COOKIE_CONSENT_VALUE
    );
};

export const isObject = (obj) =>
    typeof obj === 'object' && obj?.constructor === Object;

export const isObjectEmpty = (obj) =>
    isObject(obj) && Object.keys(obj).length === 0;

export const isObjectNotEmpty = (obj) =>
    isObject(obj) && Object.keys(obj).length > 0;

export const capitalize = (string) => {
    if (!string) {
        return '';
    }

    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};
