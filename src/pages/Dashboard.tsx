import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  TrendingUp,
  Mic,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Stats {
  totalUsers: number;
  activeBookings: number;
  pendingRequests: number;
  resolvedToday: number;
}

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold mb-2 text-red-600">Access Denied</h2>
          <p className="text-gray-700">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeBookings: 0,
    pendingRequests: 0,
    resolvedToday: 0
  });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch users count
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Fetch active bookings (check-out date >= today)
      const today = new Date().toISOString().split('T')[0];
      const { count: bookingsCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('check_out', today);

      // Fetch pending requests
      const { count: pendingCount } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch resolved requests today
      const { count: resolvedCount } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'resolved')
        .gte('resolved_at', today);

      // Fetch recent requests
      const { data: requests } = await supabase
        .from('requests')
        .select(`
          *,
          users:user_id (name, room_number)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalUsers: usersCount || 0,
        activeBookings: bookingsCount || 0,
        pendingRequests: pendingCount || 0,
        resolvedToday: resolvedCount || 0
      });

      setRecentRequests(requests || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Guests',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Active Bookings',
      value: stats.activeBookings,
      icon: Calendar,
      color: 'bg-teal-500',
      change: '+5%'
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: MessageSquare,
      color: 'bg-yellow-500',
      change: '-8%'
    },
    {
      title: 'Resolved Today',
      value: stats.resolvedToday,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+15%'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Hotel voice assistant management overview</p>
        </div>
        <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-lg shadow-sm border">
          <Mic className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium">Voice Assistant Active</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.change} from last week</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Requests</h3>
            <p className="text-sm text-gray-600">Latest voice assistant interactions</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div key={request.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {request.type === 'complaint' ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <MessageSquare className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {request.users?.name} - Room {request.users?.room_number}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{request.message}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                      <span className={`text-xs font-medium ${getPriorityColor(request.priority)}`}>
                        {request.priority} priority
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-xs text-gray-500">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {new Date(request.created_at).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Voice Assistant Status */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Voice Assistant Status</h3>
            <p className="text-sm text-gray-600">AI system monitoring</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-green-900">AI Model</span>
                </div>
                <span className="text-sm text-green-600">Online</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-green-900">Voice Processing</span>
                </div>
                <span className="text-sm text-green-600">Active</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-green-900">Database Connection</span>
                </div>
                <span className="text-sm text-green-600">Connected</span>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Today's Voice Interactions</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600">Total Queries:</span>
                    <span className="font-semibold ml-1">47</span>
                  </div>
                  <div>
                    <span className="text-blue-600">Avg Response:</span>
                    <span className="font-semibold ml-1">1.2s</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}