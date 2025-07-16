import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
    } catch (error) {
      setError('Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setGoogleLoading(true);
      await loginWithGoogle();
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Pop-up was blocked. Please allow pop-ups and try again.');
      } else {
        setError('Failed to sign in with Google. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(135deg, #E8F5E8 0%, #F8F9FA 50%, #FFF3E0 100%)',
        backgroundImage: `url('/images/education-hero.svg')`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.85)',
          zIndex: 1,
        }
      }}
    >
      <Paper 
        elevation={6} 
        sx={{ 
          p: 4, 
          maxWidth: 450, 
          width: '100%', 
          zIndex: 2,
          position: 'relative',
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <img 
            src="/images/learning-icon.svg" 
            alt="Infinity Education" 
            style={{ width: 80, height: 80, marginBottom: 16 }}
          />
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2E7D32 30%, #66BB6A 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Infinity Education
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
            Empowering Learning Through Technology
          </Typography>
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {/* Google Sign-In Button */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={googleLoading ? <CircularProgress size={20} /> : <GoogleIcon />}
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          sx={{ 
            mb: 3,
            py: 1.5,
            borderRadius: 2,
            borderColor: '#4285f4',
            color: '#4285f4',
            fontWeight: 500,
            '&:hover': {
              borderColor: '#357ae8',
              backgroundColor: 'rgba(66, 133, 244, 0.04)',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(66, 133, 244, 0.2)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          {googleLoading ? 'Signing in...' : 'Continue with Google'}
        </Button>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ 
              mt: 3, 
              mb: 2,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 500,
              background: 'linear-gradient(45deg, #2E7D32 30%, #66BB6A 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1B5E20 30%, #4CAF50 90%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)'
              },
              transition: 'all 0.3s ease'
            }}
            disabled={loading || googleLoading}
          >
            {loading ? <CircularProgress size={24} /> : 'Log In with Email'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;