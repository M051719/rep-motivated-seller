import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  membershipTier: 'free' | 'pro' | 'enterprise';
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'incomplete';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: (user: User) => {
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (updates: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }));
  },
}));

// Helper function to fetch user profile from database
export const fetchUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name || data.email?.split('@')[0] || 'User',
      membershipTier: data.membership_tier || 'free',
      stripeCustomerId: data.stripe_customer_id,
      subscriptionId: data.subscription_id,
      subscriptionStatus: data.subscription_status,
    };
  } catch (error) {
    console.error('Unexpected error fetching user profile:', error);
    return null;
  }
};
