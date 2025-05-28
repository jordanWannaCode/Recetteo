// src/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; // URL de votre API Flask

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT aux requêtes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fonctions pour les endpoints de l'API
export const login = async (email, password) => {
  try {
    const response = await api.post('/login', { email, mot_de_passe: password });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const register = async (username, email, password) => {
  try {
    const response = await api.post('/register', { nom_utilisateur: username, email, mot_de_passe: password });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const logout = async () => {
  try {
    const response = await api.post('/logout');
    localStorage.removeItem('token'); // Supprimer le token du localStorage
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};


export const fetchRecettes = async () => {
  try {
    const response = await api.get('/recette/');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const createRecette = async (recetteData) => {
  try {
    const response = await api.post('/recette/', recetteData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteRecette = async (id) => {
  try {
    const response = await api.delete(`/recette/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const fetchIngredients = async () => {
  try {
    const response = await api.get('/ingredients/');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const createIngredient = async (ingredientData) => {
  try {
    const response = await api.post('/ingredients/', ingredientData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteIngredient = async (id) => {
  try {
    const response = await api.delete(`/ingredients/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const fetchInventaire = async () => {
  try {
    const response = await api.get('/inventory/');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const createInventaire = async (inventaireData) => {
  try {
    const response = await api.post('/inventory/', inventaireData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deleteInventaire = async (id) => {
  try {
    const response = await api.delete(`/inventory/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};