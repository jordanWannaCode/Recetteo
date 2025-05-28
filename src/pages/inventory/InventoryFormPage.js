import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { inventoryService } from '../../services/api';
import { motion } from 'framer-motion';
import {
  Box, Container, Typography, Button, TextField,
  CircularProgress, Paper, Divider, IconButton,
  Snackbar, Alert
} from '@mui/material';
import { ArrowBack, Save, Delete } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object().shape({
  nom: yup.string().required('Le nom est requis').max(120)
});

const InventoryFormPage = ({ edit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      nom: ''
    }
  });

  useEffect(() => {
    if (edit && id) {
      const fetchInventory = async () => {
        try {
          setLoading(true);
          const response = await inventoryService.getById(id);
          reset({
            nom: response.data.nom
          });
        } catch (error) {
          console.error('Failed to fetch inventory', error);
          setError('Erreur lors du chargement de l\'inventaire');
          navigate('/inventaires');
        } finally {
          setLoading(false);
        }
      };
      
      fetchInventory();
    } else {
      setLoading(false);
    }
  }, [edit, id, reset, navigate]);

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      setError(null);
      
      if (edit && id) {
        await inventoryService.update(id, data);
      } else {
        await inventoryService.create(data);
      }
      
      setSuccess(true);
      // Redirection après un délai pour laisser voir le message de succès
      setTimeout(() => navigate('/inventaires'), 1500);
    } catch (error) {
      console.error('Failed to submit inventory', error);
      setError(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/inventaires')} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            {edit ? 'Modifier l\'inventaire' : 'Nouvel inventaire'}
          </Typography>
        </Box>
        
        <Paper elevation={3} sx={{ p: 4 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="nom"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Nom de l'inventaire"
                  margin="normal"
                  error={!!errors.nom}
                  helperText={errors.nom?.message}
                />
              )}
            />
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              {edit && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => navigate(`/inventaires/${id}`)}
                  sx={{ mr: 2 }}
                >
                  Annuler
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                startIcon={submitting ? <CircularProgress size={20} /> : <Save />}
                disabled={submitting}
                sx={{ px: 4, py: 1.5 }}
              >
                {edit ? 'Mettre à jour' : 'Créer'}
              </Button>
            </Box>
          </form>
        </Paper>

        {/* Notification d'erreur */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>

        {/* Notification de succès */}
        <Snackbar
          open={success}
          autoHideDuration={3000}
          onClose={() => setSuccess(false)}
        >
          <Alert severity="success" onClose={() => setSuccess(false)}>
            {edit ? 'Inventaire mis à jour avec succès' : 'Inventaire créé avec succès'}
          </Alert>
        </Snackbar>
      </motion.div>
    </Container>
  );
};

export default InventoryFormPage;