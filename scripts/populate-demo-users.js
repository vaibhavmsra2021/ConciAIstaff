import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const demoUsers = [
  { email: 'admin@hotel.com', name: 'Admin User', role: 'admin' },
  { email: 'electrician@hotel.com', name: 'John Electrician', role: 'electrician' },
  { email: 'plumber@hotel.com', name: 'Mike Plumber', role: 'plumber' },
  { email: 'waiter@hotel.com', name: 'Sarah Waiter', role: 'waiter' },
  { email: 'housekeeping@hotel.com', name: 'Lisa Housekeeping', role: 'housekeeping' },
  { email: 'maintenance@hotel.com', name: 'Tom Maintenance', role: 'maintenance' },
];

async function populateDemoUsers() {
  console.log('Starting to populate demo users...');
  
  try {
    // Hash the password 'admin123'
    const passwordHash = await bcrypt.hash('admin123', 12);
    console.log('Password hashed successfully');
    
    // Check if users already exist
    const { data: existingUsers } = await supabase
      .from('staff_users')
      .select('email');
    
    const existingEmails = existingUsers?.map(user => user.email) || [];
    console.log('Existing users:', existingEmails);
    
    // Filter out users that already exist
    const usersToInsert = demoUsers.filter(user => !existingEmails.includes(user.email));
    
    if (usersToInsert.length === 0) {
      console.log('All demo users already exist in the database');
      return;
    }
    
    console.log(`Inserting ${usersToInsert.length} new demo users...`);
    
    // Insert new users
    const { data, error } = await supabase
      .from('staff_users')
      .insert(
        usersToInsert.map(user => ({
          ...user,
          password_hash: passwordHash,
          is_active: true
        }))
      );
    
    if (error) {
      console.error('Error inserting demo users:', error);
      return;
    }
    
    console.log('Demo users inserted successfully!');
    console.log('You can now log in with:');
    usersToInsert.forEach(user => {
      console.log(`- Email: ${user.email}, Password: admin123, Role: ${user.role}`);
    });
    
  } catch (error) {
    console.error('Error populating demo users:', error);
  }
}

populateDemoUsers();