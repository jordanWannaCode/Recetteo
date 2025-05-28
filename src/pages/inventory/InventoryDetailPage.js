import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { inventoryService, ingredientService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Box, Container, Typography, Button, Grid, Card, CardContent,
  CardHeader, Divider, Chip, IconButton, Tooltip, List, ListItem,
  ListItemText, ListItemSecondaryAction, TextField, Avatar,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Autocomplete, Paper, Stack
} from '@mui/material';
import { 
  Edit, Delete, ArrowBack, Add, Inventory, Kitchen 
} from '@mui/icons-material';

const InventoryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inventory, setInventory] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const inventoryResponse = await inventoryService.getById(id);
        const ingredientsResponse = await ingredientService.getAll();
        
        setInventory(inventoryResponse.data);
        setEditName(inventoryResponse.data.nom);
        setIngredients(ingredientsResponse.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleUpdateInventory = async () => {
    try {
      await inventoryService.update(id, { nom: editName });
      setInventory(prev => ({ ...prev, nom: editName }));
      setEditing(false);
    } catch (error) {
      console.error('Failed to update inventory', error);
    }
  };

  const handleDeleteInventory = async () => {
    try {
      await inventoryService.delete(id);
      navigate('/inventaires');
    } catch (error) {
      console.error('Failed to delete inventory', error);
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const handleAddIngredient = async () => {
    if (!selectedIngredient) return;
    
    try {
      await inventoryService.updateIngredient(
        id,
        selectedIngredient.id,
        { quantite_disponible: quantity }
      );
      
      // Refresh inventory data
      const response = await inventoryService.getById(id);
      setInventory(response.data);
      setOpenAddDialog(false);
      setSelectedIngredient(null);
      setQuantity(1);
    } catch (error) {
      console.error('Failed to add ingredient', error);
    }
  };

  const handleUpdateQuantity = async (ingredientId, newQuantity) => {
    try {
      await inventoryService.updateIngredient(
        id,
        ingredientId,
        { quantite_disponible: newQuantity }
      );
      
      // Update local state
      setInventory(prev => ({
        ...prev,
        ingredients: prev.ingredients.map(item => 
          item.ingredient_id === ingredientId 
            ? { ...item, quantite_disponible: newQuantity } 
            : item
        )
      }));
    } catch (error) {
      console.error('Failed to update quantity', error);
    }
  };

  const handleRemoveIngredient = async (ingredientId) => {
    try {
      await inventoryService.updateIngredient(
        id,
        ingredientId,
        { quantite_disponible: 0 }
      );
      
      // Refresh inventory data
      const response = await inventoryService.getById(id);
      setInventory(response.data);
    } catch (error) {
      console.error('Failed to remove ingredient', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!inventory) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" color="error">
          Inventaire non trouvé
        </Typography>
      </Container>
    );
  }

  // Vérifier si l'utilisateur est le propriétaire
  if (inventory.utilisateur_id !== user?.id) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" color="error">
          Vous n'êtes pas autorisé à accéder à cet inventaire
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
          <IconButton onClick={() => navigate('/inventaires')} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          
          {editing ? (
            <TextField
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              sx={{ mr: 2, flexGrow: 1 }}
            />
          ) : (
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, flexGrow: 1 }}>
              {inventory.nom}
            </Typography>
          )}
          
          <Box>
            {editing ? (
              <>
                <Button 
                  onClick={() => setEditing(false)}
                  sx={{ mr: 1 }}
                >
                  Annuler
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleUpdateInventory}
                >
                  Enregistrer
                </Button>
              </>
            ) : (
              <>
                <Tooltip title="Modifier">
                  <IconButton onClick={() => setEditing(true)} sx={{ mr: 1 }}>
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
                title="Ingrédients en stock" 
                action={
                  <Button 
                    startIcon={<Add />}
                    onClick={() => setOpenAddDialog(true)}
                  >
                    Ajouter
                  </Button>
                }
              />
              <CardContent>
                {inventory.ingredients.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Kitchen sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Votre inventaire est vide
                    </Typography>
                    <Button 
                      variant="contained" 
                      startIcon={<Add />}
                      onClick={() => setOpenAddDialog(true)}
                      sx={{ mt: 2 }}
                    >
                      Ajouter des ingrédients
                    </Button>
                  </Box>
                ) : (
                  <List>
                    {inventory.ingredients.map(item => {
                      const ingredient = ingredients.find(i => i.id === item.ingredient_id);
                      if (!ingredient) return null;
                      
                      return (
                        <ListItem 
                          key={item.ingredient_id} 
                          divider
                          secondaryAction={
                            <IconButton 
                              edge="end" 
                              onClick={() => handleRemoveIngredient(item.ingredient_id)}
                            >
                              <Delete fontSize="small" color="error" />
                            </IconButton>
                          }
                        >
                          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                            {ingredient.nom.charAt(0)}
                          </Avatar>
                          <ListItemText
                            primary={ingredient.nom}
                            secondary={`${ingredient.prix_unitaire} €/${ingredient.unite}`}
                          />
                          <TextField
                            type="number"
                            size="small"
                            value={item.quantite_disponible}
                            onChange={(e) => handleUpdateQuantity(
                              item.ingredient_id, 
                              parseFloat(e.target.value)
                            )}
                            sx={{ width: 100, mr: 2 }}
                            InputProps={{
                              endAdornment: ingredient.unite,
                            }}
                          />
                          <Typography variant="body1">
                            {(ingredient.prix_unitaire * item.quantite_disponible).toFixed(2)} €
                          </Typography>
                        </ListItem>
                      );
                    })}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Statistiques" />
              <CardContent>
                <Stack spacing={2}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Nombre d'ingrédients
                    </Typography>
                    <Typography variant="h4">
                      {inventory.ingredients.length}
                    </Typography>
                  </Paper>
                  
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Valeur totale
                    </Typography>
                    <Typography variant="h4">
                      {inventory.ingredients.reduce((total, item) => {
                        const ingredient = ingredients.find(i => i.id === item.ingredient_id);
                        return total + (ingredient?.prix_unitaire || 0) * item.quantite_disponible;
                      }, 0).toFixed(2)} €
                    </Typography>
                  </Paper>
                  
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Créé le
                    </Typography>
                    <Typography>
                      {new Date(inventory.date_creation).toLocaleDateString()}
                    </Typography>
                  </Paper>
                  
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Dernière mise à jour
                    </Typography>
                    <Typography>
                      {inventory.date_modification 
                        ? new Date(inventory.date_modification).toLocaleDateString() 
                        : 'N/A'}
                    </Typography>
                  </Paper>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Dialog d'ajout d'ingrédient */}
        <Dialog
          open={openAddDialog}
          onClose={() => setOpenAddDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Ajouter un ingrédient</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Autocomplete
                options={ingredients.filter(i => 
                  !inventory.ingredients.some(item => item.ingredient_id === i.id)
                )}
                getOptionLabel={(option) => option.nom}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Sélectionner un ingrédient" 
                    fullWidth 
                  />
                )}
                onChange={(event, value) => setSelectedIngredient(value)}
                sx={{ mb: 3 }}
              />
              
              {selectedIngredient && (
                <TextField
                  fullWidth
                  label="Quantité disponible"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value))}
                  InputProps={{
                    endAdornment: selectedIngredient.unite,
                  }}
                />
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddDialog(false)}>Annuler</Button>
            <Button 
              onClick={handleAddIngredient} 
              disabled={!selectedIngredient}
              variant="contained"
            >
              Ajouter
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Dialog de confirmation de suppression */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
        >
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <Typography>
              Êtes-vous sûr de vouloir supprimer cet inventaire ? Cette action est irréversible.
            </Typography>
            {inventory.ingredients.length > 0 && (
              <Typography color="error" sx={{ mt: 1 }}>
                Attention : Cet inventaire contient {inventory.ingredients.length} ingrédient{inventory.ingredients.length !== 1 ? 's' : ''}.
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Annuler</Button>
            <Button onClick={handleDeleteInventory} color="error">Supprimer</Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default InventoryDetailPage;