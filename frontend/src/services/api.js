import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    if (config.headers && typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (config.headers && typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type');
    } else if (config.headers) {
      delete config.headers['Content-Type'];
    }
  }
  return config;
});

// Intercepteur pour gérer les tokens invalides/expirés globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    // Sur 401/422 du profil, token invalide ou expiré → déclencher la déconnexion
    if ((status === 401 || status === 422) && url.includes('/auth/profile')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('auth:logout', { detail: { status } }));
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/profile/password', data),
  deleteAccount: () => api.delete('/auth/profile'),
  uploadAvatar: (formData) => api.post('/auth/profile/avatar', formData),
};

export const recipeService = {
  getAll: () => api.get('/recettes'),
  getPublic: () => api.get('/recettes/publiques'),
  getById: (id) => api.get(`/recettes/${id}`),
  create: (data) => api.post('/recettes', data),
  update: (id, data) => api.put(`/recettes/${id}`, data),
  delete: (id) => api.delete(`/recettes/${id}`),
  uploadImage: (id, formData) => api.post(`/recettes/${id}/image`, formData),
};

export const ingredientService = {
  getAll: () => api.get('/ingredients'),
  getById: (id) => api.get(`/ingredients/${id}`),
  create: (data) => api.post('/ingredients', data),
  update: (id, data) => api.put(`/ingredients/${id}`, data),
  delete: (id) => api.delete(`/ingredients/${id}`),
};

export const inventoryService = {
  getAll: () => api.get('/inventaires'),
  getById: (id) => api.get(`/inventaires/${id}`),
  create: (data) => api.post('/inventaires', data),
  update: (id, data) => api.put(`/inventaires/${id}`, data),
  updateIngredient: (inventoryId, ingredientId, data) => 
    api.put(`/inventaires/${inventoryId}/ingredients/${ingredientId}`, data),
  delete: (id) => api.delete(`/inventaires/${id}`),
};

export const shoppingService = {
  getLists: () => api.get('/shopping/lists'),
  getList: (id) => api.get(`/shopping/lists/${id}`),
  createList: () => api.post('/shopping/lists'),
  addItem: (listId, data) => api.post(`/shopping/lists/${listId}/items`, data),
  updateItem: (listId, itemId, data) => 
    api.put(`/shopping/lists/${listId}/items/${itemId}`, data),
  deleteItem: (listId, itemId) => 
    api.delete(`/shopping/lists/${listId}/items/${itemId}`),
  deleteList: (listId) => api.delete(`/shopping/lists/${listId}`),
  generateList: (recipeId, inventoryId) => 
    api.post(`/shopping/generate/${recipeId}/${inventoryId}`),
};

export default api;