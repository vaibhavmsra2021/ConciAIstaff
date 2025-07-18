import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type StaffRole = 'admin' | 'electrician' | 'plumber' | 'waiter' | 'housekeeping' | 'maintenance';

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          room_number: string;
          check_in: string;
          check_out: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          room_number: string;
          check_in: string;
          check_out: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          room_number?: string;
          check_in?: string;
          check_out?: string;
          created_at?: string;
        };
      };
      staff_users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: StaffRole;
          password_hash: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role?: StaffRole;
          password_hash: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: StaffRole;
          password_hash?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      request_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          assigned_role: StaffRole;
          keywords: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          assigned_role: StaffRole;
          keywords?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          assigned_role?: StaffRole;
          keywords?: string[];
          created_at?: string;
        };
      };
      requests: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'request' | 'complaint';
          message: string;
          status?: 'pending' | 'in_progress' | 'resolved';
          priority?: 'low' | 'medium' | 'high';
          created_at?: string;
          resolved_at?: string | null;
          category_id?: string | null;
          assigned_to?: string | null;
          assigned_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'request' | 'complaint';
          message?: string;
          status?: 'pending' | 'in_progress' | 'resolved';
          priority?: 'low' | 'medium' | 'high';
          created_at?: string;
          resolved_at?: string | null;
          category_id?: string | null;
          assigned_to?: string | null;
          assigned_at?: string | null;
        };
      };
    };
  };
};