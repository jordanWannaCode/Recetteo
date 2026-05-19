import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const CookiesPage = () => (
  <Container maxWidth="md" sx={{ py: 4 }}>
    <Box>
      <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 3 }}>
        Consentement cookies
      </Typography>

      <Typography paragraph>
        Cette page explique l'usage des cookies et technologies proches sur Recetteo. Nous privilegions un usage
        minimal, limite au fonctionnement du service.
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Cookies essentiels
      </Typography>
      <Typography paragraph>
        Des cookies techniques peuvent etre utilises par le serveur pour assurer la securite, la compatibilite et
        le bon fonctionnement du service. Ils ne peuvent pas etre desactives via l'application.
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Stockage local
      </Typography>
      <Typography paragraph>
        L'authentification est conservee via le stockage local du navigateur. Ce stockage est necessaire pour
        rester connecte et acceder aux fonctions protegees.
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Cookies non essentiels
      </Typography>
      <Typography paragraph>
        Recetteo n'utilise pas de cookies publicitaires. Si des outils de mesure d'audience sont ajoutes, un bandeau
        de consentement apparaitra et vous pourrez choisir d'accepter ou refuser.
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Retrait du consentement
      </Typography>
      <Typography paragraph>
        Vous pouvez supprimer les cookies via les parametres de votre navigateur. La suppression peut entrainer
        une deconnexion et effacer certaines preferences.
      </Typography>
    </Box>
  </Container>
);

export default CookiesPage;
