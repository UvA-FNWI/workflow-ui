interface CustomEnvWindow extends Window {
    _env?: {
        VITE_WEBAPI_URL?: string;
        VITE_ENV?: string;
    };
}
const envWindow = window as CustomEnvWindow;

export const {VITE_WEBAPI_URL, VITE_ENV} = envWindow._env || {};
