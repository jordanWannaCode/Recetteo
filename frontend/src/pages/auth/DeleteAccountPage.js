import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Container,
  Typography,
  Paper,
  Alert,
  TextField,
  Button,
  Stack,
  FormControlLabel,
  Checkbox
} from '@mui/material';

const DeleteAccountPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canDelete = confirmed && confirmText.trim().toUpperCase() === 'SUPPRIMER';

  const handleDelete = async () => {
    if (!canDelete) return;
    try {
      setLoading(true);
      setError('');
      await authService.deleteAccount();
      logout();
      navigate('/');
    } catch (err) {
      console.error('Failed to delete account', err);
      setError(err.response?.data?.message || 'Erreur lors de la suppression du compte.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Vous devez etre connecte pour supprimer votre compte.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/login')}>
          Se connecter
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 3 }}>
        Droit a l'effacement
      </Typography>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Alert severity="error">
            La suppression est definitive. Vos recettes, inventaires, listes de courses et images seront effaces.
          </Alert>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Compte concerne
            </Typography>
            <Typography>{user.nom_utilisateur} ({user.email})</Typography>
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
              />
            }
            label="Je comprends que cette action est irreversible"
          />

          <TextField
            label="Tapez SUPPRIMER pour confirmer"
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            fullWidth
          />

          {error && <Alert severity="warning">{error}</Alert>}

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => navigate('/profile')} disabled={loading}>
              Annuler
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
              disabled={!canDelete || loading}
            >
              {loading ? 'Suppression...' : 'Supprimer mon compte'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};

export default DeleteAccountPage;
