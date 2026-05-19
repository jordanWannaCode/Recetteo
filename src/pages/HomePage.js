import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Box, Container, Typography, Button, Grid, Card, CardContent,
  CardActions, useTheme, useMediaQuery, Divider, Chip
} from '@mui/material';
import { 
  Restaurant, LocalGroceryStore, ShoppingCart, ListAlt
} from '@mui/icons-material';

const HomePage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const features = [
    {
      icon: <Restaurant fontSize="large" color="primary" />,
      title: "Gestion de recettes",
      description: "Créez, modifiez et consultez vos recettes. Chaque recette peut être détaillée et enrichie avec ses ingrédients.",
      route: "/recettes"
    },
    {
      icon: <ListAlt fontSize="large" color="primary" />,
      title: "Catalogue d'ingrédients",
      description: "Ajoutez, modifiez et consultez les ingrédients disponibles pour construire vos recettes et vos inventaires.",
      route: "/ingredients"
    },
    {
      icon: <LocalGroceryStore fontSize="large" color="primary" />,
      title: "Inventaires",
      description: "Suivez vos stocks, consultez le détail d'un inventaire et mettez à jour les quantités ingrédient par ingrédient.",
      route: "/inventaires"
    },
    {
      icon: <ShoppingCart fontSize="large" color="primary" />,
      title: "Listes de courses",
      description: "Créez des listes manuellement ou générez-les automatiquement à partir d'une recette et d'un inventaire.",
      route: "/liste-courses"
    }
  ];

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box sx={{ 
        py: 8, 
        textAlign: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        borderRadius: 4,
        color: 'white',
        mb: 6,
        px: isMobile ? 2 : 6
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              fontSize: isMobile ? '2.5rem' : '3.5rem'
            }}
          >
            Bienvenue sur Recetteo
          </Typography>
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              mb: 4,
              fontWeight: 400,
              fontSize: isMobile ? '1.2rem' : '1.5rem'
            }}
          >
            L'application ultime pour gérer vos recettes, inventaires et listes de courses
          </Typography>
          
          {!user && (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                color="secondary" 
                size="large"
                component={RouterLink}
                to="/register"
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  fontWeight: 600
                }}
              >
                Commencer maintenant
              </Button>
              <Button 
                variant="outlined" 
                color="inherit" 
                size="large"
                component={RouterLink}
                to="/login"
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  fontWeight: 600
                }}
              >
                Se connecter
              </Button>
            </Box>
          )}
        </motion.div>
      </Box>
      
      {/* Features Section */}
      <Box sx={{ mb: 8 }}>
        <Typography 
          variant="h4" 
          component="h2" 
          sx={{ 
            textAlign: 'center', 
            mb: 6, 
            fontWeight: 600 
          }}
        >
          Découvrez nos fonctionnalités
        </Typography>
        
        <Grid container spacing={4} justifyContent="center">
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
              <motion.div
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%', maxWidth: 345 }}
              >
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 'none'
                }}>
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    textAlign: 'center',
                    px: isMobile ? 1 : 3,
                    py: 4
                  }}>
                    <Box sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: '50%', 
                      backgroundColor: 'primary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3
                    }}>
                      {feature.icon}
                    </Box>
                    <Typography 
                      variant="h5" 
                      component="h3" 
                      sx={{ 
                        mb: 2,
                        fontWeight: 600
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography variant="body1">
                      {feature.description}
                    </Typography>
                    {!user && (
                      <Chip
                        label="Connexion requise"
                        size="small"
                        variant="outlined"
                        sx={{ mt: 2 }}
                      />
                    )}
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                    {user ? (
                      <Button 
                        variant="outlined" 
                        color="primary"
                        size="small"
                        component={RouterLink}
                        to={feature.route}
                      >
                        Ouvrir
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        component={RouterLink}
                        to="/register"
                      >
                        Créer un compte
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* Call to Action */}
      {!user && (
        <>
          <Divider sx={{ my: 6 }} />
          
          <Box sx={{ 
            textAlign: 'center',
            mb: 8
          }}>
            <Typography 
              variant="h4" 
              component="h2" 
              sx={{ 
                mb: 3,
                fontWeight: 600
              }}
            >
              Prêt à commencer ?
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                maxWidth: 600,
                mx: 'auto',
                mb: 4
              }}
            >
              Rejoignez des milliers d'utilisateurs qui simplifient déjà leur gestion culinaire avec Recetteo.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              component={RouterLink}
              to="/register"
              sx={{ 
                px: 6, 
                py: 1.5,
                fontWeight: 600
              }}
            >
              Créer un compte gratuit
            </Button>
          </Box>
        </>
      )}
      
      {/* Contact Section */}
      <Box sx={{ 
        backgroundColor: 'background.paper',
        borderRadius: 4,
        p: 4,
        textAlign: 'center',
        border: '1px solid',
        borderColor: 'divider',
        maxWidth: 800,
        mx: 'auto',
        mb: 4
      }}>
        <Typography 
          variant="h5" 
          component="h3" 
          sx={{ 
            mb: 2,
            fontWeight: 600
          }}
        >
          Vous avez des questions ?
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            maxWidth: 600,
            mx: 'auto',
            mb: 3
          }}
        >
          Consultez le centre d&apos;aide pour retrouver les parcours actuellement disponibles et les points d&apos;entrée utiles.
        </Typography>
        <Button 
          variant="outlined" 
          color="primary"
          component={RouterLink}
          to="/aide"
        >
          Ouvrir le centre d'aide
        </Button>
      </Box>
    </Container>
  );
};

export default HomePage;
