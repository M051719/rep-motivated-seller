import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Crown,
  Zap,
  Building2,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { BackButton } from "../components/ui/BackButton";
import PricingCard from "../components/subscription/PricingCard";
import { SUBSCRIPTION_PLANS } from "../config/subscriptionPlans";
import { useSubscription } from "../hooks/useSubscription";
import { useAuthStore } from "../store/authStore";

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { subscription, upgradeSubscription, loading } = useSubscription();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleSelectPlan = async (
    tier: "free" | "entrepreneur" | "professional" | "enterprise",
  ) => {
    if (!user) {
      navigate("/login", { state: { from: "/subscription" } });
      return;
    }

    if (tier === "free") {
      navigate("/get-started");
      return;
    }

    setSelectedTier(tier);

    // In production, integrate with Stripe or payment processor
    try {
      await upgradeSubscription(tier);
      alert(`Successfully upgraded to ${SUBSCRIPTION_PLANS[tier].name} plan!`);
      navigate("/dashboard");
    } catch (error) {
      console.error("Upgrade failed:", error);
      alert("Upgrade failed. Please try again.");
    }
  };

  const benefits = [
    {
      icon: <Zap className="w-8 h-8 text-primary-500" />,
      title: "Powerful APIs",
      description:
        "Access comprehensive property data and foreclosure information",
    },
    {
      icon: <Crown className="w-8 h-8 text-primary-500" />,
      title: "Premium Tools",
      description:
        "Deal analyzer, direct mail campaigns, and call center integration",
    },
    {
      icon: <Building2 className="w-8 h-8 text-primary-500" />,
      title: "Enterprise Ready",
      description:
        "White-label solutions and custom integrations for your business",
    },
  ];

  if (loading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <BackButton />
      </div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
              Choose Your Plan
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto mb-8">
              Access powerful foreclosure tools and resources to grow your real
              estate investment business
            </p>
            {user && subscription && (
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-semibold">
                  Current Plan: {subscription.plan.name}
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-6"
            >
              <div className="inline-flex items-center justify-center mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <PricingCard
            tier="free"
            name={SUBSCRIPTION_PLANS.free.name}
            price={SUBSCRIPTION_PLANS.free.price}
            features={SUBSCRIPTION_PLANS.free.features}
            apiCredits={SUBSCRIPTION_PLANS.free.apiCredits}
            currentTier={subscription?.tier}
            onSelectPlan={() => handleSelectPlan("free")}
          />
          <PricingCard
            tier="entrepreneur"
            name={SUBSCRIPTION_PLANS.entrepreneur.name}
            price={SUBSCRIPTION_PLANS.entrepreneur.price}
            features={SUBSCRIPTION_PLANS.entrepreneur.features}
            apiCredits={SUBSCRIPTION_PLANS.entrepreneur.apiCredits}
            currentTier={subscription?.tier}
            onSelectPlan={() => handleSelectPlan("entrepreneur")}
            popular={true}
          />
          <PricingCard
            tier="professional"
            name={SUBSCRIPTION_PLANS.professional.name}
            price={SUBSCRIPTION_PLANS.professional.price}
            features={SUBSCRIPTION_PLANS.professional.features}
            apiCredits={SUBSCRIPTION_PLANS.professional.apiCredits}
            currentTier={subscription?.tier}
            onSelectPlan={() => handleSelectPlan("professional")}
          />
          <PricingCard
            tier="enterprise"
            name={SUBSCRIPTION_PLANS.enterprise.name}
            price={SUBSCRIPTION_PLANS.enterprise.price}
            features={SUBSCRIPTION_PLANS.enterprise.features}
            apiCredits={SUBSCRIPTION_PLANS.enterprise.apiCredits}
            currentTier={subscription?.tier}
            onSelectPlan={() => handleSelectPlan("enterprise")}
          />
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about our membership tiers and
              policies
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                question: "What are API credits and how do they work?",
                answer: `API credits are the currency used to access our platform's features. Each time you use a service like property data lookup, deal analysis, direct mail campaigns, or CRM integrations, it consumes a certain number of credits. Different actions consume different amounts:

• Basic property search: 1-2 credits
• Detailed foreclosure data: 5-10 credits
• Deal analyzer calculation: 3-5 credits
• Direct mail campaign send: 10-20 credits per recipient
• CRM integration sync: 5 credits per contact

Your credits reset at the beginning of each billing cycle (monthly).`,
              },
              {
                question: "What are the differences between membership tiers?",
                answer: `We offer 4 membership tiers designed for different needs:

🆓 FREE ($0/month - 50 API credits)
Perfect for getting started. Includes basic property search, education resources, knowledge base access, and community support. Limited to 10 properties and 5 templates.

💼 ENTREPRENEUR ($29/month - 200 API credits)
Great for individual investors. Includes all Free features plus advanced property search, deal analyzer tool, 10 direct mail campaigns/month, SMS notifications, and 20 templates. Up to 100 properties.

⚡ PROFESSIONAL ($99/month - 1,000 API credits)
For serious real estate professionals. Includes all Entrepreneur features plus call center tools, unlimited direct mail campaigns, CRM integration, custom branding, and team collaboration (up to 5 users). Up to 1,000 properties.

🏢 ENTERPRISE ($299/month - Unlimited API credits)
Complete solution for large organizations. Includes everything plus white-label solution, custom integrations, dedicated account manager, priority support (1-2 business day response), unlimited team members, custom training, and SLA guarantee.`,
              },
              {
                question: "What happens when I run out of API credits?",
                answer: `When you exhaust your monthly API credits, you have several options:

1. Wait for your credits to reset at the beginning of your next billing cycle
2. Upgrade to a higher tier immediately (takes effect right away with prorated billing)
3. Purchase additional credit packs (available for Professional and Enterprise tiers)

Your existing data and saved searches remain accessible even with 0 credits. You just won't be able to perform new credit-consuming actions until you get more credits.

We'll send you email notifications at 80% and 95% credit usage so you're never caught off guard.`,
              },
              {
                question: "Can I upgrade or downgrade my plan at any time?",
                answer: `Yes! You have complete flexibility:

UPGRADES: Take effect immediately. You'll be charged the prorated difference for the remainder of your billing cycle, and your new credit limit applies right away.

DOWNGRADES: Take effect at the end of your current billing period. You'll continue to enjoy your current plan's benefits until then, and won't lose any unused credits during the transition period.

NO PENALTIES: There are no fees for changing your plan. You can switch as often as needed to match your business needs.

To change your plan, go to Account → Subscription & Billing and select your new tier.`,
              },
              {
                question: "What payment methods do you accept?",
                answer: `We accept multiple secure payment methods:

💳 Credit/Debit Cards: Visa, Mastercard, American Express, Discover
🏦 ACH Bank Transfers: Available for Professional and Enterprise plans
💰 Wire Transfers: For Enterprise plans with annual billing
🔒 Cryptocurrency: Bitcoin and Ethereum accepted for annual Enterprise plans

All payments are processed securely through Stripe, and we never store your payment information on our servers. We're PCI DSS compliant for your security.`,
              },
              {
                question: "Is there a free trial available?",
                answer: `Yes! Our Free tier is essentially a permanent trial that never expires. You can:

• Start with the Free plan (50 API credits/month) to explore the platform
• Access education resources and knowledge base
• Try basic property searches and calculators
• Experience the platform with no credit card required

When you're ready for more features and credits, you can upgrade to Entrepreneur, Professional, or Enterprise at any time. We also offer a 30-day money-back guarantee on all paid plans if you're not satisfied.`,
              },
              {
                question: "What is your refund and cancellation policy?",
                answer: `We want you to be completely satisfied:

30-DAY MONEY-BACK GUARANTEE: If you're not happy with a paid plan within the first 30 days, we'll refund 100% of your payment - no questions asked.

CANCELLATION: You can cancel anytime from your account dashboard. Your subscription will remain active until the end of your billing period, and you'll continue to have access to all features until then.

NO LONG-TERM CONTRACTS: All plans are month-to-month. Enterprise plans can opt for annual billing for a discount, but month-to-month is always available.

UNUSED CREDITS: Credits don't roll over to the next month or carry over after cancellation, but you'll keep access to all your saved data and exports.`,
              },
              {
                question: "Do unused API credits roll over to the next month?",
                answer: `API credits are reset monthly and do not roll over. This keeps pricing fair and predictable. However:

• Your credit allocation resets on your billing date each month
• Professional and Enterprise tiers can purchase additional credit packs that don't expire
• If you consistently have leftover credits, consider downgrading to save money
• If you frequently run out of credits, upgrading gives you more credits per dollar

We provide detailed usage analytics in your dashboard so you can choose the tier that matches your actual usage patterns.`,
              },
              {
                question: "Can I add team members to my account?",
                answer: `Team collaboration is available on Professional and Enterprise plans:

PROFESSIONAL PLAN: Up to 5 team members included
• Each member gets their own login
• Shared credit pool
• Role-based permissions (Admin, Editor, Viewer)
• Collaborative property lists and notes

ENTERPRISE PLAN: Unlimited team members
• Everything in Professional
• Advanced permission controls
• Department-level credit allocation
• Dedicated account manager for team training
• Single Sign-On (SSO) available

Free and Entrepreneur tiers are single-user only. Upgrade to Professional to start collaborating with your team.`,
              },
              {
                question: "What support do I get with my plan?",
                answer: `Support levels vary by tier:

🆓 FREE TIER:
• Email support (7 business day response time)
• Knowledge base and documentation
• Community forum access

💼 ENTREPRENEUR TIER:
• Email & chat support (7 business day response time)
• Priority email support
• Video tutorials and guides

⚡ PROFESSIONAL TIER:
• Phone & priority support (3-5 business day response time)
• Dedicated support specialist
• Screen sharing for troubleshooting
• Quarterly business reviews

🏢 ENTERPRISE TIER:
• Priority support (1-2 business day response time)
• Dedicated account manager
• Direct phone line and Slack channel
• Custom training sessions
• SLA guarantee with uptime commitment`,
              },
              {
                question: "Are there any hidden fees or additional costs?",
                answer: `No hidden fees! Your monthly subscription includes everything advertised. Here's what's included:

INCLUDED IN ALL PLANS:
• Full access to tier features
• Monthly API credit allocation
• Regular platform updates
• Security and compliance
• Data storage and backups
• Standard support

OPTIONAL ADD-ONS (NOT REQUIRED):
• Additional API credit packs (Professional/Enterprise only)
• White-label branding (Enterprise)
• Custom integrations (Enterprise)
• Premium templates (all tiers)

We believe in transparent pricing. The price you see is the price you pay. No setup fees, no contract minimums, no surprise charges.`,
              },
              {
                question: "How secure is my data and payment information?",
                answer: `Security is our top priority:

🔐 DATA SECURITY:
• Bank-level 256-bit SSL encryption
• SOC 2 Type II certified infrastructure
• Regular third-party security audits
• GDPR and CCPA compliant
• Daily encrypted backups

💳 PAYMENT SECURITY:
• PCI DSS Level 1 compliant
• Payments processed through Stripe (never stored on our servers)
• Tokenized payment information
• Fraud detection and prevention

🏛️ COMPLIANCE:
• GLBA compliant for financial data
• Regular penetration testing
• Role-based access controls
• Audit logs for all activities

Your data is hosted on secure AWS servers with multiple redundancies and 99.9% uptime guarantee.`,
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <button
                  onClick={() =>
                    setOpenFaqIndex(openFaqIndex === index ? null : index)
                  }
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  {openFaqIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {openFaqIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-gray-600 whitespace-pre-line leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Additional Help Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 text-center p-8 bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our team is here to help! Contact us directly for personalized
              assistance with choosing the right plan for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:admin@repmotivatedseller.shoprealestatespace.org"
                className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                📧 Email Support
              </a>
              <a
                href="mailto:urgent@repmotivatedseller.shoprealestatespace.org"
                className="inline-flex items-center justify-center bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                🚨 Urgent Inquiry
              </a>
              <button
                onClick={() => navigate("/help")}
                className="inline-flex items-center justify-center bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
              >
                📚 Visit Help Center
              </button>
            </div>
          </motion.div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-primary-50 rounded-2xl p-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of real estate investors who are growing their
              business with RepMotivatedSeller
            </p>
            <button
              onClick={() => navigate(user ? "/dashboard" : "/signup")}
              className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {user ? "Go to Dashboard" : "Create Free Account"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;

interface PricingCardProps {
  tier: "free" | "professional" | "enterprise";
  name: string;
  price: number;
  features: readonly string[];
  apiCredits: number;
  currentTier?: string;
  onSelectPlan: () => void;
  popular?: boolean;
}
