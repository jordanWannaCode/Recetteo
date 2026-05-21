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
  Person
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
      navigate(`/recettes?search=${encodeURIComponent(searchQuery.trim())}`);
      handleSearchClose();
    }
  };

  return (
    <Slide appear={false} direction="down" in={!useScrollTrigger()}>
      <AppBar position="sticky" elevation={1} color="default">
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 1 }}>

            {/* ── Logo ── */}
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
                mr: { xs: 0, md: 2 },
              }}
            >
              <motion.div whileHover={{ rotate: 20 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Avatar
                  src="/logo.png"
                  alt="Logo"
                  sx={{ width: 36, height: 36, mr: 1, bgcolor: 'primary.main' }}
                />
              </motion.div>
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Recetteo</Box>
            </Typography>

            {/* ── Navigation desktop (pousse les actions à droite) ── */}
            {!searchOpen && (
              <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                <Button component={Link} to="/recettes" sx={{ color: 'text.primary' }}>Recettes</Button>
                <Button component={Link} to="/ingredients" sx={{ color: 'text.primary' }}>Ingrédients</Button>
                <Button component={Link} to="/inventaires" sx={{ color: 'text.primary' }}>Inventaires</Button>
                <Button component={Link} to="/liste-courses" sx={{ color: 'text.primary' }}>Liste de courses</Button>
              </Box>
            )}

            {/* Spacer mobile (quand les liens sont cachés) */}
            {!searchOpen && <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }} />}

            {/* ── Barre de recherche étendue ── */}
            {searchOpen && (
              <ClickAwayListener onClickAway={handleSearchClose}>
                <Box
                  component="form"
                  onSubmit={handleSearchSubmit}
                  sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', mx: 1 }}
                >
                  <TextField
                    autoFocus
                    fullWidth
                    size="small"
                    variant="outlined"
                    placeholder="Rechercher des recettes, ingrédients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                      endAdornment: searchQuery
                        ? <IconButton size="small" onClick={() => setSearchQuery('')}><Close fontSize="small" /></IconButton>
                        : null,
                      sx: { backgroundColor: 'background.paper', borderRadius: 1 },
                    }}
                  />
                </Box>
              </ClickAwayListener>
            )}

            {/* ── Actions côté droit ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, gap: 0.5 }}>

              {/* Icône recherche */}
              {!searchOpen && (
                <IconButton onClick={handleSearchClick}>
                  <Search />
                </IconButton>
              )}

              {/* Connecté : avatar + menu profil */}
              {user ? (
                <>
                  <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
                    <Avatar
                      alt={user.nom_utilisateur}
                      src={user.avatar_url || undefined}
                      sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}
                    >
                      {!user.avatar_url && user.nom_utilisateur?.[0]?.toUpperCase()}
                    </Avatar>
                  </IconButton>

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
                    <MenuItem disabled sx={{ opacity: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700}>{user.nom_utilisateur}</Typography>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                      <AccountCircle sx={{ mr: 1.5 }} /> Mon profil
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <ExitToApp sx={{ mr: 1.5 }} /> Déconnexion
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                /* Non connecté : boutons login/register (desktop) */
                !searchOpen && (
                  <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                    <Button component={Link} to="/login" variant="outlined" size="small">Connexion</Button>
                    <Button component={Link} to="/register" variant="contained" size="small">Inscription</Button>
                  </Box>
                )
              )}

              {/* Hamburger mobile */}
              {!searchOpen && (
                <IconButton
                  sx={{ display: { md: 'none' } }}
                  onClick={handleMobileMenuOpen}
                  aria-label="menu"
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
          
          {user
            ? [
                <Divider key="user-divider-top" />,
                <MenuItem key="user-profile" onClick={() => navigateTo('/profile')}>
                  <AccountCircle sx={{ mr: 1.5 }} /> Profil
                </MenuItem>,
                <Divider key="user-divider-bottom" />,
                <MenuItem key="user-logout" onClick={handleLogout}>
                  <ExitToApp sx={{ mr: 1.5 }} /> Déconnexion
                </MenuItem>,
              ]
            : [
                <Divider key="guest-divider" />,
                <MenuItem key="guest-login" onClick={() => navigateTo('/login')}>
                  <Person sx={{ mr: 1.5 }} /> Connexion
                </MenuItem>,
                <MenuItem key="guest-register" onClick={() => navigateTo('/register')}>
                  <ExitToApp sx={{ mr: 1.5 }} /> Inscription
                </MenuItem>,
              ]}
        </Menu>
      </AppBar>
    </Slide>
  );
};

export default Navbar;
