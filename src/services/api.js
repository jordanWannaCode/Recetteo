import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

export const recipeService = {
  getAll: () => api.get('/recettes'),
  getPublic: () => api.get('/recettes/publiques'),
  getById: (id) => api.get(`/recettes/${id}`),
  create: (data) => api.post('/recettes', data),
  update: (id, data) => api.put(`/recettes/${id}`, data),
  delete: (id) => api.delete(`/recettes/${id}`),
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