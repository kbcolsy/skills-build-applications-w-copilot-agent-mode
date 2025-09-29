import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const PrivateRoute = ({ children, userType }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userType && user.user_type !== userType) {
    // Redirect to appropriate dashboard based on user type
    const redirectPath = user.user_type === 'teacher' ? '/admin' : '/student';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default PrivateRoute;