import React, { useState, useEffect, useCallback } from "react";
import { loadStripe, Stripe, StripeElements } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

// Load Stripe
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
);

interface MembershipTier {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  features: string[];
  popular?: boolean;
  stripeProductId: string;
  stripePriceId: string;
}

const membershipTiers: MembershipTier[] = [
  {
    id: "basic",
    name: "🌟 Basic Membership",
    price: 29,
    interval: "month",
    stripeProductId: "prod_basic",
    stripePriceId: "price_basic_monthly",
    features: [
      "Access to all educational content",
      "Monthly webinars",
      "Email support",
      "Basic foreclosure tools",
      "Community forum access",
    ],
  },
  {
    id: "premium",
    name: "⭐ Premium Membership",
    price: 49,
    interval: "month",
    popular: true,
    stripeProductId: "prod_premium",
    stripePriceId: "price_premium_monthly",
    features: [
      "Everything in Basic",
      "One-on-one consultations (2/month)",
      "Priority support",
      "Advanced analytics",
      "Personalized action plans",
      "Direct lender connections",
    ],
  },
  {
    id: "vip",
    name: "💎 VIP Membership",
    price: 97,
    interval: "month",
    stripeProductId: "prod_vip",
    stripePriceId: "price_vip_monthly",
    features: [
      "Everything in Premium",
      "Unlimited consultations",
      "White-glove service",
      "Legal document reviews",
      "Direct phone line",
      "Investment opportunities access",
    ],
  },
];

// Payment form component
const CheckoutForm: React.FC<{
  selectedTier: MembershipTier;
  onSuccess: () => void;
}> = ({ selectedTier, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>("");

  const createPaymentIntent = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: selectedTier.price * 100, // Convert to cents
          currency: "usd",
          membership_tier: selectedTier.id,
          user_id: user.id,
        }),
      });

      const data = await response.json();
      setClientSecret(data.client_secret);
    } catch (error) {
      console.error("Error creating payment intent:", error);
      toast.error("Failed to initialize payment");
    }
  }, [selectedTier]);

  useEffect(() => {
    // Create payment intent on component mount
    createPaymentIntent();
  }, [createPaymentIntent]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);

    const card = elements.getElement(CardElement);
    if (!card) return;

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: card,
          },
        },
      );

      if (error) {
        toast.error(error.message || "Payment failed");
      } else if (paymentIntent.status === "succeeded") {
        // Save subscription to database
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("subscriptions").insert({
            user_id: user.id,
            membership_tier: selectedTier.id,
            payment_intent_id: paymentIntent.id,
            amount: selectedTier.price,
            interval: selectedTier.interval,
            status: "active",
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000,
            ).toISOString(), // 30 days
          });
        }

        toast.success("🎉 Payment successful! Welcome to your membership!");
        onSuccess();
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment processing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Element */}
      <div className="p-4 border border-gray-300 rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
      </div>

      {/* Security Notice */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <span className="text-green-500">🔒</span>
        <span>
          Your payment information is secured with 256-bit SSL encryption and
          PCI DSS compliance
        </span>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Processing...</span>
          </div>
        ) : (
          `Pay $${selectedTier.price}/${selectedTier.interval}`
        )}
      </button>

      {/* Trust Badges */}
      <div className="flex justify-center items-center space-x-4 text-xs text-gray-500">
        <span className="flex items-center space-x-1">
          <span>🛡️</span>
          <span>PCI DSS Compliant</span>
        </span>
        <span className="flex items-center space-x-1">
          <span>🔐</span>
          <span>256-bit SSL</span>
        </span>
        <span className="flex items-center space-x-1">
          <span>💳</span>
          <span>Stripe Secure</span>
        </span>
      </div>
    </form>
  );
};

// Main component
const StripePaymentForm: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<MembershipTier>(
    membershipTiers[1],
  );
  const [showPayment, setShowPayment] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleSuccess = () => {
    setShowPayment(false);
    // Redirect to dashboard or success page
    window.location.href = "/education/dashboard";
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Sign In Required
        </h2>
        <p className="text-gray-600 mb-6">
          Please sign in to purchase a membership.
        </p>
        <a
          href="/auth"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign In
        </a>
      </div>
    );
  }

  if (showPayment) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Complete Your Membership
            </h2>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">
                {selectedTier.name}
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                ${selectedTier.price}/{selectedTier.interval}
              </p>
            </div>
          </div>

          <Elements stripe={stripePromise}>
            <CheckoutForm
              selectedTier={selectedTier}
              onSuccess={handleSuccess}
            />
          </Elements>

          <div className="text-center mt-6">
            <button
              onClick={() => setShowPayment(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back to plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          💎 Choose Your Membership
        </h1>
        <p className="text-xl text-gray-600">
          Get unlimited access to our foreclosure prevention tools and expert
          support
        </p>
      </motion.div>

      {/* Membership Cards */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {membershipTiers.map((tier, index) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative bg-white rounded-lg shadow-lg p-8 ${
              tier.popular ? "ring-2 ring-blue-500" : ""
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {tier.name}
              </h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                ${tier.price}
                <span className="text-lg text-gray-500">/{tier.interval}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {tier.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center text-sm">
                  <span className="text-green-500 mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => {
                setSelectedTier(tier);
                setShowPayment(true);
              }}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                tier.popular
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"
              }`}
            >
              Choose {tier.name.split(" ")[1]}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Security Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-green-50 rounded-lg p-8"
      >
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-green-900 mb-4">
            🔒 Your Security is Our Priority
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-3">🛡️</div>
            <h4 className="font-semibold text-green-900 mb-2">
              PCI DSS Compliant
            </h4>
            <p className="text-green-700 text-sm">
              We meet the highest standards for payment card data security
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-3">🔐</div>
            <h4 className="font-semibold text-green-900 mb-2">
              256-bit SSL Encryption
            </h4>
            <p className="text-green-700 text-sm">
              Your data is encrypted with bank-level security protocols
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-3">💳</div>
            <h4 className="font-semibold text-green-900 mb-2">
              Stripe Secure Processing
            </h4>
            <p className="text-green-700 text-sm">
              Powered by Stripe, trusted by millions of businesses worldwide
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-green-700 text-sm">
            <strong>Money-back guarantee:</strong> Cancel anytime within 30 days
            for a full refund
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default StripePaymentForm;
