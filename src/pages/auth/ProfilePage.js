import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import { motion } from 'framer-motion';
import {
  Box, Container, Typography, Avatar, Button, TextField,
  Divider, Paper, Stack, CircularProgress, Alert, Snackbar,
  IconButton
} from '@mui/material';
import { Edit, Save, LockReset, ArrowBack } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';

const profileSchema = yup.object().shape({
  nom_utilisateur: yup.string().required('Le nom d\'utilisateur est requis').max(50),
  email: yup.string().required('L\'email est requis').email('Email invalide'),
});

const passwordSchema = yup.object().shape({
  currentPassword: yup.string().required('Le mot de passe actuel est requis'),
  newPassword: yup.string()
    .required('Le nouveau mot de passe est requis')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
    ),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword'), null], 'Les mots de passe doivent correspondre')
    .required('La confirmation du mot de passe est requise'),
});

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const { 
    control: profileControl, 
    handleSubmit: handleProfileSubmit, 
    reset: resetProfile, 
    formState: { errors: profileErrors } 
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      nom_utilisateur: user?.nom_utilisateur || '',
      email: user?.email || '',
    }
  });

  const { 
    control: passwordControl, 
    handleSubmit: handlePasswordSubmit, 
    reset: resetPassword, 
    formState: { errors: passwordErrors } 
  } = useForm({
    resolver: yupResolver(passwordSchema),
  });

  useEffect(() => {
    resetProfile({
      nom_utilisateur: user?.nom_utilisateur || '',
      email: user?.email || '',
    });
  }, [user, resetProfile]);

  const handleProfileUpdate = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.updateProfile(data);
      updateUser(response.data);
      setEditing(false);
      setSuccess('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Failed to update profile', error);
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (data) => {
    try {
      setLoading(true);
      setError(null);
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      setChangingPassword(false);
      resetPassword();
      setSuccess('Mot de passe changé avec succès');
    } catch (error) {
      console.error('Failed to change password', error);
      setError(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      try {
        setLoading(true);
        await authService.deleteAccount();
        logout();
        navigate('/');
      } catch (error) {
        console.error('Failed to delete account', error);
        setError(error.response?.data?.message || 'Erreur lors de la suppression du compte');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseAlert = () => {
    setError(null);
    setSuccess(null);
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h6" color="error" textAlign="center">
          Vous devez être connecté pour accéder à cette page
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button variant="contained" onClick={() => navigate('/login')}>
            Se connecter
          </Button>
        </Box>
      </Container>
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
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Mon Profil
          </Typography>
        </Box>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>

        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                fontSize: 48,
                bgcolor: 'primary.main',
                mb: 2
              }}
            >
              {user.nom_utilisateur?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h5">
              {user.nom_utilisateur}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Membre depuis {new Date(user.date_inscription).toLocaleDateString()}
            </Typography>
          </Box>

          {!editing ? (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Nom d'utilisateur
                </Typography>
                <Typography>{user.nom_utilisateur}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography>{user.email}</Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => setEditing(true)}
                  disabled={loading}
                >
                  Modifier le profil
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<LockReset />}
                  onClick={() => setChangingPassword(true)}
                  disabled={loading}
                >
                  Changer le mot de passe
                </Button>
              </Box>
            </Stack>
          ) : (
            <form onSubmit={handleProfileSubmit(handleProfileUpdate)}>
              <Stack spacing={3}>
                <Controller
                  name="nom_utilisateur"
                  control={profileControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Nom d'utilisateur"
                      error={!!profileErrors.nom_utilisateur}
                      helperText={profileErrors.nom_utilisateur?.message}
                      disabled={loading}
                    />
                  )}
                />

                <Controller
                  name="email"
                  control={profileControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email"
                      type="email"
                      error={!!profileErrors.email}
                      helperText={profileErrors.email?.message}
                      disabled={loading}
                    />
                  )}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setEditing(false)}
                    sx={{ flex: 1 }}
                    disabled={loading}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    disabled={loading}
                    sx={{ flex: 1 }}
                  >
                    Enregistrer
                  </Button>
                </Box>
              </Stack>
            </form>
          )}
        </Paper>

        {changingPassword && (
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Changer le mot de passe
            </Typography>

            <form onSubmit={handlePasswordSubmit(handlePasswordChange)}>
              <Stack spacing={3}>
                <Controller
                  name="currentPassword"
                  control={passwordControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Mot de passe actuel"
                      type="password"
                      error={!!passwordErrors.currentPassword}
                      helperText={passwordErrors.currentPassword?.message}
                      disabled={loading}
                    />
                  )}
                />

                <Controller
                  name="newPassword"
                  control={passwordControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Nouveau mot de passe"
                      type="password"
                      error={!!passwordErrors.newPassword}
                      helperText={passwordErrors.newPassword?.message}
                      disabled={loading}
                    />
                  )}
                />

                <Controller
                  name="confirmPassword"
                  control={passwordControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Confirmer le nouveau mot de passe"
                      type="password"
                      error={!!passwordErrors.confirmPassword}
                      helperText={passwordErrors.confirmPassword?.message}
                      disabled={loading}
                    />
                  )}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setChangingPassword(false);
                      resetPassword();
                    }}
                    sx={{ flex: 1 }}
                    disabled={loading}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    disabled={loading}
                    sx={{ flex: 1 }}
                  >
                    Enregistrer
                  </Button>
                </Box>
              </Stack>
            </form>
          </Paper>
        )}

        <Divider sx={{ my: 4 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            ID Utilisateur: {user.id}
          </Typography>
          <Button
            variant="text"
            color="error"
            onClick={handleDeleteAccount}
            disabled={loading}
          >
            Supprimer le compte
          </Button>
        </Box>
      </motion.div>
    </Container>
  );
};

export default ProfilePage;