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
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
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
