import { api as realApi } from './api';
import { mockApi } from './api-mock';

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

export const apiClient = USE_MOCK_API ? mockApi : realApi;

export const isMockMode = USE_MOCK_API;
