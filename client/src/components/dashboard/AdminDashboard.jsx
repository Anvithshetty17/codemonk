import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faTasks, 
  faBuilding,
  faChartLine,
  faEye,
  faEdit,
  faTrash,
  faPlus,
  faUserShield,
  faUserGraduate,
  faCheck,
  faTimes,
  faCalendarAlt,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

// Import existing admin components
import AnnouncementsManager from '../admin/AnnouncementsManager';
import MaterialsManager from '../admin/MaterialsManager';
import MembersManager from '../admin/MembersManager';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeams: 0,
    totalTasks: 0,
    pendingReviews: 0,
    activeMembers: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch multiple endpoints to build comprehensive stats
      const [usersRes, teamsRes, tasksRes] = await Promise.all([
        api.get('/users'),
        api.get('/teams'),
        api.get('/tasks')
      ]);

      if (usersRes.data.success && teamsRes.data.success && tasksRes.data.success) {
        const users = usersRes.data.data.users || [];
        const teams = teamsRes.data.data.teams || [];
        const tasks = tasksRes.data.data.tasks || [];

        // Calculate pending reviews
        const pendingReviews = tasks.reduce((total, task) => {
          const pendingSubmissions = task.submissions?.filter(sub => sub.status === 'submitted') || [];
          return total + pendingSubmissions.length;
        }, 0);

        setStats({
          totalUsers: users.length,
          totalTeams: teams.length,
          totalTasks: tasks.length,
          pendingReviews,
          activeMembers: users.filter(u => u.role !== 'admin').length,
          recentActivities: [
            ...teams.slice(-5).map(team => ({
              id: team._id,
              type: 'team_created',
              message: `Team "${team.name}" was created`,
              date: team.createdAt,
              user: team.creator?.fullName || 'Unknown'
            })),
            ...tasks.slice(-5).map(task => ({
              id: task._id,
              type: 'task_created',
              message: `Task "${task.title}" was assigned`,
              date: task.createdAt,
              user: task.creator?.fullName || 'Unknown'
            }))
          ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10)
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      showError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color = 'blue', subText }) => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subText && <p className="text-sm text-gray-500 mt-1">{subText}</p>}
        </div>
        <FontAwesomeIcon 
          icon={icon} 
          className={`text-${color}-600 text-2xl`} 
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading admin dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
            <p className="text-blue-100">
              Welcome back, {user?.fullName}. Here's what's happening in your organization.
            </p>
          </div>
          <FontAwesomeIcon icon={faUserShield} className="text-4xl text-blue-200" />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: faChartLine },
              { id: 'announcements', label: 'Announcements', icon: faBuilding },
              { id: 'materials', label: 'Materials', icon: faTasks },
              { id: 'members', label: 'Members', icon: faUsers }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers}
                  icon={faUsers}
                  color="blue"
                  subText="All registered users"
                />
                <StatCard
                  title="Active Teams"
                  value={stats.totalTeams}
                  icon={faBuilding}
                  color="green"
                  subText="Learning teams"
                />
                <StatCard
                  title="Total Tasks"
                  value={stats.totalTasks}
                  icon={faTasks}
                  color="purple"
                  subText="Assigned tasks"
                />
                <StatCard
                  title="Pending Reviews"
                  value={stats.pendingReviews}
                  icon={faExclamationTriangle}
                  color="orange"
                  subText="Need attention"
                />
                <StatCard
                  title="Students & Mentors"
                  value={stats.activeMembers}
                  icon={faUserGraduate}
                  color="indigo"
                  subText="Active learners"
                />
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <a
                    href="/teams"
                    className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 transition-colors duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon icon={faBuilding} className="text-blue-600 text-xl" />
                      <div>
                        <h4 className="font-medium text-gray-900 group-hover:text-blue-900">Manage Teams</h4>
                        <p className="text-sm text-gray-600">View and organize learning teams</p>
                      </div>
                    </div>
                  </a>
                  
                  <a
                    href="/tasks"
                    className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 transition-colors duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon icon={faTasks} className="text-green-600 text-xl" />
                      <div>
                        <h4 className="font-medium text-gray-900 group-hover:text-green-900">Review Tasks</h4>
                        <p className="text-sm text-gray-600">Monitor task progress and submissions</p>
                      </div>
                    </div>
                  </a>
                  
                  <button
                    onClick={() => setActiveTab('members')}
                    className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 transition-colors duration-200 group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon icon={faUsers} className="text-purple-600 text-xl" />
                      <div>
                        <h4 className="font-medium text-gray-900 group-hover:text-purple-900">User Management</h4>
                        <p className="text-sm text-gray-600">Add and manage platform users</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Platform Activity</h3>
                {stats.recentActivities.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent activities to display</p>
                ) : (
                  <div className="space-y-3">
                    {stats.recentActivities.map((activity, index) => (
                      <div key={activity.id || index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <FontAwesomeIcon 
                          icon={activity.type === 'team_created' ? faBuilding : faTasks} 
                          className={`text-sm mt-1 ${
                            activity.type === 'team_created' ? 'text-blue-600' : 'text-green-600'
                          }`} 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{activity.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-500">by {activity.user}</p>
                            <span className="text-xs text-gray-400">•</span>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* System Health */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">System Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <FontAwesomeIcon icon={faCheck} className="text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-900">All Systems Operational</p>
                      <p className="text-xs text-green-700">Platform running smoothly</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <FontAwesomeIcon icon={faUsers} className="text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">User Engagement</p>
                      <p className="text-xs text-blue-700">Active learning community</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <FontAwesomeIcon icon={faChartLine} className="text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-purple-900">Growth Metrics</p>
                      <p className="text-xs text-purple-700">Steady platform growth</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'announcements' && <AnnouncementsManager />}
          {activeTab === 'materials' && <MaterialsManager />}
          {activeTab === 'members' && <MembersManager />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
