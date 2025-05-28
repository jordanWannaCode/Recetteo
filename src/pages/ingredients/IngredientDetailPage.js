import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ingredientService, recipeService } from '../../services/api';
import { motion } from 'framer-motion';
import {
  Box, Container, Typography, Button, Grid, Card, CardContent,
  CardHeader, Divider, Chip, IconButton, Tooltip, List, ListItem,
  ListItemText, Avatar, Paper, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField
} from '@mui/material';
import { Edit, Delete, ArrowBack, Restaurant, LocalGroceryStore } from '@mui/icons-material';

const IngredientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ingredient, setIngredient] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    nom: '',
    unite: '',
    prix_unitaire: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const ingredientResponse = await ingredientService.getById(id);
        const recipesResponse = await recipeService.getAll();
        
        setIngredient(ingredientResponse.data);
        setEditData({
          nom: ingredientResponse.data.nom,
          unite: ingredientResponse.data.unite,
          prix_unitaire: ingredientResponse.data.prix_unitaire
        });
        
        // Filter recipes that use this ingredient
        const recipesWithIngredient = recipesResponse.data.recettes.filter(recipe => 
          recipe.ingredients.some(ing => ing.id === parseInt(id))
        );
        setRecipes(recipesWithIngredient);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    try {
      await ingredientService.delete(id);
      navigate('/ingredients');
    } catch (error) {
      console.error('Failed to delete ingredient', error);
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await ingredientService.update(id, editData);
      setIngredient(prev => ({ ...prev, ...editData }));
      setEditing(false);
    } catch (error) {
      console.error('Failed to update ingredient', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!ingredient) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" color="error">
          Ingrédient non trouvé
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/ingredients')} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            {ingredient.nom}
          </Typography>
          
          <Box sx={{ ml: 'auto' }}>
            <Tooltip title="Modifier">
              <IconButton onClick={() => setEditing(!editing)} sx={{ mr: 1 }}>
                <Edit color={editing ? 'primary' : 'inherit'} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Supprimer">
              <IconButton onClick={() => setOpenDeleteDialog(true)}>
                <Delete color="error" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Informations" />
              <CardContent>
                {editing ? (
                  <Box component="form" sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Nom"
                      value={editData.nom}
                      onChange={(e) => setEditData({...editData, nom: e.target.value})}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Unité"
                      value={editData.unite}
                      onChange={(e) => setEditData({...editData, unite: e.target.value})}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Prix unitaire"
                      type="number"
                      value={editData.prix_unitaire}
                      onChange={(e) => setEditData({...editData, prix_unitaire: parseFloat(e.target.value)})}
                      InputProps={{
                        endAdornment: '€',
                      }}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                      <Button 
                        variant="outlined" 
                        onClick={() => setEditing(false)}
                        sx={{ mr: 2 }}
                      >
                        Annuler
                      </Button>
                      <Button 
                        variant="contained" 
                        onClick={handleUpdate}
                      >
                        Enregistrer
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocalGroceryStore sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body1">
                        <strong>Unité:</strong> {ingredient.unite}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Restaurant sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body1">
                        <strong>Prix unitaire:</strong> {ingredient.prix_unitaire} €
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: 14, mr: 1 }}>
                        {ingredient.nom.charAt(0)}
                      </Avatar>
                      <Typography variant="body1">
                        <strong>Ajouté le:</strong> {new Date(ingredient.date_ajout).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title={`Utilisé dans ${recipes.length} recette${recipes.length !== 1 ? 's' : ''}`} 
              />
              <CardContent>
                {recipes.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Cet ingrédient n'est utilisé dans aucune recette.
                  </Typography>
                ) : (
                  <List dense>
                    {recipes.map(recipe => (
                      <ListItem 
                        key={recipe.id} 
                        button
                        onClick={() => navigate(`/recettes/${recipe.id}`)}
                      >
                        <ListItemText 
                          primary={recipe.nom} 
                          secondary={`${recipe.temps_preparation + recipe.temps_cuisson} min`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Dialog de confirmation de suppression */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
        >
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <Typography>
              Êtes-vous sûr de vouloir supprimer cet ingrédient ? Cette action est irréversible.
            </Typography>
            {recipes.length > 0 && (
              <Typography color="error" sx={{ mt: 1 }}>
                Attention : Cet ingrédient est utilisé dans {recipes.length} recette{recipes.length !== 1 ? 's' : ''}.
              </Typography>
            )}
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

export default IngredientDetailPage;