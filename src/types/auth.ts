// Authentication types
import { MembershipTier } from './membership';

export type AuthMode = 'login' | 'signup' | 'reset-password';

export interface User {
  id: string;
  email: string;
  name: string;
  membershipTier: MembershipTier;
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: string;
}

export interface LoginFormProps {
  onToggleMode: () => void;
  onForgotPassword: () => void;
}

export interface SignupFormProps {
  onToggleMode: () => void;
}

export interface ResetPasswordFormProps {
  onBack: () => void;
}
