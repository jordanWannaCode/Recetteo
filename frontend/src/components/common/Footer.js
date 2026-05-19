import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Grid, Typography, Link, Divider, Button, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { HelpOutline, MenuBook, PersonAdd } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 6, 
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <motion.div whileHover={{ scale: 1.02 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  style={{ width: 40, height: 40, marginRight: 10 }} 
                />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Recetteo
                </Typography>
              </Box>
            </motion.div>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              L'application ultime pour gérer vos recettes, inventaires et listes de courses.
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <Button component={RouterLink} to="/aide" startIcon={<HelpOutline />} size="small">
                Aide
              </Button>
              <Button component={RouterLink} to="/register" startIcon={<PersonAdd />} size="small">
                Inscription
              </Button>
            </Stack>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Navigation
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link component={RouterLink} to="/recettes" color="text.secondary" sx={{ mb: 1 }}>
                Recettes
              </Link>
              <Link component={RouterLink} to="/ingredients" color="text.secondary" sx={{ mb: 1 }}>
                Ingrédients
              </Link>
              <Link component={RouterLink} to="/inventaires" color="text.secondary" sx={{ mb: 1 }}>
                Inventaires
              </Link>
              <Link component={RouterLink} to="/liste-courses" color="text.secondary" sx={{ mb: 1 }}>
                Liste de courses
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Ressources
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link component={RouterLink} to="/aide" color="text.secondary" sx={{ mb: 1 }}>
                Centre d'aide
              </Link>
              <Link component={RouterLink} to="/aide" color="text.secondary" sx={{ mb: 1 }}>
                FAQ
              </Link>
              <Link component={RouterLink} to="/cookies" color="text.secondary" sx={{ mb: 1 }}>
                Consentement cookies
              </Link>
              <Link component={RouterLink} to="/suppression-compte" color="text.secondary" sx={{ mb: 1 }}>
                Suppression du compte
              </Link>
              <Link component={RouterLink} to="/register" color="text.secondary" sx={{ mb: 1 }}>
                Créer un compte
              </Link>
              <Link component={RouterLink} to="/login" color="text.secondary" sx={{ mb: 1 }}>
                Se connecter
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Démarrer
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Le parcours le plus complet passe par quatre modules déjà intégrés: recettes, ingrédients, inventaires et listes de courses.
            </Typography>
            <Stack spacing={1.5}>
              <Button component={RouterLink} to="/recettes" variant="contained" startIcon={<MenuBook />}>
                Ouvrir les recettes
              </Button>
              <Button component={RouterLink} to="/aide" variant="outlined">
                Consulter l'aide
              </Button>
            </Stack>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Recetteo. Tous droits réservés.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link component={RouterLink} to="/terms" variant="body2" color="text.secondary">
              Conditions d'utilisation
            </Link>
            <Link component={RouterLink} to="/privacy" variant="body2" color="text.secondary">
              Politique de confidentialité
            </Link>
            <Link component={RouterLink} to="/cookies" variant="body2" color="text.secondary">
              Cookies
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
