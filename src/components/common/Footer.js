import React from 'react';
import { Box, Container, Grid, Typography, Link, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, LinkedIn } from '@mui/icons-material';

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
            <Box sx={{ display: 'flex', gap: 2 }}>
              <motion.div whileHover={{ y: -2 }}>
                <Link href="#" color="inherit">
                  <Facebook />
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }}>
                <Link href="#" color="inherit">
                  <Twitter />
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }}>
                <Link href="#" color="inherit">
                  <Instagram />
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }}>
                <Link href="#" color="inherit">
                  <LinkedIn />
                </Link>
              </motion.div>
            </Box>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Navigation
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link href="/recettes" color="text.secondary" sx={{ mb: 1 }}>
                Recettes
              </Link>
              <Link href="/ingredients" color="text.secondary" sx={{ mb: 1 }}>
                Ingrédients
              </Link>
              <Link href="/inventaires" color="text.secondary" sx={{ mb: 1 }}>
                Inventaires
              </Link>
              <Link href="/liste-courses" color="text.secondary" sx={{ mb: 1 }}>
                Liste de courses
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Ressources
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link href="#" color="text.secondary" sx={{ mb: 1 }}>
                Documentation
              </Link>
              <Link href="#" color="text.secondary" sx={{ mb: 1 }}>
                Blog
              </Link>
              <Link href="#" color="text.secondary" sx={{ mb: 1 }}>
                Tutoriels
              </Link>
              <Link href="#" color="text.secondary" sx={{ mb: 1 }}>
                FAQ
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Newsletter
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Abonnez-vous à notre newsletter pour recevoir les dernières mises à jour.
            </Typography>
            <Box sx={{ display: 'flex' }}>
              <input 
                type="email" 
                placeholder="Votre email" 
                style={{ 
                  flexGrow: 1, 
                  padding: '10px', 
                  border: '1px solid #ccc', 
                  borderRadius: '4px 0 0 4px',
                  fontSize: '14px'
                }} 
              />
              <button 
                style={{ 
                  backgroundColor: '#4a6fa5', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0 16px',
                  borderRadius: '0 4px 4px 0',
                  cursor: 'pointer'
                }}
              >
                S'abonner
              </button>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Recetteo. Tous droits réservés.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="#" variant="body2" color="text.secondary">
              Conditions d'utilisation
            </Link>
            <Link href="#" variant="body2" color="text.secondary">
              Politique de confidentialité
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;