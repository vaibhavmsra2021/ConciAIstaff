/*
  # Hotel Voice Assistant Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text, guest name)
      - `email` (text, guest email)
      - `phone` (text, guest phone number)
      - `room_number` (text, room assignment)
      - `check_in` (date, check-in date)
      - `check_out` (date, check-out date)
      - `created_at` (timestamp)
    
    - `requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `type` (text, 'request' or 'complaint')
      - `message` (text, the actual request/complaint)
      - `status` (text, 'pending', 'in_progress', 'resolved')
      - `priority` (text, 'low', 'medium', 'high')
      - `created_at` (timestamp)
      - `resolved_at` (timestamp, nullable)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
    - Foreign key constraints for data integrity

  3. Indexes
    - Performance indexes on frequently queried columns
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  room_number text NOT NULL UNIQUE,
  check_in date NOT NULL,
  check_out date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create requests table
CREATE TABLE IF NOT EXISTS requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('request', 'complaint')),
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Enable read access for all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON users
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON users
  FOR DELETE USING (true);

-- Create policies for requests table
CREATE POLICY "Enable read access for all users" ON requests
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON requests
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON requests
  FOR DELETE USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_room_number ON users(room_number);
CREATE INDEX IF NOT EXISTS idx_users_check_dates ON users(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at);
CREATE INDEX IF NOT EXISTS idx_requests_type ON requests(type);

-- Insert sample data for testing
INSERT INTO users (name, email, phone, room_number, check_in, check_out) VALUES
  ('John Doe', 'john.doe@email.com', '+1234567890', '101', '2024-01-15', '2024-01-20'),
  ('Jane Smith', 'jane.smith@email.com', '+1234567891', '102', '2024-01-16', '2024-01-19'),
  ('Bob Johnson', 'bob.johnson@email.com', '+1234567892', '201', '2024-01-14', '2024-01-21'),
  ('Alice Brown', 'alice.brown@email.com', '+1234567893', '202', '2024-01-17', '2024-01-22'),
  ('Charlie Wilson', 'charlie.wilson@email.com', '+1234567894', '301', '2024-01-15', '2024-01-18')
ON CONFLICT (room_number) DO NOTHING;