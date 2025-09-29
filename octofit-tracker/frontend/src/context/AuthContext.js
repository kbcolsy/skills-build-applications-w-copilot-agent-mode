import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        try {
          const response = await auth.getProfile();
          setUser(response.data);
        } catch (error) {
          console.error('Error fetching user:', error);
          logout();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await auth.getProfile();
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await auth.login(credentials);
      console.log('Login response:', response.data); // Debug log
      
      // dj-rest-auth returns the token in 'key' field
      const token = response.data.key;
      
      if (token) {
        localStorage.setItem('token', token);
        setToken(token);
        
        // Fetch user profile after login
        await fetchUser();
        
        return { success: true };
      } else {
        return { success: false, error: 'No token received' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || error.response?.data?.non_field_errors?.[0] || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};