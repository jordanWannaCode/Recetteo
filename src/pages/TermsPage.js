import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const TermsPage = () => (
  <Container maxWidth="md" sx={{ py: 4 }}>
    <Box>
      <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 3 }}>
        Conditions d&apos;utilisation
      </Typography>

      <Typography paragraph>
        Recetteo est une application de gestion culinaire. En utilisant le service, vous acceptez les conditions
        ci-dessous.
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Accès au service
      </Typography>
      <Typography paragraph>
        L&apos;accès aux fonctionnalités principales nécessite un compte. Vous etes responsable de la confidentialité de vos
        identifiants.
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Contenu utilisateur
      </Typography>
      <Typography paragraph>
        Vous restez responsable des données que vous saisissez (recettes, images, listes). Vous vous engagez a ne pas
        publier de contenu illicite ou offensant.
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Recettes publiques
      </Typography>
      <Typography paragraph>
        Les recettes marquées comme publiques sont visibles par d&apos;autres utilisateurs et affichent le nom de leur
        auteur. Vous pouvez modifier leur visibilité a tout moment.
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Limitation de responsabilité
      </Typography>
      <Typography paragraph>
        Recetteo est fourni en l&apos;etat. Nous faisons de notre mieux pour assurer la disponibilité du service, sans
        garantie de fonctionnement ininterrompu.
      </Typography>
    </Box>
  </Container>
);

export default TermsPage;
