import axios from 'axios';

const configuredBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const client = axios.create({
    baseURL: configuredBaseUrl ? `${configuredBaseUrl}/api` : '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default client;
