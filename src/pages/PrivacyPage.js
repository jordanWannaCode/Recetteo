import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const PrivacyPage = () => (
  <Container maxWidth="md" sx={{ py: 4 }}>
    <Box>
      <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 3 }}>
        Politique de confidentialité
      </Typography>

      <Typography paragraph>
        Cette politique explique quelles données sont collectées par Recetteo, comment elles sont utilisées, et quels
        contrôles vous disposez pour les gérer.
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Données collectées
      </Typography>
      <Typography paragraph>
        Nous stockons les informations nécessaires au fonctionnement du service: profil utilisateur (nom, email,
        photo de profil), recettes, ingrédients, inventaires et listes de courses.
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Utilisation des données
      </Typography>
      <Typography paragraph>
        Les données servent uniquement a fournir les fonctionnalités de l'application, notamment la sauvegarde des
        recettes, le partage des recettes publiques et la génération des listes de courses.
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Partage et visibilité
      </Typography>
      <Typography paragraph>
        Les recettes publiques peuvent etre consultées par les utilisateurs autorisés et affichent le nom de leur
        auteur. Les recettes privées restent visibles uniquement par leur auteur.
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Sécurité
      </Typography>
      <Typography paragraph>
        Les accès aux données privées reposent sur une authentification JWT côté API, avec séparation par utilisateur
        sur les parcours protégés.
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Vos droits
      </Typography>
      <Typography paragraph>
        Vous pouvez mettre a jour votre profil, changer votre mot de passe et supprimer votre compte depuis votre
        espace profil. La suppression supprime également les recettes associées.
      </Typography>
    </Box>
  </Container>
);

export default PrivacyPage;
