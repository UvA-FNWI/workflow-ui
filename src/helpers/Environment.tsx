interface CustomEnvWindow extends Window {
    _env?: {
        VITE_WEBAPI_URL?: string;
        VITE_ENV?: string;
        VITE_AUTH_AUTHORITY?: string;
        VITE_AUTH_CLIENT_ID?: string;
        VITE_AUTH_REDIRECT_URI?: string;
        VITE_AUTH_LOGOUT_URL?: string;
    };
}
const envWindow = window as CustomEnvWindow;
const env = {
    VITE_WEBAPI_URL: envWindow._env?.VITE_WEBAPI_URL ?? import.meta.env.VITE_WEBAPI_URL,
    VITE_ENV: envWindow._env?.VITE_ENV ?? import.meta.env.VITE_ENV,
    VITE_AUTH_AUTHORITY: envWindow._env?.VITE_AUTH_AUTHORITY ?? import.meta.env.VITE_AUTH_AUTHORITY,
    VITE_AUTH_CLIENT_ID: envWindow._env?.VITE_AUTH_CLIENT_ID ?? import.meta.env.VITE_AUTH_CLIENT_ID,
    VITE_AUTH_REDIRECT_URI:
        envWindow._env?.VITE_AUTH_REDIRECT_URI ?? import.meta.env.VITE_AUTH_REDIRECT_URI,
    VITE_AUTH_LOGOUT_URL:
        envWindow._env?.VITE_AUTH_LOGOUT_URL ?? import.meta.env.VITE_AUTH_LOGOUT_URL,
};

export const {
    VITE_WEBAPI_URL,
    VITE_ENV,
    VITE_AUTH_AUTHORITY,
    VITE_AUTH_CLIENT_ID,
    VITE_AUTH_REDIRECT_URI,
    VITE_AUTH_LOGOUT_URL,
} = env;
