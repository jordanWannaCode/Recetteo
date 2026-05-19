import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { recipeService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
  Menu,
  MenuItem,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Sort,
  Favorite,
  FavoriteBorder,
  AccessTime,
  Restaurant,
  Edit,
  Visibility,
  Delete
} from '@mui/icons-material';

// Define placeholder image path correctly
const PLACEHOLDER_IMAGE = '/recipe-placeholder.jpg';

const formatDuration = (totalMinutes) => {
  if (!Number.isFinite(totalMinutes)) {
    return '0 min';
  }

  const safeMinutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h${String(minutes).padStart(2, '0')}`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${minutes} min`;
};

const RecipesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [sortBy, setSortBy] = useState('recent');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const categories = ['Tous', 'Entrées', 'Plats', 'Desserts', 'Boissons', 'Favoris'];
  const sortOptions = [
    { value: 'recent', label: 'Plus récentes' },
    { value: 'oldest', label: 'Plus anciennes' },
    { value: 'az', label: 'A-Z' },
    { value: 'za', label: 'Z-A' }
  ];

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const response = await recipeService.getAll();
        setRecipes(response.data.recettes || []);
      } catch (error) {
        console.error('Failed to fetch recipes', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

  const handleFilterOpen = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSortOpen = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    handleFilterClose();
  };

  const handleSortSelect = (sort) => {
    setSortBy(sort);
    handleSortClose();
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAddRecipe = () => {
    navigate('/recettes/nouvelle');
  };

  const handleEditRecipe = (id) => {
    navigate(`/recettes/${id}/modifier`);
  };

  const handleViewRecipe = (id) => {
    navigate(`/recettes/${id}`);
  };

  const handleOpenDelete = (recipe) => {
    setDeleteTarget(recipe);
  };

  const handleCloseDelete = () => {
    if (deleting) return;
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await recipeService.delete(deleteTarget.id);
      setRecipes((prev) => prev.filter((recipe) => recipe.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error('Failed to delete recipe', error);
    } finally {
      setDeleting(false);
    }
  };

  const toggleFavorite = async (id) => {
    try {
      const updatedRecipes = recipes.map(recipe =>
        recipe.id === id ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
      );
      setRecipes(updatedRecipes);
    } catch (error) {
      console.error('Failed to toggle favorite', error);
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || 
                          (selectedCategory === 'Favoris' ? recipe.isFavorite : recipe.categorie === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    switch (sortBy) {
      case 'az':
        return a.nom.localeCompare(b.nom);
      case 'za':
        return b.nom.localeCompare(a.nom);
      case 'recent':
        return new Date(b.date_creation) - new Date(a.date_creation);
      case 'oldest':
        return new Date(a.date_creation) - new Date(b.date_creation);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Mes Recettes
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddRecipe}
        >
          Nouvelle Recette
        </Button>
      </Box>

      <Box sx={{ display: 'flex', mb: 4, gap: 2, flexWrap: 'wrap' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher une recette..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={handleFilterOpen}
        >
          {selectedCategory}
        </Button>
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
        >
          {categories.map((category) => (
            <MenuItem
              key={category}
              onClick={() => handleCategorySelect(category)}
              selected={selectedCategory === category}
            >
              {category}
            </MenuItem>
          ))}
        </Menu>

        <Button
          variant="outlined"
          startIcon={<Sort />}
          onClick={handleSortOpen}
        >
          Trier
        </Button>
        <Menu
          anchorEl={sortAnchorEl}
          open={Boolean(sortAnchorEl)}
          onClose={handleSortClose}
        >
          {sortOptions.map((option) => (
            <MenuItem
              key={option.value}
              onClick={() => handleSortSelect(option.value)}
              selected={sortBy === option.value}
            >
              {option.label}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {sortedRecipes.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8, 
          backgroundColor: 'background.paper',
          borderRadius: 2,
          border: '1px dashed',
          borderColor: 'divider'
        }}>
          <Restaurant sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Aucune recette trouvée
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={handleAddRecipe}
          >
            Ajouter une recette
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          <AnimatePresence>
            {sortedRecipes.map((recipe) => (
              <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardActionArea onClick={() => handleViewRecipe(recipe.id)} sx={{ flexGrow: 1, alignItems: 'stretch' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={recipe.image || PLACEHOLDER_IMAGE}
                        alt={recipe.nom}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = PLACEHOLDER_IMAGE;
                        }}
                        sx={{
                          objectFit: 'cover',
                          backgroundColor: 'background.default'
                        }}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="h6" gutterBottom>
                            {recipe.nom}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(recipe.id);
                            }}
                          >
                            {recipe.isFavorite ? (
                              <Favorite color="error" />
                            ) : (
                              <FavoriteBorder />
                            )}
                          </IconButton>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AccessTime fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatDuration(recipe.temps_preparation + (recipe.temps_cuisson || 0))}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {recipe.description?.length > 100
                            ? `${recipe.description.substring(0, 100)}...`
                            : recipe.description || 'Aucune description'}
                        </Typography>
                        
                        {recipe.categorie && (
                          <Chip
                            label={recipe.categorie}
                            size="small"
                            color="primary"
                            sx={{ mr: 1 }}
                          />
                        )}
                      </CardContent>
                    </CardActionArea>
                    <CardActions sx={{ justifyContent: 'flex-end' }}>
                      <IconButton
                        onClick={() => handleViewRecipe(recipe.id)}
                        aria-label={`Voir la recette ${recipe.nom}`}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      {user?.id === recipe.utilisateur_id && (
                        <>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditRecipe(recipe.id);
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDelete(recipe);
                            }}
                          >
                            <Delete fontSize="small" color="error" />
                          </IconButton>
                        </>
                      )}
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      )}

      <Dialog open={Boolean(deleteTarget)} onClose={handleCloseDelete}>
        <DialogTitle>Supprimer la recette</DialogTitle>
        <DialogContent>
          <Typography>
            Confirmer la suppression de la recette "{deleteTarget?.nom}" ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete} disabled={deleting}>
            Annuler
          </Button>
          <Button onClick={handleConfirmDelete} color="error" disabled={deleting}>
            {deleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RecipesPage;
