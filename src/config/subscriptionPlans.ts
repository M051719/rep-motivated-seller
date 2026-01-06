export const SUBSCRIPTION_PLANS = {
  free: {
    name: "Free",
    price: 0,
    interval: "month",
    description: "Perfect for getting started with foreclosure assistance",
    features: [
      "50 API credits per month",
      "Access to education resources",
      "Basic property search",
      "Knowledge base access",
      "Community support",
      "Email support",
    ],
    apiCredits: 50,
    limits: {
      properties: 10,
      savedSearches: 3,
      exportLimit: 5,
      directMailCampaigns: 0,
      templates: 5,
    },
    popular: false,
  },
  entrepreneur: {
    name: "Entrepreneur",
    price: 29,
    interval: "month",
    description: "Great for individual investors and small teams",
    features: [
      "200 API credits per month",
      "All Free features",
      "Advanced property search",
      "Deal analyzer tool",
      "10 Direct mail campaigns/month",
      "Email & chat support",
      "Basic templates library",
      "SMS notifications",
      "Priority email support",
    ],
    apiCredits: 200,
    limits: {
      properties: 100,
      savedSearches: 10,
      exportLimit: 50,
      directMailCampaigns: 10,
      templates: 20,
    },
    popular: true,
  },
  professional: {
    name: "Professional",
    price: 99,
    interval: "month",
    description: "For serious real estate professionals",
    features: [
      "1,000 API credits per month",
      "All Entrepreneur features",
      "Call center tools integration",
      "Unlimited direct mail campaigns",
      "Advanced deal calculator",
      "Property research tools",
      "Premium templates library",
      "CRM integration",
      "Phone & priority support",
      "Custom branding options",
      "Team collaboration (up to 5 users)",
    ],
    apiCredits: 1000,
    limits: {
      properties: 1000,
      savedSearches: 50,
      exportLimit: 500,
      directMailCampaigns: -1, // Unlimited
      templates: 50,
      teamMembers: 5,
    },
    popular: false,
  },
  enterprise: {
    name: "Enterprise",
    price: 299,
    interval: "month",
    description: "Complete solution for large organizations",
    features: [
      "Unlimited API credits",
      "All Professional features",
      "White-label solution",
      "Custom integrations",
      "Dedicated account manager",
      "24/7 priority support",
      "Custom API endpoints",
      "Advanced analytics dashboard",
      "Unlimited team members",
      "Custom training sessions",
      "SLA guarantee",
      "On-premise deployment option",
    ],
    apiCredits: -1, // Unlimited
    limits: {
      properties: -1, // Unlimited
      savedSearches: -1, // Unlimited
      exportLimit: -1, // Unlimited
      directMailCampaigns: -1, // Unlimited
      templates: -1, // Unlimited
      teamMembers: -1, // Unlimited
    },
    popular: false,
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_PLANS;
