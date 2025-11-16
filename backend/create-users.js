import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function createUsers() {
  const users = [
    { email: 'personal@jpcc.church', password: 'personal123', role: 'personal' },
    { email: 'attendance@jpcc.church', password: 'attendance123', role: 'attendance' },
    { email: 'reports@jpcc.church', password: 'reports123', role: 'logsandreports' }
  ];

  for (const user of users) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        user_metadata: { role: user.role },
        email_confirm: true // This confirms the email automatically
      });

      if (error) {
        console.log('Error creating user', user.email, ':', error.message);
      } else {
        console.log('Created user:', user.email);
      }
    } catch (err) {
      console.log('Unexpected error for', user.email, ':', err.message);
    }
  }
}

createUsers();
