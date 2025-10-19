import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import Home from './pages/Home';
import Team from './pages/Team';
import Resources from './pages/Resources';
import Cheatsheets from './pages/Cheatsheets';
import LinkMaterials from './pages/LinkMaterials';
import InterviewEssentials from './pages/InterviewEssentials';
import InterviewEssentialsTest from './pages/InterviewEssentialsTest';
import CampusDrive from './pages/CampusDrive';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Leaderboard from './pages/Leaderboard';
import MentorDashboard from './pages/MentorDashboard';
import TakeExam from './pages/TakeExam';
import ExamScoreboard from './pages/ExamScoreboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Toast from './components/Toast';
import './utils/fontawesome'; // Import Font Awesome configuration

// Component to conditionally render chatbot based on route
function ChatbotWrapper() {
  const location = useLocation();
  const allowedPaths = ['/', '/team', '/resources'];
  
  // Only show chatbot on home, team, and resources pages
  if (allowedPaths.includes(location.pathname)) {
    return <Chatbot />;
  }
  
  return null;
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main>
              <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/team" element={<Team />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/cheatsheets" element={<Cheatsheets />} />
          <Route path="/linkmaterials" element={<LinkMaterials />} />
          <Route path="/interview-essentials" element={<InterviewEssentials />} />
          <Route path="/campus-drive" element={<CampusDrive />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/leaderboard" element={
                  <ProtectedRoute>
                    <Leaderboard />
                  </ProtectedRoute>
                } />
                <Route path="/mentor" element={
                  <ProtectedRoute>
                    <MentorDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                } />
                <Route path="/admin/scoreboard/:examId" element={
                  <AdminRoute>
                    <ExamScoreboard />
                  </AdminRoute>
                } />
                <Route path="/take-exam" element={<TakeExam />} />
              </Routes>
            </main>
            <Toast />
            <ChatbotWrapper />
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
