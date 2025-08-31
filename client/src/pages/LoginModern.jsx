import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';

const Login = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSwitchToRegister = () => {
    navigate('/register', { state: { from } });
  };

  if (isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <LoginForm onSwitchToRegister={handleSwitchToRegister} />
  );
};

export default Login;
