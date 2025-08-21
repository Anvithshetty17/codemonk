import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faPlus, 
  faSearch, 
  faFilter,
  faCrown,
  faUserTie,
  faCalendarAlt,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';

const Teams = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [teams, setTeams] = useState([]);
  const [userTeams, setUserTeams] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    isActive: true
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    category: 'Web Development',
    maxMembers: 10,
    tags: []
  });

  const categories = [
    'Web Development',
    'Mobile Development', 
    'Data Science',
    'Machine Learning',
    'AI',
    'Cybersecurity',
    'DevOps',
    'UI/UX Design',
    'Game Development',
    'Other'
  ];

  useEffect(() => {
    fetchTeams();
    if (user) {
      fetchUserTeams();
    }
  }, [filters, pagination.page, user]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.category !== 'all' && { category: filters.category }),
        isActive: filters.isActive
      });

      const response = await api.get(`/teams?${params}`);
      if (response.data.success) {
        setTeams(response.data.data.teams);
        setPagination(prev => ({
          ...prev,
          total: response.data.data.pagination.total,
          pages: response.data.data.pagination.pages
        }));
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      showError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTeams = async () => {
    try {
      const response = await api.get('/teams/user/me');
      if (response.data.success) {
        setUserTeams(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user teams:', error);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/teams', newTeam);
      if (response.data.success) {
        showSuccess('Team created successfully!');
        setShowCreateModal(false);
        setNewTeam({
          name: '',
          description: '',
          category: 'Web Development',
          maxMembers: 10,
          tags: []
        });
        fetchTeams();
        fetchUserTeams();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to create team');
    }
  };

  const handleJoinTeam = async (teamId) => {
    try {
      const response = await api.post(`/teams/${teamId}/join`);
      if (response.data.success) {
        showSuccess('Successfully joined the team!');
        fetchTeams();
        fetchUserTeams();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to join team');
    }
  };

  const handleLeaveTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to leave this team?')) {
      return;
    }
    
    try {
      const response = await api.post(`/teams/${teamId}/leave`);
      if (response.data.success) {
        showSuccess('Successfully left the team');
        fetchTeams();
        fetchUserTeams();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to leave team');
    }
  };

  const isUserInTeam = (team) => {
    if (!userTeams.joinedTeams) return false;
    return userTeams.joinedTeams.some(joinedTeam => joinedTeam._id === team._id);
  };

  const isUserMentorOfTeam = (team) => {
    if (!userTeams.mentoredTeams && !userTeams.createdTeams) return false;
    return (
      userTeams.mentoredTeams?.some(mentoredTeam => mentoredTeam._id === team._id) ||
      userTeams.createdTeams?.some(createdTeam => createdTeam._id === team._id)
    );
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const canCreateTeam = user && ['mentor', 'admin'].includes(user.role);

  if (loading && teams.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading teams...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FontAwesomeIcon icon={faUsers} className="text-blue-600" />
              Teams
            </h1>
            <p className="text-gray-600 mt-2">Join teams and collaborate on exciting projects</p>
          </div>
          {canCreateTeam && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} />
              Create Team
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FontAwesomeIcon icon={faSearch} className="mr-2" />
                Search Teams
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by name or description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FontAwesomeIcon icon={faFilter} className="mr-2" />
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.isActive}
                  onChange={(e) => handleFilterChange('isActive', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Show only active teams</span>
              </label>
            </div>
          </div>
        </div>

        {/* Teams Grid */}
        {teams.length === 0 ? (
          <div className="text-center py-12">
            <FontAwesomeIcon icon={faUsers} className="text-gray-300 text-6xl mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No teams found</h3>
            <p className="text-gray-500 mb-6">
              {filters.search || filters.category !== 'all' 
                ? 'Try adjusting your filters to find teams.'
                : 'Be the first to create a team!'
              }
            </p>
            {canCreateTeam && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
              >
                Create First Team
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map(team => (
              <div key={team._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{team.name}</h3>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mb-2">
                      {team.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FontAwesomeIcon icon={faUsers} />
                    <span>{team.memberCount}/{team.maxMembers}</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {team.description || 'No description provided.'}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faCrown} />
                    <span>{team.creator.fullName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>{new Date(team.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {team.tags && team.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {team.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                    {team.tags.length > 3 && (
                      <span className="text-gray-500 text-xs">+{team.tags.length - 3} more</span>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  {isUserMentorOfTeam(team) ? (
                    <span className="text-blue-600 text-sm font-medium flex items-center gap-1">
                      <FontAwesomeIcon icon={faUserTie} />
                      Mentor
                    </span>
                  ) : isUserInTeam(team) ? (
                    <button
                      onClick={() => handleLeaveTeam(team._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-colors duration-200"
                    >
                      Leave Team
                    </button>
                  ) : team.memberCount >= team.maxMembers ? (
                    <span className="text-gray-500 text-sm">Team Full</span>
                  ) : (
                    <button
                      onClick={() => handleJoinTeam(team._id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-colors duration-200"
                      disabled={!user}
                    >
                      Join Team
                    </button>
                  )}
                  
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    team.availableSpots > 3 
                      ? 'bg-green-100 text-green-800' 
                      : team.availableSpots > 0 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {team.availableSpots} spots left
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Create Team Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800">Create New Team</h3>
                <button className="text-gray-500 hover:text-gray-700 text-2xl" onClick={() => setShowCreateModal(false)}>×</button>
              </div>
              
              <form className="p-6 space-y-4" onSubmit={handleCreateTeam}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Team Name *</label>
                  <input
                    type="text"
                    id="name"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Enter team name..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      id="category"
                      value={newTeam.category}
                      onChange={(e) => setNewTeam(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700 mb-1">Max Members</label>
                    <input
                      type="number"
                      id="maxMembers"
                      min="1"
                      max="50"
                      value={newTeam.maxMembers}
                      onChange={(e) => setNewTeam(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    id="description"
                    value={newTeam.description}
                    onChange={(e) => setNewTeam(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="4"
                    placeholder="Describe your team's goals and what you'll be working on..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button" 
                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
                  >
                    Create Team
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Teams;
