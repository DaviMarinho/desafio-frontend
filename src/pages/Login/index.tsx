import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!username.trim()) {
      setError('Por favor, informe o usuário');
      return;
    }

    if (!password.trim()) {
      setError('Por favor, informe a senha');
      return;
    }

    setLoading(true);

    try {
      await login(username, password);
      navigate('/noticias', { replace: true });
    } catch (err) {
      setError('Erro ao realizar login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Login
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Entre com suas credenciais para acessar o sistema
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            disabled={loading}
            autoFocus
          />

          <TextField
            fullWidth
            type="password"
            label="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            disabled={loading}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>

          <Typography variant="caption" color="text.secondary" align="center" display="block">
            Dica: Qualquer usuário e senha são aceitos para demonstração
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
