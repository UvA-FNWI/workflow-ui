interface CustomEnvWindow extends Window {
    _env?: {
        VITE_WEBAPI_URL?: string;
        VITE_ENV?: string;
    };
}
const envWindow = window as CustomEnvWindow;
const env = {
    VITE_WEBAPI_URL: envWindow._env?.VITE_WEBAPI_URL ?? import.meta.env.VITE_WEBAPI_URL,
    VITE_ENV: envWindow._env?.VITE_ENV ?? import.meta.env.VITE_ENV,
};

export const {VITE_WEBAPI_URL, VITE_ENV} = env;
