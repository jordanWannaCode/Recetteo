import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ingredientService } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Container, Typography, Button, Grid, Card, CardContent,
  CardActions, TextField, IconButton, Tooltip, Chip, Paper,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Add, Search, Delete, Edit, FilterList } from '@mui/icons-material';

const IngredientsPage = () => {
  const [ingredients, setIngredients] = useState([]);
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setLoading(true);
        const response = await ingredientService.getAll();
        setIngredients(response.data);
        setFilteredIngredients(response.data);
      } catch (error) {
        console.error('Failed to fetch ingredients', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchIngredients();
  }, []);

  useEffect(() => {
    const filtered = ingredients.filter(ingredient =>
      ingredient.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ingredient.unite.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredIngredients(filtered);
  }, [searchTerm, ingredients]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = async () => {
    try {
      await ingredientService.delete(ingredientToDelete.id);
      setIngredients(ingredients.filter(i => i.id !== ingredientToDelete.id));
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete ingredient', error);
    }
  };

  const handleAddIngredient = () => {
    navigate('/ingredients/nouveau');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Ingrédients
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={handleAddIngredient}
          >
            Ajouter un ingrédient
          </Button>
        </Box>
        
        <Paper sx={{ mb: 4, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher des ingrédients..."
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ mr: 2 }}
            />
            <Tooltip title="Filtres">
              <IconButton>
                <FilterList />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>
        
        {filteredIngredients.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="textSecondary">
              Aucun ingrédient trouvé
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            <AnimatePresence>
              {filteredIngredients.map((ingredient) => (
                <Grid item xs={12} sm={6} md={4} key={ingredient.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.03 }}
                  >
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="h6" component="h2">
                            {ingredient.nom}
                          </Typography>
                          <Chip 
                            label={ingredient.unite} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                          {ingredient.prix_unitaire} € / unité
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Ajouté le: {new Date(ingredient.date_ajout).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'flex-end' }}>
                        <Tooltip title="Modifier">
                          <IconButton 
                            onClick={() => navigate(`/ingredients/${ingredient.id}/modifier`)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton 
                            onClick={() => {
                              setIngredientToDelete(ingredient);
                              setOpenDeleteDialog(true);
                            }}
                          >
                            <Delete color="error" />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
        )}
        
        {/* Dialog de confirmation de suppression */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
        >
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <Typography>
              Êtes-vous sûr de vouloir supprimer l'ingrédient "{ingredientToDelete?.nom}" ?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Annuler</Button>
            <Button onClick={handleDelete} color="error">Supprimer</Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default IngredientsPage;