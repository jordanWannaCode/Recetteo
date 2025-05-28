import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import theme from './theme';

// Composants d'interface
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/auth/ProfilePage';
import RecipesPage from './pages/recipes/RecipesPage';
import RecipeDetailPage from './pages/recipes/RecipeDetailPage';
import RecipeFormPage from './pages/recipes/RecipeFormPage';
import IngredientsPage from './pages/ingredients/IngredientsPage';
import IngredientDetailPage from './pages/ingredients/IngredientDetailPage';
import IngredientFormPage from './pages/ingredients/IngredientFormPage';
import InventoryPage from './pages/inventory/InventoryPage';
import InventoryDetailPage from './pages/inventory/InventoryDetailPage';
import InventoryFormPage from './pages/inventory/InventoryFormPage';
import ShoppingListsPage from './pages/shopping/ShoppingListsPage';
import NotFoundPage from './pages/NotFoundPage';
import PrivateRoute from './components/common/PrivateRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
            <Routes>
              {/* Routes publiques */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Routes protégées */}
              <Route path="/profile" element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              } />
              
              {/* Routes recettes */}
              <Route path="/recettes" element={
                <PrivateRoute>
                  <RecipesPage />
                </PrivateRoute>
              } />
              <Route path="/recettes/nouvelle" element={
                <PrivateRoute>
                  <RecipeFormPage />
                </PrivateRoute>
              } />
              <Route path="/recettes/:id" element={
                <PrivateRoute>
                  <RecipeDetailPage />
                </PrivateRoute>
              } />
              <Route path="/recettes/:id/modifier" element={
                <PrivateRoute>
                  <RecipeFormPage edit />
                </PrivateRoute>
              } />
              
              {/* Routes ingrédients */}
              <Route path="/ingredients" element={
                <PrivateRoute>
                  <IngredientsPage />
                </PrivateRoute>
              } />
              <Route path="/ingredients/nouveau" element={
                <PrivateRoute>
                  <IngredientFormPage />
                </PrivateRoute>
              } />
              <Route path="/ingredients/:id" element={
                <PrivateRoute>
                  <IngredientDetailPage />
                </PrivateRoute>
              } />
              <Route path="/ingredients/:id/modifier" element={
                <PrivateRoute>
                  <IngredientFormPage edit />
                </PrivateRoute>
              } />
              
              {/* Routes inventaires */}
              <Route path="/inventaires" element={
                <PrivateRoute>
                  <InventoryPage />
                </PrivateRoute>
              } />
              <Route path="/inventaires/nouveau" element={
                <PrivateRoute>
                  <InventoryFormPage />
                </PrivateRoute>
              } />
              <Route path="/inventaires/:id" element={
                <PrivateRoute>
                  <InventoryDetailPage />
                </PrivateRoute>
              } />
              <Route path="/inventaires/:id/modifier" element={
                <PrivateRoute>
                  <InventoryFormPage edit />
                </PrivateRoute>
              } />
              
              {/* Routes listes de courses */}
              <Route path="/liste-courses" element={
                <PrivateRoute>
                  <ShoppingListsPage />
                </PrivateRoute>
              } />
              
              {/* Route 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;