/*
  # Staff Roles and Authentication System

  1. New Tables
    - `staff_users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `role` (enum: admin, electrician, plumber, waiter, housekeeping, maintenance)
      - `password_hash` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)
    
    - `request_categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `assigned_role` (text)
      - `keywords` (text array)

  2. Modified Tables
    - `requests` - Add category_id, assigned_to, assigned_at columns

  3. Security
    - Enable RLS on all tables
    - Add policies for role-based access
*/

-- Create enum for staff roles
CREATE TYPE staff_role AS ENUM ('admin', 'electrician', 'plumber', 'waiter', 'housekeeping', 'maintenance');

-- Create staff_users table
CREATE TABLE IF NOT EXISTS staff_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role staff_role NOT NULL DEFAULT 'waiter',
  password_hash text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create request_categories table
CREATE TABLE IF NOT EXISTS request_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  assigned_role staff_role NOT NULL,
  keywords text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Add new columns to requests table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'requests' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE requests ADD COLUMN category_id uuid REFERENCES request_categories(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'requests' AND column_name = 'assigned_to'
  ) THEN
    ALTER TABLE requests ADD COLUMN assigned_to uuid REFERENCES staff_users(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'requests' AND column_name = 'assigned_at'
  ) THEN
    ALTER TABLE requests ADD COLUMN assigned_at timestamptz;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for staff_users
CREATE POLICY "Staff users can read own data"
  ON staff_users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage staff users"
  ON staff_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for request_categories
CREATE POLICY "All staff can read categories"
  ON request_categories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage categories"
  ON request_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Update requests policies
DROP POLICY IF EXISTS "Enable read access for all users" ON requests;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON requests;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON requests;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON requests;

CREATE POLICY "Staff can read relevant requests"
  ON requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_users s
      WHERE s.id = auth.uid() 
      AND (
        s.role = 'admin' OR 
        requests.assigned_to = s.id OR
        requests.assigned_to IS NULL
      )
    )
  );

CREATE POLICY "Staff can update assigned requests"
  ON requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_users s
      WHERE s.id = auth.uid() 
      AND (
        s.role = 'admin' OR 
        requests.assigned_to = s.id
      )
    )
  );

CREATE POLICY "System can insert requests"
  ON requests
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert default categories
INSERT INTO request_categories (name, description, assigned_role, keywords) VALUES
('Electrical Issues', 'Problems with electrical appliances, lighting, power outlets', 'electrician', ARRAY['light', 'electricity', 'power', 'outlet', 'electrical', 'bulb', 'switch', 'fan', 'ac', 'air conditioning', 'heater', 'socket']),
('Plumbing Issues', 'Water-related problems, leaks, drainage issues', 'plumber', ARRAY['water', 'leak', 'pipe', 'toilet', 'shower', 'faucet', 'drain', 'plumbing', 'bathroom', 'sink', 'hot water', 'cold water']),
('Room Service', 'Food orders, dining requests, menu inquiries', 'waiter', ARRAY['food', 'menu', 'order', 'dining', 'restaurant', 'meal', 'breakfast', 'lunch', 'dinner', 'drink', 'beverage', 'room service']),
('Housekeeping', 'Cleaning, towels, bed linens, room maintenance', 'housekeeping', ARRAY['clean', 'towel', 'bed', 'sheet', 'pillow', 'housekeeping', 'vacuum', 'trash', 'laundry', 'blanket', 'room cleaning']),
('Maintenance', 'General repairs, furniture issues, room fixtures', 'maintenance', ARRAY['repair', 'fix', 'broken', 'furniture', 'door', 'window', 'lock', 'maintenance', 'table', 'chair', 'closet', 'safe']);

-- Insert default admin user (password: admin123)
INSERT INTO staff_users (email, name, role, password_hash) VALUES
('admin@hotel.com', 'Hotel Administrator', 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXwtO5S7ZOvK');

-- Insert sample staff users
INSERT INTO staff_users (email, name, role, password_hash) VALUES
('electrician@hotel.com', 'John Smith', 'electrician', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXwtO5S7ZOvK'),
('plumber@hotel.com', 'Mike Johnson', 'plumber', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXwtO5S7ZOvK'),
('waiter@hotel.com', 'Sarah Wilson', 'waiter', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXwtO5S7ZOvK'),
('housekeeping@hotel.com', 'Maria Garcia', 'housekeeping', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXwtO5S7ZOvK'),
('maintenance@hotel.com', 'David Brown', 'maintenance', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXwtO5S7ZOvK');

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_users_email ON staff_users(email);
CREATE INDEX IF NOT EXISTS idx_staff_users_role ON staff_users(role);
CREATE INDEX IF NOT EXISTS idx_requests_assigned_to ON requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_requests_category_id ON requests(category_id);
CREATE INDEX IF NOT EXISTS idx_request_categories_role ON request_categories(assigned_role);