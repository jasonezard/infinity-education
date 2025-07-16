import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import StudentProfile from './components/StudentProfile';
import AddAnecdotalRecord from './components/AddAnecdotalRecord';
import SkillDeepDive from './components/SkillDeepDive';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Educational green
      light: '#66BB6A',
      dark: '#1B5E20',
    },
    secondary: {
      main: '#FF6B35', // Warm orange
      light: '#FF8A65',
      dark: '#E64A19',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    success: {
      main: '#4CAF50',
    },
    info: {
      main: '#2196F3',
    },
    warning: {
      main: '#FF9800',
    },
    error: {
      main: '#F44336',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Poppins", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      color: '#2E7D32',
    },
    h2: {
      fontWeight: 600,
      color: '#2E7D32',
    },
    h3: {
      fontWeight: 600,
      color: '#2E7D32',
    },
    h4: {
      fontWeight: 600,
      color: '#2E7D32',
    },
    h5: {
      fontWeight: 500,
      color: '#2E7D32',
    },
    h6: {
      fontWeight: 500,
      color: '#388E3C',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)',
          boxShadow: '0 2px 12px rgba(46, 125, 50, 0.3)',
        },
      },
    },
  },
});

const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  requiredRole?: string;
}> = ({ children, requiredRole }) => {
  const { currentUser, userProfile } = useAuth();
  
  if (!currentUser || !userProfile) {
    return <Navigate to="/" replace />;
  }
  
  if (requiredRole && userProfile.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  
  if (!currentUser || !userProfile) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route 
          path="/" 
          element={
            userProfile.role === 'ADMIN' 
              ? <Navigate to="/admin" replace />
              : <Navigate to="/teacher" replace />
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/teacher" 
          element={
            <ProtectedRoute requiredRole="TEACHER">
              <TeacherDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/student/:studentId" 
          element={
            <ProtectedRoute requiredRole="TEACHER">
              <StudentProfile />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/add-record" 
          element={
            <ProtectedRoute requiredRole="TEACHER">
              <AddAnecdotalRecord />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/student/:studentId/skill/:skill" 
          element={
            <ProtectedRoute requiredRole="TEACHER">
              <SkillDeepDive />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
