import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { recipeService, inventoryService, shoppingService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Box, Container, Typography, Button, Grid, Card, CardContent,
  CardHeader, CardMedia, Divider, Chip, IconButton, Tooltip, List, ListItem,
  ListItemText, Avatar, Stack, CircularProgress, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
  Select, MenuItem, Alert, Snackbar
} from '@mui/material';
import { 
  Edit, Delete, ArrowBack, Timer, Restaurant, Share, 
  Favorite, ShoppingCart, Print 
} from '@mui/icons-material';

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

const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [inventories, setInventories] = useState([]);
  const [openGenerateDialog, setOpenGenerateDialog] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchRecipeData = async () => {
      try {
        setLoading(true);
        const [recipeResponse, inventoriesResponse] = await Promise.all([
          recipeService.getById(id),
          inventoryService.getAll()
        ]);
        setRecipe(recipeResponse.data);
        setInventories(inventoriesResponse.data.inventaires || []);
      } catch (error) {
        console.error('Failed to fetch recipe', error);
        navigate('/recettes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipeData();
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
    setSelectedInventoryId('');
    setOpenGenerateDialog(true);
  };

  const handleConfirmGenerateShoppingList = async () => {
    const inventoryId = Number(selectedInventoryId);

    if (!Number.isInteger(inventoryId) || inventoryId <= 0) {
      setFeedback({ type: 'error', message: "Sélectionnez un inventaire valide avant de générer la liste." });
      return;
    }

    try {
      setGenerating(true);
      await shoppingService.generateList(id, inventoryId);
      setOpenGenerateDialog(false);
      navigate('/liste-courses');
    } catch (error) {
      console.error('Failed to generate shopping list', error);
      setFeedback({
        type: 'error',
        message: error.response?.data?.message || "Impossible de générer la liste de courses."
      });
    } finally {
      setGenerating(false);
    }
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
        <Snackbar
          open={Boolean(feedback.message)}
          autoHideDuration={6000}
          onClose={() => setFeedback({ type: '', message: '' })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            severity={feedback.type || 'info'}
            variant="filled"
            onClose={() => setFeedback({ type: '', message: '' })}
          >
            {feedback.message}
          </Alert>
        </Snackbar>

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
            {recipe.image && (
              <Card sx={{ mb: 3 }}>
                <CardMedia
                  component="img"
                  height="320"
                  image={recipe.image}
                  alt={recipe.nom}
                  sx={{ objectFit: 'cover' }}
                />
              </Card>
            )}
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
                    label={`Préparation: ${formatDuration(recipe.temps_preparation)}`} 
                    variant="outlined"
                  />
                  <Chip 
                    icon={<Timer />} 
                    label={`Cuisson: ${formatDuration(recipe.temps_cuisson)}`} 
                    variant="outlined"
                  />
                  <Chip 
                    label={`Total: ${formatDuration(recipe.temps_preparation + recipe.temps_cuisson)}`} 
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
                      alt={recipe.auteur?.nom_utilisateur || 'Auteur'} 
                      src={recipe.auteur?.avatar || undefined}
                      sx={{ width: 40, height: 40, mr: 2, bgcolor: 'primary.main' }}
                    >
                      {recipe.auteur?.nom_utilisateur?.charAt(0).toUpperCase() || '?'}
                    </Avatar>
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

        <Dialog
          open={openGenerateDialog}
          onClose={() => !generating && setOpenGenerateDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Générer une liste de courses</DialogTitle>
          <DialogContent>
            {inventories.length === 0 ? (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Créez d&apos;abord un inventaire avant de générer une liste de courses depuis cette recette.
              </Alert>
            ) : (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="recipe-detail-inventory-label">Inventaire</InputLabel>
                <Select
                  labelId="recipe-detail-inventory-label"
                  value={selectedInventoryId}
                  label="Inventaire"
                  onChange={(event) => setSelectedInventoryId(event.target.value)}
                >
                  {inventories.map((inventory) => (
                    <MenuItem key={inventory.id} value={String(inventory.id)}>
                      {inventory.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenGenerateDialog(false)} disabled={generating}>
              Annuler
            </Button>
            <Button
              onClick={handleConfirmGenerateShoppingList}
              variant="contained"
              disabled={inventories.length === 0 || generating || !selectedInventoryId}
            >
              {generating ? 'Génération...' : 'Générer'}
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default RecipeDetailPage;
