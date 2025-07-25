import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ltxqodqlexvojqqxquew.supabase.co'
const supabaseAnonKey = 'sb_publishable_wQE2WLlEvqE1RqWtNPcxGw_tSpNMwmg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)