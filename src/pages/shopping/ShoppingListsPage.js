import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shoppingService, recipeService, inventoryService, ingredientService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box, Container, Typography, Button, Grid, Card, CardContent,
    CardHeader, Divider, Chip, IconButton, Tooltip, List, ListItem,
    ListItemText, ListItemSecondaryAction, Checkbox, TextField,
    FormControl, InputLabel, Select, MenuItem, Paper, Stack,
    CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
    Badge, Avatar, CardActions
  } from '@mui/material';
  import { 
    Add, Delete, ShoppingCart, CheckCircle, Cancel,
    ArrowBack, PlaylistAdd, Receipt, Edit
  } from '@mui/icons-material';
  
const ShoppingListsPage = () => {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [openGenerateDialog, setOpenGenerateDialog] = useState(false);
  const [generateData, setGenerateData] = useState({
    recipeId: '',
    inventoryId: ''
  });
  const [newItemDialog, setNewItemDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    ingredientId: '',
    quantity: 1
  });
  const [allIngredients, setAllIngredients] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch shopping lists
        const listsResponse = await shoppingService.getLists();
        setLists(listsResponse.data.listes_courses);
        
        // Fetch recipes, inventories and ingredients if user wants to generate a list
        if (user) {
          const [recipesResponse, inventoriesResponse, ingredientsResponse] = await Promise.all([
            recipeService.getAll(),
            inventoryService.getAll(),
            ingredientService.getAll()
          ]);
          
          setRecipes(recipesResponse.data.recettes);
          setInventories(inventoriesResponse.data.inventaires);
          setAllIngredients(ingredientsResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  const handleCreateList = async () => {
    try {
      const response = await shoppingService.createList();
      setLists([...lists, response.data.liste_courses]);
    } catch (error) {
      console.error('Failed to create list', error);
    }
  };

  const handleDeleteList = async (id) => {
    try {
      await shoppingService.deleteList(id);
      setLists(lists.filter(list => list.id !== id));
      if (selectedList && selectedList.id === id) {
        setSelectedList(null);
      }
    } catch (error) {
      console.error('Failed to delete list', error);
    }
  };

  const handleToggleItem = async (itemId, isChecked) => {
    if (!selectedList) return;
    
    try {
      await shoppingService.updateItem(
        selectedList.id, 
        itemId, 
        { est_achete: isChecked }
      );
      
      setSelectedList({
        ...selectedList,
        items: selectedList.items.map(item => 
          item.id === itemId ? { ...item, est_achete: isChecked } : item
        )
      });
    } catch (error) {
      console.error('Failed to update item', error);
    }
  };

  const handleGenerateList = async () => {
    if (!generateData.recipeId || !generateData.inventoryId) return;
    
    try {
      setGenerating(true);
      const response = await shoppingService.generateList(
        generateData.recipeId,
        generateData.inventoryId
      );
      
      setLists([...lists, response.data.liste_courses]);
      setOpenGenerateDialog(false);
      setGenerateData({ recipeId: '', inventoryId: '' });
    } catch (error) {
      console.error('Failed to generate list', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleViewList = async (id) => {
    try {
      const response = await shoppingService.getList(id);
      setSelectedList(response.data);
    } catch (error) {
      console.error('Failed to fetch list', error);
    }
  };

  const handleAddNewItem = async () => {
    if (!newItem.ingredientId || !selectedList) return;
    
    try {
      await shoppingService.addItem(
        selectedList.id,
        { 
          ingredient_id: newItem.ingredientId,
          quantite: newItem.quantity
        }
      );
      
      // Refresh the list
      const response = await shoppingService.getList(selectedList.id);
      setSelectedList(response.data);
      setNewItemDialog(false);
      setNewItem({ ingredientId: '', quantity: 1 });
    } catch (error) {
      console.error('Failed to add item', error);
    }
  };

  const handleUpdateItemQuantity = async (itemId, newQuantity) => {
    if (!selectedList) return;
    
    try {
      await shoppingService.updateItem(
        selectedList.id,
        itemId,
        { quantite: newQuantity }
      );
      
      setSelectedList({
        ...selectedList,
        items: selectedList.items.map(item => 
          item.id === itemId ? { ...item, quantite: newQuantity } : item
        )
      });
    } catch (error) {
      console.error('Failed to update item quantity', error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!selectedList) return;
    
    try {
      await shoppingService.deleteItem(selectedList.id, itemId);
      setSelectedList({
        ...selectedList,
        items: selectedList.items.filter(item => item.id !== itemId)
      });
    } catch (error) {
      console.error('Failed to remove item', error);
    }
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
      {selectedList ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={() => setSelectedList(null)} sx={{ mr: 1 }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              {selectedList.nom || 'Liste de courses'}
            </Typography>
            
            <Box sx={{ ml: 'auto' }}>
              <Tooltip title="Modifier le nom">
                <IconButton>
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Supprimer la liste">
                <IconButton onClick={() => handleDeleteList(selectedList.id)}>
                  <Delete color="error" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <Card sx={{ mb: 3 }}>
            <CardHeader 
              title="Résumé" 
            />
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Badge 
                    badgeContent={selectedList.items.filter(i => i.est_achete).length} 
                    color="success" 
                    max={999}
                    sx={{ mr: 2 }}
                  >
                    <Typography variant="body1">Achetés</Typography>
                  </Badge>
                  
                  <Badge 
                    badgeContent={selectedList.items.filter(i => !i.est_achete).length} 
                    color="warning" 
                    max={999}
                  >
                    <Typography variant="body1">Restants</Typography>
                  </Badge>
                </Box>
                
                <Typography variant="h6" color="primary">
                  Total: {selectedList.prix_total.toFixed(2)} €
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Créée le: {new Date(selectedList.date_creation).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dernière mise à jour: {selectedList.date_mise_a_jour ? 
                    new Date(selectedList.date_mise_a_jour).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader 
              title="Articles" 
              action={
                <Button 
                  startIcon={<Add />}
                  onClick={() => setNewItemDialog(true)}
                  variant="outlined"
                >
                  Ajouter un article
                </Button>
              }
            />
            <CardContent>
              {selectedList.items.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <ShoppingCart sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Votre liste de courses est vide
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    onClick={() => setNewItemDialog(true)}
                    sx={{ mt: 2 }}
                  >
                    Ajouter un article
                  </Button>
                </Box>
              ) : (
                <List>
                  {selectedList.items.map((item) => (
                    <ListItem 
                      key={item.id} 
                      divider
                      sx={{ 
                        backgroundColor: item.est_achete ? 'action.selected' : 'background.paper',
                        transition: 'background-color 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      <Checkbox
                        edge="start"
                        checked={item.est_achete}
                        onChange={(e) => handleToggleItem(item.id, e.target.checked)}
                        color="primary"
                      />
                      
                      <ListItemText
                        primary={item.ingredient_nom}
                        secondary={`Prix unitaire: ${item.ingredient_item?.prix_unitaire.toFixed(2)} €/${item.unite}`}
                        sx={{ 
                          textDecoration: item.est_achete ? 'line-through' : 'none',
                          color: item.est_achete ? 'text.secondary' : 'text.primary'
                        }}
                      />
                      
                      <TextField
                        type="number"
                        size="small"
                        value={item.quantite}
                        onChange={(e) => handleUpdateItemQuantity(item.id, parseFloat(e.target.value))}
                        sx={{ width: 100, mr: 2 }}
                        InputProps={{
                          endAdornment: item.unite,
                        }}
                      />
                      
                      <Typography variant="body1" sx={{ mr: 2 }}>
                        {item.prix_estime.toFixed(2)} €
                      </Typography>
                      
                      <Tooltip title="Supprimer">
                        <IconButton 
                          edge="end" 
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Delete fontSize="small" color="error" />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
          
          {/* Dialog pour ajouter un nouvel article */}
          <Dialog 
            open={newItemDialog} 
            onClose={() => setNewItemDialog(false)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>Ajouter un nouvel article</DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="ingredient-select-label">Ingrédient</InputLabel>
                  <Select
                    labelId="ingredient-select-label"
                    id="ingredient-select"
                    value={newItem.ingredientId}
                    label="Ingrédient"
                    onChange={(e) => setNewItem({...newItem, ingredientId: e.target.value})}
                  >
                    {allIngredients.map((ingredient) => (
                      <MenuItem key={ingredient.id} value={ingredient.id}>
                        {ingredient.nom} ({ingredient.unite})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  label="Quantité"
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: parseFloat(e.target.value)})}
                  InputProps={{
                    inputProps: { min: 0.1, step: 0.1 }
                  }}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setNewItemDialog(false)}>Annuler</Button>
              <Button 
                onClick={handleAddNewItem} 
                disabled={!newItem.ingredientId}
                variant="contained"
              >
                Ajouter
              </Button>
            </DialogActions>
          </Dialog>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Mes Listes de Courses
            </Typography>
            <Box>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={handleCreateList}
                sx={{ mr: 2 }}
              >
                Nouvelle liste
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<PlaylistAdd />}
                onClick={() => setOpenGenerateDialog(true)}
              >
                Générer depuis recette
              </Button>
            </Box>
          </Box>
          
          {lists.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ShoppingCart sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Vous n'avez aucune liste de courses
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button 
                  variant="contained" 
                  startIcon={<Add />}
                  onClick={handleCreateList}
                >
                  Créer une liste
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<PlaylistAdd />}
                  onClick={() => setOpenGenerateDialog(true)}
                >
                  Générer depuis recette
                </Button>
              </Box>
            </Box>
          ) : (
            <Grid container spacing={3}>
              <AnimatePresence>
                {lists.map((list) => (
                  <Grid item xs={12} sm={6} md={4} key={list.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      whileHover={{ scale: 1.03 }}
                    >
                      <Card 
                        sx={{ 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleViewList(list.id)}
                      >
                        <CardHeader
                          avatar={
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <ShoppingCart />
                            </Avatar>
                          }
                          action={
                            <Tooltip title="Supprimer">
                              <IconButton 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteList(list.id);
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          }
                          title={list.nom || 'Liste sans nom'}
                          subheader={new Date(list.date_creation).toLocaleDateString()}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <Chip 
                              label={`${list.total_items} articles`} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                            <Chip 
                              label={`${list.total_ingredients} ingrédients`} 
                              size="small" 
                              color="secondary" 
                              variant="outlined"
                            />
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            Total estimé: {list.prix_total.toFixed(2)} €
                          </Typography>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'flex-end' }}>
                          <Button 
                            size="small" 
                            startIcon={<Receipt />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewList(list.id);
                            }}
                          >
                            Voir détails
                          </Button>
                        </CardActions>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>
          )}
          
          {/* Dialog pour générer une liste depuis une recette */}
          <Dialog 
            open={openGenerateDialog} 
            onClose={() => setOpenGenerateDialog(false)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>Générer une liste depuis une recette</DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="recipe-select-label">Recette</InputLabel>
                  <Select
                    labelId="recipe-select-label"
                    id="recipe-select"
                    value={generateData.recipeId}
                    label="Recette"
                    onChange={(e) => setGenerateData({...generateData, recipeId: e.target.value})}
                  >
                    {recipes.map((recipe) => (
                      <MenuItem key={recipe.id} value={recipe.id}>{recipe.nom}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="inventory-select-label">Inventaire</InputLabel>
                  <Select
                    labelId="inventory-select-label"
                    id="inventory-select"
                    value={generateData.inventoryId}
                    label="Inventaire"
                    onChange={(e) => setGenerateData({...generateData, inventoryId: e.target.value})}
                  >
                    {inventories.map((inventory) => (
                      <MenuItem key={inventory.id} value={inventory.id}>{inventory.nom}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setOpenGenerateDialog(false)}
                startIcon={<Cancel />}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleGenerateList}
                disabled={!generateData.recipeId || !generateData.inventoryId || generating}
                startIcon={generating ? <CircularProgress size={20} /> : <CheckCircle />}
                variant="contained"
              >
                Générer
              </Button>
            </DialogActions>
          </Dialog>
        </motion.div>
      )}
    </Container>
  );
};

export default ShoppingListsPage;