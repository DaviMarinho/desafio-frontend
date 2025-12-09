import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './styles.css';

const Header: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 700,
            }}
          >
            Sistema de Notícias
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button color="inherit" component={Link} to="/">
              Buscar CEP
            </Button>

            {isAuthenticated ? (
              <>
                <Button color="inherit" component={Link} to="/noticias">
                  Notícias
                </Button>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  Olá, {user?.name}
                </Typography>
                <Button
                  color="inherit"
                  onClick={handleLogout}
                  variant="outlined"
                  size="small"
                >
                  Sair
                </Button>
              </>
            ) : (
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
