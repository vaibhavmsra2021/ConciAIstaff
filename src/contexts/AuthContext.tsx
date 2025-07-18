import React, { createContext, useContext, useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';
import { supabase, StaffRole } from '../lib/supabase';

interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  is_active: boolean;
}

interface AuthContextType {
  user: StaffUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const ROLE_PERMISSIONS = {
  admin: ['view_all', 'manage_bookings', 'manage_users', 'manage_requests', 'manage_staff'],
  electrician: ['view_assigned_requests', 'update_requests'],
  plumber: ['view_assigned_requests', 'update_requests'],
  waiter: ['view_assigned_requests', 'update_requests'],
  housekeeping: ['view_assigned_requests', 'update_requests'],
  maintenance: ['view_assigned_requests', 'update_requests'],
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('staff_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login for email:', email);
      
      const { data: users, error } = await supabase
        .from('staff_users')
        .select('*')
        .eq('email', email);

      if (error) {
        console.error('Login error: Supabase query error:', error.message);
        return false;
      }

      if (!users || users.length === 0) {
        console.error('Login error: No user found with email:', email);
        return false;
      }

      const userData = users[0];
      console.log('User found:', { email: userData.email, role: userData.role, is_active: userData.is_active });
      
      if (!userData.is_active) {
        console.error('Login error: User account is inactive for email:', email);
        return false;
      }

      // Verify password
      console.log('Verifying password...');
      const isPasswordValid = await bcrypt.compare(password, userData.password_hash);
      console.log('Password valid:', isPasswordValid);

      if (!isPasswordValid) {
        console.error('Login error: Invalid password for user:', email);
        return false;
      }

      const staffUser: StaffUser = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        is_active: userData.is_active,
      };

      console.log('Login successful for user:', staffUser.name);
      setUser(staffUser);
      localStorage.setItem('staff_user', JSON.stringify(staffUser));
      return true;
    } catch (error) {
      console.error('Login error: Unexpected error during login:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('staff_user');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role]?.includes(permission) || false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};