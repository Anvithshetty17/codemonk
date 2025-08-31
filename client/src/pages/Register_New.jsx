import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RegisterWithOTP from '../components/auth/RegisterWithOTP';

const Register = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleRegistrationSuccess = () => {
    navigate('/login', { 
      state: { 
        message: 'Registration successful! Please login to continue.',
        from: from 
      } 
    });
  };

  const handleSwitchToLogin = () => {
    navigate('/login', { state: { from } });
  };

  return (
    <RegisterWithOTP 
      onSuccess={handleRegistrationSuccess}
      onSwitchToLogin={handleSwitchToLogin}
    />
  );
};

export default Register;
