import React from 'react';
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
      description: "Créez, modifiez et organisez vos recettes favorites. Accédez à toutes vos créations en un seul endroit."
    },
    {
      icon: <LocalGroceryStore fontSize="large" color="primary" />,
      title: "Inventaire d'ingrédients",
      description: "Suivez vos stocks d'ingrédients et ne manquez plus jamais rien pour préparer vos plats préférés."
    },
    {
      icon: <ShoppingCart fontSize="large" color="primary" />,
      title: "Listes de courses",
      description: "Générez automatiquement des listes de courses basées sur vos recettes et votre inventaire."
    },
    {
      icon: <ListAlt fontSize="large" color="primary" />,
      title: "Planification de repas",
      description: "Organisez vos repas à l'avance et simplifiez votre routine culinaire au quotidien."
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
                href="/register"
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
                href="/login"
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
                  </CardContent>
                  {user && (
                    <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                      <Button 
                        variant="outlined" 
                        color="primary"
                        size="small"
                        href={
                          index === 0 ? '/recettes' :
                          index === 1 ? '/inventaires' :
                          index === 2 ? '/liste-courses' : '/'
                        }
                      >
                        Essayer maintenant
                      </Button>
                    </CardActions>
                  )}
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
              href="/register"
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
          Consultez notre centre d'aide ou contactez notre équipe de support.
        </Typography>
        <Button 
          variant="outlined" 
          color="primary"
          href="#"
        >
          Contactez-nous
        </Button>
      </Box>
    </Container>
  );
};

export default HomePage;