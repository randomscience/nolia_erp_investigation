
import PocketBase from 'pocketbase';

export const backendEnvs = { 'dev': 'https://dev.noliacare.com', 'prod': 'https://app.noliacare.com', 'stage': 'https://stage.noliacare.com' } as const;

export type BackendEnv = keyof typeof backendEnvs;
export const backendEnvStorageKey = 'nolia-backend-env';

export const storedBackendEnv = localStorage.getItem(backendEnvStorageKey);
export const sessionExpiryStorageKey = 'nolia-session-expiry';
export const backendEnv = storedBackendEnv
    && Object.prototype.hasOwnProperty.call(backendEnvs, storedBackendEnv)
    ? storedBackendEnv as BackendEnv
    : 'dev';
export const pocketbaseUrl = backendEnvs[backendEnv];

export const pb = new PocketBase(pocketbaseUrl);


export const sessionDurationMs = 15 * 60 * 1000 * 100;