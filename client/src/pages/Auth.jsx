import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center py-16">
      <div className="max-w-6xl mx-auto px-4 w-full">
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8 text-center">
            <h1 className="text-3xl font-bold mb-2 text-white">Welcome to Code Monk</h1>
            <p className="text-white/90 mb-0">Join our community of passionate developers</p>
          </div>

          <div className="flex bg-gray-100">
            <button
              className={`flex-1 p-4 text-base font-medium transition-all duration-300 relative ${
                activeTab === 'login' 
                  ? 'bg-white text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-blue-600' 
                  : 'text-gray-600 hover:bg-white/50 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('login')}
            >
              Login
            </button>
            <button
              className={`flex-1 p-4 text-base font-medium transition-all duration-300 relative ${
                activeTab === 'register' 
                  ? 'bg-white text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-blue-600' 
                  : 'text-gray-600 hover:bg-white/50 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('register')}
            >
              Register
            </button>
          </div>

          <div className="p-8">
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
