import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Search,
  Filter,
  User,
  Calendar,
  UserCog,
  Tag
} from 'lucide-react';
import { supabase, StaffRole } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Request {
  id: string;
  user_id: string;
  type: 'request' | 'complaint';
  message: string;
  status: 'pending' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  resolved_at: string | null;
  category_id: string | null;
  assigned_to: string | null;
  assigned_at: string | null;
  users?: {
    name: string;
    room_number: string;
  };
  request_categories?: {
    name: string;
    assigned_role: StaffRole;
  };
  staff_users?: {
    name: string;
    role: StaffRole;
  };
}

interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  is_active: boolean;
}

export default function Requests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { user, hasPermission } = useAuth();

  useEffect(() => {
    fetchRequests();
    if (hasPermission('manage_requests')) {
      fetchStaffMembers();
    }
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('requests_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'requests' },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchRequests = async () => {
    try {
      let query = supabase
        .from('requests')
        .select(`
          *,
          users:user_id (name, room_number),
          request_categories:category_id (name, assigned_role),
          staff_users:assigned_to (name, role)
        `);

      // If not admin, only show assigned requests
      if (!hasPermission('manage_requests') && user) {
        query = query.eq('assigned_to', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_users')
        .select('id, name, role, is_active')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setStaffMembers(data || []);
    } catch (error) {
      console.error('Error fetching staff members:', error);
    }
  };

  const updateRequestStatus = async (id: string, status: string) => {
    try {
      const updateData: any = { status };
      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('requests')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      fetchRequests();
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  const updateRequestPriority = async (id: string, priority: string) => {
    try {
      const { error } = await supabase
        .from('requests')
        .update({ priority })
        .eq('id', id);

      if (error) throw error;
      fetchRequests();
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const assignRequest = async (requestId: string, staffId: string) => {
    try {
      const { error } = await supabase
        .from('requests')
        .update({ 
          assigned_to: staffId,
          assigned_at: new Date().toISOString(),
          status: 'in_progress'
        })
        .eq('id', requestId);

      if (error) throw error;
      fetchRequests();
    } catch (error) {
      console.error('Error assigning request:', error);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.users?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.users?.room_number.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

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
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Electrical Issues': 'bg-yellow-100 text-yellow-800',
      'Plumbing Issues': 'bg-blue-100 text-blue-800',
      'Room Service': 'bg-green-100 text-green-800',
      'Housekeeping': 'bg-pink-100 text-pink-800',
      'Maintenance': 'bg-orange-100 text-orange-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    return type === 'complaint' ? (
      <AlertCircle className="w-5 h-5 text-red-500" />
    ) : (
      <MessageSquare className="w-5 h-5 text-blue-500" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Requests & Complaints</h1>
          <p className="text-gray-600 mt-1">
            {hasPermission('manage_requests') 
              ? 'Manage all guest requests from voice interactions'
              : 'Your assigned requests and tasks'
            }
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
            <span className="text-sm font-medium text-gray-600">Total: </span>
            <span className="font-bold text-gray-900">{filteredRequests.length}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="request">Requests</option>
            <option value="complaint">Complaints</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="flex-shrink-0">
                  {getTypeIcon(request.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.users?.name} - Room {request.users?.room_number}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${request.type === 'complaint' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                      {request.type}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{request.message}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(request.created_at).toLocaleDateString()}</span>
                      <span>{new Date(request.created_at).toLocaleTimeString()}</span>
                    </div>
                    
                    {request.request_categories && (
                      <div className="flex items-center space-x-1">
                        <Tag className="w-4 h-4" />
                        <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(request.request_categories.name)}`}>
                          {request.request_categories.name}
                        </span>
                      </div>
                    )}
                    
                    {request.staff_users && (
                      <div className="flex items-center space-x-1">
                        <UserCog className="w-4 h-4" />
                        <span>Assigned to: {request.staff_users.name}</span>
                      </div>
                    )}
                    
                    {request.resolved_at && (
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Resolved: {new Date(request.resolved_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-3 ml-4">
                {/* Assignment (Admin only) */}
                {hasPermission('manage_requests') && !request.assigned_to && (
                  <select
                    onChange={(e) => e.target.value && assignRequest(request.id, e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    defaultValue=""
                  >
                    <option value="">Assign to...</option>
                    {staffMembers
                      .filter(staff => 
                        !request.request_categories || 
                        staff.role === request.request_categories.assigned_role ||
                        staff.role === 'admin'
                      )
                      .map(staff => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name} ({staff.role})
                        </option>
                      ))
                    }
                  </select>
                )}

                {/* Status */}
                <select
                  value={request.status}
                  onChange={(e) => updateRequestStatus(request.id, e.target.value)}
                  className={`px-3 py-1 text-sm font-medium rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(request.status)}`}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>

                {/* Priority */}
                {hasPermission('manage_requests') && (
                  <select
                    value={request.priority}
                    onChange={(e) => updateRequestPriority(request.id, e.target.value)}
                    className={`px-3 py-1 text-sm font-medium rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${getPriorityColor(request.priority)}`}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-600">No requests match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}