export const MEMBERSHIP_TIERS_ARRAY = [
  {
    id: 'free',
    name: 'FREE',
    price: 0,
    period: 'forever',
    badge: 'Get Started',
    color: 'gray',
    features: [
      '10 property searches/month',
      'Basic credit tracking',
      'Knowledge base access',
      '5 AI queries/month'
    ],
    highlights: [
      'Perfect for homeowners starting their journey',
      'Free forever - no credit card required',
      'Access to community resources'
    ]
  },
  {
    id: 'professional',
    name: 'PROFESSIONAL',
    price: 97,
    annualPrice: 970,
    period: 'month',
    popular: true,
    badge: 'Most Popular',
    color: 'blue',
    features: [
      '100 property searches/month',
      'Full credit repair services',
      'Property comps & analysis',
      'Buy/hold calculator',
      '50 AI queries/month',
      'Email support (7 business days)'
    ],
    highlights: [
      'Everything in FREE, plus advanced tools',
      'Professional credit repair assistance',
      'Save $194 with annual billing'
    ]
  },
  {
    id: 'elite',
    name: 'ELITE',
    price: 297,
    annualPrice: 2970,
    period: 'month',
    badge: 'Premium',
    color: 'purple',
    features: [
      'Unlimited property searches',
      '24/7 phone support: (833) 450-3080',
      'Live call assistance (business hours)',
      'Dedicated credit specialist',
      'Facebook group access',
      'Unlimited AI queries',
      'SMS support',
      'Monthly strategy calls'
    ],
    highlights: [
      'Everything in PROFESSIONAL, plus VIP service',
      'White-glove concierge experience',
      'Save $594 with annual billing'
    ]
  }
];

export const MEMBERSHIP_TIERS = {
  FREE: MEMBERSHIP_TIERS_ARRAY[0],
  PREMIUM: MEMBERSHIP_TIERS_ARRAY[1],
  ELITE: MEMBERSHIP_TIERS_ARRAY[2]
};
