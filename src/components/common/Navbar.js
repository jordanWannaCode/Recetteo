import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
    AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem,
    IconButton, useScrollTrigger, Slide, Container, Divider,
    TextField, InputAdornment, ClickAwayListener
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Search, 
  AccountCircle,
  ExitToApp,
  Close,
  Person,
  Settings
} from '@mui/icons-material';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Gestion du menu utilisateur
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  
  // Gestion du menu mobile
  const handleMobileMenuOpen = (event) => setMobileMenuAnchorEl(event.currentTarget);
  const handleMobileMenuClose = () => setMobileMenuAnchorEl(null);
  
  // Gestion de la déconnexion
  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/');
  };
  
  // Navigation
  const navigateTo = (path) => {
    navigate(path);
    handleMobileMenuClose();
  };

  // Gestion de la recherche
  const handleSearchClick = () => setSearchOpen(true);
  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      handleSearchClose();
    }
  };

  return (
    <Slide appear={false} direction="down" in={!useScrollTrigger()}>
      <AppBar position="sticky" elevation={1} color="default">
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <Typography 
                variant="h6" 
                component={Link} 
                to="/" 
                sx={{ 
                  textDecoration: 'none', 
                  color: 'inherit',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <motion.div
                  whileHover={{ rotate: 20 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Avatar 
                    src="/logo.png" 
                    alt="Logo" 
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      mr: 1,
                      bgcolor: 'primary.main'
                    }}
                  />
                </motion.div>
                Recetteo
              </Typography>
            </Box>
            
            {/* Navigation principale (masquée pendant la recherche) */}
            {!searchOpen && (
              <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 3 }}>
                <Button component={Link} to="/recettes" sx={{ mx: 1, color: 'text.primary' }}>
                  Recettes
                </Button>
                <Button component={Link} to="/ingredients" sx={{ mx: 1, color: 'text.primary' }}>
                  Ingrédients
                </Button>
                <Button component={Link} to="/inventaires" sx={{ mx: 1, color: 'text.primary' }}>
                  Inventaires
                </Button>
                <Button component={Link} to="/liste-courses" sx={{ mx: 1, color: 'text.primary' }}>
                  Liste de courses
                </Button>
              </Box>
            )}

            {/* Barre de recherche (affichée quand active) */}
            {searchOpen && (
              <ClickAwayListener onClickAway={handleSearchClose}>
                <Box 
                  component="form" 
                  onSubmit={handleSearchSubmit}
                  sx={{ 
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    ml: { xs: 1, md: 3 },
                    mr: 2
                  }}
                >
                  <TextField
                    autoFocus
                    fullWidth
                    variant="outlined"
                    placeholder="Rechercher des recettes, ingrédients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <>
                          {searchQuery && (
                            <IconButton size="small" onClick={() => setSearchQuery('')}>
                              <Close fontSize="small" />
                            </IconButton>
                          )}
                        </>
                      ),
                      sx: {
                        backgroundColor: 'background.paper',
                        borderRadius: 1
                      }
                    }}
                  />
                </Box>
              </ClickAwayListener>
            )}
            
            {/* Actions utilisateur */}
            <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
              {/* Icône recherche (masquée pendant la recherche) */}
              {!searchOpen && (
                <IconButton sx={{ mx: 1 }} onClick={handleSearchClick}>
                  <Search />
                </IconButton>
              )}
              
              {/* Menu utilisateur (connecté) */}
              {user ? (
                <>
                  {!searchOpen && (
                    <IconButton onClick={handleMenuOpen} sx={{ ml: 1 }}>
                      <Avatar 
                        alt={user.nom_utilisateur} 
                        src={user.avatar || "/avatar.jpg"} 
                        sx={{ width: 36, height: 36 }}
                      />
                    </IconButton>
                  )}
                  
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{
                      elevation: 3,
                      sx: {
                        minWidth: 200,
                        overflow: 'visible',
                        mt: 1.5,
                        '&:before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                        },
                      },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <MenuItem onClick={() => navigate('/profile')}>
                      <AccountCircle sx={{ mr: 1.5 }} /> Mon profil
                    </MenuItem>
                    <MenuItem onClick={() => navigate('/settings')}>
                      <Settings sx={{ mr: 1.5 }} /> Paramètres
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <ExitToApp sx={{ mr: 1.5 }} /> Déconnexion
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                /* Boutons connexion (non connecté) */
                !searchOpen && (
                  <>
                    <Button 
                      component={Link} 
                      to="/login" 
                      variant="outlined" 
                      sx={{ mx: 1 }}
                    >
                      Connexion
                    </Button>
                    <Button 
                      component={Link} 
                      to="/register" 
                      variant="contained" 
                      sx={{ ml: 1 }}
                    >
                      Inscription
                    </Button>
                  </>
                )
              )}
              
              {!searchOpen && (
                <IconButton 
                  sx={{ display: { md: 'none' }, ml: 1 }}
                  onClick={handleMobileMenuOpen}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
        
        {/* Menu mobile complet */}
        <Menu
          anchorEl={mobileMenuAnchorEl}
          open={Boolean(mobileMenuAnchorEl)}
          onClose={handleMobileMenuClose}
          sx={{ display: { md: 'none' } }}
          PaperProps={{ sx: { minWidth: 200 } }}
        >
          <MenuItem onClick={() => navigateTo('/recettes')}>Recettes</MenuItem>
          <MenuItem onClick={() => navigateTo('/ingredients')}>Ingrédients</MenuItem>
          <MenuItem onClick={() => navigateTo('/inventaires')}>Inventaires</MenuItem>
          <MenuItem onClick={() => navigateTo('/liste-courses')}>Liste de courses</MenuItem>
          
          {user ? (
            <>
              <Divider />
              <MenuItem onClick={() => navigateTo('/profile')}>
                <AccountCircle sx={{ mr: 1.5 }} /> Profil
              </MenuItem>
              <MenuItem onClick={() => navigateTo('/settings')}>
                <Settings sx={{ mr: 1.5 }} /> Paramètres
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 1.5 }} /> Déconnexion
              </MenuItem>
            </>
          ) : (
            <>
              <Divider />
              <MenuItem onClick={() => navigateTo('/login')}>
                <Person sx={{ mr: 1.5 }} /> Connexion
              </MenuItem>
              <MenuItem onClick={() => navigateTo('/register')}>
                <ExitToApp sx={{ mr: 1.5 }} /> Inscription
              </MenuItem>
            </>
          )}
        </Menu>
      </AppBar>
    </Slide>
  );
};

export default Navbar;