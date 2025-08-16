import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import './Auth.css';

const Auth = () => {
  const [activeTab, setActiveTab] = useState('login');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess } = useToast();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleRegistrationSuccess = () => {
    showSuccess('Registration successful! Please log in to continue.');
    setActiveTab('login');
  };

  if (isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-container">
          <div className="auth-header">
            <h1>Welcome to Code Monk</h1>
            <p>Join our community of passionate developers</p>
          </div>

          <div className="auth-tabs">
            <button
              className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Login
            </button>
            <button
              className={`tab-button ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              Register
            </button>
          </div>

          <div className="auth-content">
            {activeTab === 'login' ? (
              <LoginForm />
            ) : (
              <RegisterForm onSuccess={handleRegistrationSuccess} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
