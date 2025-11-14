import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

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

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login for:', email);
      const response = await authAPI.login({ email, password });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      console.log('✅ Login successful:', userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ Login failed:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Login failed';
      console.log('📋 Error details:', error.response?.data);
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('👤 Attempting registration for:', userData.email);
      console.log('📦 Registration data:', { ...userData, password: '***' }); // Hide password in logs
      
      const response = await authAPI.register(userData);
      const { token: newToken, user: registeredUser } = response.data; // FIXED: Changed variable name
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(registeredUser); // FIXED: Using the new variable name
      
      console.log('✅ Registration successful:', registeredUser);
      return { success: true, user: registeredUser };
    } catch (error) {
      console.error('❌ Registration failed:', error);
      console.log('📋 Full error object:', error);
      console.log('📋 Error response:', error.response);
      console.log('📋 Error data:', error.response?.data);
      console.log('📋 Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Registration failed';
      
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  };

  const logout = () => {
    console.log('🚪 Logging out user');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const checkAuth = async () => {
    if (token) {
      try {
        console.log('🔍 Checking authentication status');
        const response = await authAPI.getMe();
        setUser(response.data);
        console.log('✅ User authenticated:', response.data);
      } catch (error) {
        console.error('❌ Auth check failed:', error);
        localStorage.removeItem('token');
        setToken(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};