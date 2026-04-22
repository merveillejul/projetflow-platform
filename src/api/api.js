import axios from "axios";

const API = axios.create({
    baseURL: 'https://projetflow-platform-production.up.railway.app/api'
});

// Intercepteur requête — ajoute le token
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Intercepteur réponse — déconnexion automatique si 401
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

export default API;