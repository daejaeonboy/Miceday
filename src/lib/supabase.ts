import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mnxsvjrqrayhbcmhwddz.supabase.co';
const supabaseAnonKey = 'sb_publishable_ed3YwBi-h_8cxpx5YO2lXQ_RhNhtvpv';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
