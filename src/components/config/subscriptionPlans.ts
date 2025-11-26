export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free Plan',
    price: 0,
    interval: 'forever',
    // ... existing config
    stripe_price_id: null
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 97,
    interval: 'month',
    // ... existing config
    stripe_price_id: 'price_1234567890_test' // Use test price ID
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise', 
    price: 297,
    interval: 'month',
    // ... existing config
    stripe_price_id: 'price_0987654321_test' // Use test price ID
  }
};