import axios from "axios";

const API = axios.create({
    baseURL: 'https://projetflow-platform-production.up.railway.app/api'
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginRequest = error.config?.url?.includes('/login');
        if (error.response && error.response.status === 401 && !isLoginRequest) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

export default API;