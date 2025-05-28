import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Box, Container, Typography, TextField, Button, Grid, 
  Paper, Avatar, FormControlLabel, Checkbox 
} from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object().shape({
  nom_utilisateur: yup.string()
    .required('Le nom d\'utilisateur est requis')
    .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
    .max(20, 'Le nom d\'utilisateur ne doit pas dépasser 20 caractères'),
  email: yup.string()
    .required('L\'email est requis')
    .email('Veuillez entrer un email valide'),
  mot_de_passe: yup.string()
    .required('Le mot de passe est requis')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
    ),
  confirmPassword: yup.string()
    .oneOf([yup.ref('mot_de_passe'), null], 'Les mots de passe doivent correspondre')
    .required('La confirmation du mot de passe est requise'),
  acceptTerms: yup.bool()
    .oneOf([true], 'Vous devez accepter les conditions d\'utilisation')
});

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      nom_utilisateur: '',
      email: '',
      mot_de_passe: '',
      confirmPassword: '',
      acceptTerms: false
    }
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      const result = await registerUser({
        nom_utilisateur: data.nom_utilisateur,
        email: data.email,
        mot_de_passe: data.mot_de_passe
      });

      if (!result.success) {
        setError(result.message || 'Échec de l\'inscription');
      }
      // La redirection est déjà gérée dans le contexte Auth
    } catch (err) {
      setError('Une erreur est survenue lors de l\'inscription');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={3} sx={{ 
          mt: 8, 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderRadius: 3
        }}>
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <PersonAddOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Créer un compte
          </Typography>
          
          {error && (
            <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
              {error}
            </Typography>
          )}
          
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
            <Controller
              name="nom_utilisateur"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  id="nom_utilisateur"
                  label="Nom d'utilisateur"
                  autoComplete="username"
                  autoFocus
                  error={!!errors.nom_utilisateur}
                  helperText={errors.nom_utilisateur?.message}
                />
              )}
            />
            
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Adresse Email"
                  autoComplete="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />
            
            <Controller
              name="mot_de_passe"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  name="mot_de_passe"
                  label="Mot de passe"
                  type="password"
                  id="mot_de_passe"
                  autoComplete="new-password"
                  error={!!errors.mot_de_passe}
                  helperText={errors.mot_de_passe?.message}
                />
              )}
            />
            
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirmer le mot de passe"
                  type="password"
                  id="confirmPassword"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                />
              )}
            />
            
            <Controller
              name="acceptTerms"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      color="primary"
                      checked={field.value}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      J'accepte les {' '}
                      <Link to="/terms" style={{ color: 'inherit' }}>
                        conditions d'utilisation
                      </Link>
                    </Typography>
                  }
                />
              )}
            />
            {errors.acceptTerms && (
              <Typography color="error" variant="body2" sx={{ mt: -1, mb: 1 }}>
                {errors.acceptTerms.message}
              </Typography>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: 1.5,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 2
                }
              }}
            >
              {loading ? 'Inscription en cours...' : 'S\'inscrire'}
            </Button>
            
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Typography color="primary">
                    Déjà un compte ? Se connecter
                  </Typography>
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default RegisterPage;