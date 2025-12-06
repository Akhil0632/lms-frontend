import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

api.interceptors.request.use(
    config => {
        console.log('Request:', config.method.toUpperCase(), config.url);
        return config;
    },
    error => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    response => {
        console.log('Response:', response.status, response.data);
        return response;
    },
    error => {
        console.error('Response Error:', error.response?.status, error.message);
        return Promise.reject(error);
    }
);

export const courseAPI = {
    getAllCourses: () => api.get('/courses'),
    getCourse: (id) => api.get(`/courses/${id}`),
    createCourse: (formData) => api.post('/courses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    updateCourse: (id, formData) => {
        return api.post(`/courses/${id}`, formData, {
            headers: { 
                'Content-Type': 'multipart/form-data',
                'X-HTTP-Method-Override': 'PUT' 
            }
        });
    },
    deleteCourse: (id) => api.delete(`/courses/${id}`),
};

export default api;