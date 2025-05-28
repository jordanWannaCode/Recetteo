import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { recipeService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Box, Container, Typography, Button, Grid, Card, CardContent,
  CardHeader, Divider, Chip, IconButton, Tooltip, List, ListItem,
  ListItemText, Avatar, Paper, Stack, CircularProgress, Dialog,
  DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { 
  Edit, Delete, ArrowBack, Timer, Restaurant, Share, 
  Favorite, ShoppingCart, Print 
} from '@mui/icons-material';

const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const response = await recipeService.getById(id);
        setRecipe(response.data);
      } catch (error) {
        console.error('Failed to fetch recipe', error);
        navigate('/recettes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipe();
  }, [id, navigate]);

  const handleDelete = async () => {
    try {
      await recipeService.delete(id);
      navigate('/recettes');
    } catch (error) {
      console.error('Failed to delete recipe', error);
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const handleGenerateShoppingList = () => {
    // Implémentez la logique pour générer une liste de courses
    console.log('Generate shopping list for recipe:', id);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!recipe) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" color="error">
          Recette non trouvée
        </Typography>
      </Container>
    );
  }

  // Vérifier si l'utilisateur est l'auteur de la recette
  const isAuthor = user && user.id === recipe.utilisateur_id;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/recettes')} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            {recipe.nom}
          </Typography>
          
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Tooltip title="Partager">
              <IconButton>
                <Share />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}>
              <IconButton onClick={() => setIsFavorite(!isFavorite)}>
                <Favorite color={isFavorite ? "error" : "inherit"} />
              </IconButton>
            </Tooltip>
            
            {isAuthor && (
              <>
                <Tooltip title="Modifier">
                  <IconButton onClick={() => navigate(`/recettes/${id}/modifier`)}>
                    <Edit />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Supprimer">
                  <IconButton onClick={() => setOpenDeleteDialog(true)}>
                    <Delete color="error" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader 
                title="Description" 
                action={
                  <Chip 
                    label={recipe.est_publique ? "Publique" : "Privée"} 
                    color={recipe.est_publique ? "success" : "default"} 
                    variant="outlined"
                  />
                }
              />
              <CardContent>
                <Typography paragraph>
                  {recipe.description}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Chip 
                    icon={<Timer />} 
                    label={`Préparation: ${recipe.temps_preparation} min`} 
                    variant="outlined"
                  />
                  <Chip 
                    icon={<Timer />} 
                    label={`Cuisson: ${recipe.temps_cuisson} min`} 
                    variant="outlined"
                  />
                  <Chip 
                    label={`Total: ${recipe.temps_preparation + recipe.temps_cuisson} min`} 
                    color="primary"
                  />
                </Box>
              </CardContent>
            </Card>
            
            <Card sx={{ mt: 3 }}>
              <CardHeader title="Instructions" />
              <CardContent>
                <Typography paragraph>
                  {recipe.instructions || "Aucune instruction fournie."}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader 
                title="Ingrédients" 
                action={
                  <Button 
                    size="small" 
                    startIcon={<ShoppingCart />}
                    onClick={handleGenerateShoppingList}
                  >
                    Liste de courses
                  </Button>
                }
              />
              <CardContent>
                <List dense>
                  {recipe.ingredients.map((ingredient, index) => (
                    <ListItem key={index} divider>
                      <ListItemText
                        primary={ingredient.nom}
                        secondary={`${ingredient.quantite} ${ingredient.unite}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
            
            <Card sx={{ mt: 3 }}>
              <CardHeader title="Informations" />
              <CardContent>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      alt={recipe.auteur?.nom_utilisateur} 
                      src="/avatar.jpg" 
                      sx={{ width: 40, height: 40, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="subtitle2">Auteur</Typography>
                      <Typography>{recipe.auteur?.nom_utilisateur || 'Inconnu'}</Typography>
                    </Box>
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Typography variant="subtitle2">Date de création</Typography>
                    <Typography>
                      {new Date(recipe.date_creation).toLocaleDateString()}
                    </Typography>
                  </Box>
                  
                  {recipe.date_modification && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant="subtitle2">Dernière modification</Typography>
                        <Typography>
                          {new Date(recipe.date_modification).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Stack>
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
              Êtes-vous sûr de vouloir supprimer la recette "{recipe.nom}" ? Cette action est irréversible.
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

export default RecipeDetailPage;