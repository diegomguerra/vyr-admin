import { createClient } from '@supabase/supabase-js';

const adminOpts = {
  global: {
    headers: {
      'x-admin-token': 'vyr-admin-2026-internal',
    },
  },
};

// Android project (Health Connect)
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  adminOpts,
);

// Apple project (Apple Health)
export const supabaseApple = createClient(
  import.meta.env.VITE_SUPABASE_APPLE_URL,
  import.meta.env.VITE_SUPABASE_APPLE_ANON_KEY,
  adminOpts,
);

/** All project clients with metadata */
export const projects = [
  { client: supabase, platform: 'android', provider: 'health_connect', label: 'Android' },
  { client: supabaseApple, platform: 'apple', provider: 'apple_health', label: 'Apple' },
];
