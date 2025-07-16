import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Avatar
} from '@mui/material';
import { 
  AccountCircle,
  Dashboard as DashboardIcon,
  Add as AddIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  MenuBook as MenuBookIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleClose();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <SchoolIcon sx={{ mr: 1, fontSize: 28 }} />
            <Typography variant="h5" component="div" sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #FFF 30%, #E8F5E8 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Infinity Education
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          
          {userProfile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Navigation buttons based on role */}
              {userProfile.role === 'ADMIN' && (
                <Button
                  color="inherit"
                  startIcon={<DashboardIcon />}
                  onClick={() => navigate('/admin')}
                  sx={{ 
                    mr: 1,
                    borderRadius: 2,
                    bgcolor: isActive('/admin') ? 'rgba(255,255,255,0.15)' : 'transparent',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                    }
                  }}
                >
                  Admin Dashboard
                </Button>
              )}
              
              {userProfile.role === 'TEACHER' && (
                <>
                  <Button
                    color="inherit"
                    startIcon={<DashboardIcon />}
                    onClick={() => navigate('/teacher')}
                    sx={{ 
                      mr: 1,
                      borderRadius: 2,
                      bgcolor: isActive('/teacher') ? 'rgba(255,255,255,0.15)' : 'transparent',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                      }
                    }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={<MenuBookIcon />}
                    onClick={() => navigate('/add-record')}
                    sx={{ 
                      mr: 1,
                      borderRadius: 2,
                      bgcolor: isActive('/add-record') ? 'rgba(255,255,255,0.15)' : 'transparent',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                      }
                    }}
                  >
                    Add Record
                  </Button>
                </>
              )}
              
              {/* User menu */}
              <Box sx={{ ml: 2 }}>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                  sx={{
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                    }
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'inherit',
                      fontSize: 16
                    }}
                  >
                    {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem disabled>
                    <Typography variant="body2">
                      {userProfile.name} ({userProfile.role})
                    </Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </Box>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;