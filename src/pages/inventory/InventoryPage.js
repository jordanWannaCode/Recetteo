import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Container, Typography, Button, Grid, Card, CardContent,
  CardActions, TextField, IconButton, Tooltip, Chip, Paper,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Add, Search, Delete, Edit, FilterList, Inventory } from '@mui/icons-material';

const InventoryPage = () => {
  const [inventories, setInventories] = useState([]);
  const [filteredInventories, setFilteredInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [inventoryToDelete, setInventoryToDelete] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInventories = async () => {
      try {
        setLoading(true);
        const response = await inventoryService.getAll();
        setInventories(response.data.inventaires);
        setFilteredInventories(response.data.inventaires);
      } catch (error) {
        console.error('Failed to fetch inventories', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInventories();
  }, []);

  useEffect(() => {
    const filtered = inventories.filter(inventory =>
      inventory.nom.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInventories(filtered);
  }, [searchTerm, inventories]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = async () => {
    try {
      await inventoryService.delete(inventoryToDelete.id);
      setInventories(inventories.filter(i => i.id !== inventoryToDelete.id));
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete inventory', error);
    }
  };

  const handleAddInventory = () => {
    navigate('/inventaires/nouveau');
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
            Mes Inventaires
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={handleAddInventory}
          >
            Nouvel inventaire
          </Button>
        </Box>
        
        <Paper sx={{ mb: 4, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher des inventaires..."
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
        
        {filteredInventories.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Inventory sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Vous n'avez aucun inventaire
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<Add />}
              onClick={handleAddInventory}
            >
              Créer un inventaire
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            <AnimatePresence>
              {filteredInventories.map((inventory) => (
                <Grid item xs={12} sm={6} md={4} key={inventory.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.03 }}
                  >
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                          {inventory.nom}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Chip 
                            label={`${inventory.ingredients.length} ingrédients`} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {inventory.utilisateur_id === user?.id ? 'Votre inventaire' : 'Partagé'}
                          </Typography>
                        </Box>
                        
                        <Typography variant="caption" color="text.secondary">
                          Créé le: {new Date(inventory.date_creation).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'flex-end' }}>
                        <Tooltip title="Modifier">
                          <IconButton 
                            onClick={() => navigate(`/inventaires/${inventory.id}/modifier`)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton 
                            onClick={() => {
                              setInventoryToDelete(inventory);
                              setOpenDeleteDialog(true);
                            }}
                            disabled={inventory.utilisateur_id !== user?.id}
                          >
                            <Delete color={inventory.utilisateur_id === user?.id ? "error" : "disabled"} />
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
              Êtes-vous sûr de vouloir supprimer l'inventaire "{inventoryToDelete?.nom}" ?
            </Typography>
            {inventoryToDelete?.ingredients.length > 0 && (
              <Typography color="error" sx={{ mt: 1 }}>
                Attention : Cet inventaire contient {inventoryToDelete?.ingredients.length} ingrédients.
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

export default InventoryPage;