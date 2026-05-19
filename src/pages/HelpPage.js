import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Card, CardContent, Container, Grid, Typography } from '@mui/material';
import { Inventory2, LocalGroceryStore, RestaurantMenu, ShoppingCart } from '@mui/icons-material';

const helpItems = [
  {
    title: 'Recettes',
    description: "Créez une recette, ajoutez-y des ingrédients, puis consultez sa fiche détaillée depuis la liste des recettes.",
    route: '/recettes',
    icon: <RestaurantMenu color="primary" />
  },
  {
    title: 'Ingrédients',
    description: "Gérez le catalogue d'ingrédients partagé par l'application et utilisez-le dans les recettes et inventaires.",
    route: '/ingredients',
    icon: <LocalGroceryStore color="primary" />
  },
  {
    title: 'Inventaires',
    description: "Créez un inventaire, ajoutez des ingrédients et mettez à jour les quantités disponibles.",
    route: '/inventaires',
    icon: <Inventory2 color="primary" />
  },
  {
    title: 'Listes de courses',
    description: "Créez une liste manuelle ou générez-la depuis une recette et un inventaire.",
    route: '/liste-courses',
    icon: <ShoppingCart color="primary" />
  }
];

const HelpPage = () => (
  <Container maxWidth="lg" sx={{ py: 4 }}>
    <Box sx={{ textAlign: 'center', mb: 5 }}>
      <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
        Centre d'aide
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760, mx: 'auto' }}>
        Cette version de Recetteo expose aujourd&apos;hui quatre parcours principaux entièrement intégrés côté interface:
        recettes, ingrédients, inventaires et listes de courses.
      </Typography>
    </Box>

    <Grid container spacing={3}>
      {helpItems.map((item) => (
        <Grid item xs={12} sm={6} key={item.title}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                {item.icon}
                <Typography variant="h6">{item.title}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {item.description}
              </Typography>
              <Button component={RouterLink} to={item.route} variant="outlined">
                Ouvrir
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Container>
);

export default HelpPage;
