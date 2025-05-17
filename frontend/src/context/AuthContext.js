import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  
  // Set token in localStorage and axios headers when it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);
  
  // Load user data when component mounts if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await api.get('/api/profile/');
        setUser(response.data);
      } catch (err) {
        // If token is invalid or expired, log the user out
        console.error('Error loading user:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, [token]);
  
  // Login function
  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/token/', {
        username,
        password
      });
      
      setToken(response.data.access);
      
      // Get user data
      const userResponse = await api.get('/api/profile/');
      setUser(userResponse.data);
      
      return userResponse.data;
    } catch (err) {
      throw err;
    }
  };
  
  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
  };
  
  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
