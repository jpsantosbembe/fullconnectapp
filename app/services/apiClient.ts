// fullconnect/app/services/apiClient.ts (Modified with more precise console.logs)
import { API_BASE_URL, API_KEY } from '../config/constants';

export async function client(endpoint: string, { body, ...customConfig }: { body?: any, method?: string, headers?: HeadersInit } = {}) {
    console.log('apiClient: client function called for endpoint:', endpoint); // This log *should* appear now
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY, // Add the API Key
    };

    const config: RequestInit = {
        method: body ? 'POST' : 'GET', // Default method based on body existence
        ...customConfig,
        headers: {
            ...headers,
            ...customConfig.headers,
        },
    };
    console.log('apiClient: Request config:', { method: config.method, url: `${API_BASE_URL}${endpoint}`, headers: config.headers });


    if (body) {
        config.body = JSON.stringify(body);
        console.log('apiClient: Request body (stringified):', config.body);
    }

    try {
        console.log('apiClient: >>> About to execute fetch call <<<');
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        console.log('apiClient: <<< Fetch call executed. Response received. Status:', response.status, 'Status Text:', response.statusText);

        if (response.status === 204) {
            console.log('apiClient: Response status 204 (No Content).');
            return; // No content to return for 204
        }

        const data = await response.json();
        console.log('apiClient: Response data (JSON):', data);

        if (response.ok) {
            console.log('apiClient: Response is OK. Returning data.');
            return data;
        }

        console.error('apiClient: Response not OK. Rejecting promise with:', {
            message: data?.message || response.statusText,
            status: response.status
        });
        return Promise.reject({
            message: data?.message || response.statusText,
            status: response.status
        });

    } catch (err: any) {
        console.error('apiClient: Network/Fetch error caught:', err);
        // Handle network errors (ex: server offline) and return a standardized object.
        return Promise.reject({ message: err.message, status: 503 }); // 503: Service Unavailable
    }
}

// Helper functions for common HTTP methods
export const get = (endpoint: string, customConfig: { method?: string, headers?: HeadersInit } = {}) => client(endpoint, {...customConfig, method: 'GET'});
export const post = (endpoint: string, body: any, customConfig: { method?: string, headers?: HeadersInit } = {}) => client(endpoint, {
    body, ...customConfig,
    method: 'POST'
});
export const put = (endpoint: string, body: any, customConfig: { method?: string, headers?: HeadersInit } = {}) => client(endpoint, {body, ...customConfig, method: 'PUT'});
export const del = (endpoint: string, customConfig: { method?: string, headers?: HeadersInit } = {}) => client(endpoint, {...customConfig, method: 'DELETE'});

export default () => null;