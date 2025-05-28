import React from 'react';
import { motion } from 'framer-motion';
import { Box, Container, Typography, Button } from '@mui/material';
import { SentimentVeryDissatisfied, Home } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <SentimentVeryDissatisfied sx={{ fontSize: 80, color: 'text.secondary' }} />
        </Box>
        <Typography variant="h2" component="h1" sx={{ mb: 2, fontWeight: 700 }}>
          404 - Page non trouvée
        </Typography>
        <Typography variant="h5" component="h2" sx={{ mb: 4, color: 'text.secondary' }}>
          Oups ! La page que vous recherchez n'existe pas ou a été déplacée.
        </Typography>
        <Button
          component={Link}
          to="/"
          variant="contained"
          size="large"
          startIcon={<Home />}
        >
          Retour à l'accueil
        </Button>
      </motion.div>
    </Container>
  );
};

export default NotFoundPage;