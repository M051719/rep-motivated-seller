/**
 * Stripe Checkout Component
 * Handles subscription payments with Stripe Elements
 */

import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { motion } from "framer-motion";
import { Loader, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "react-hot-toast";

// Load Stripe (use your publishable key from env)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface StripeCheckoutProps {
  planId: "basic" | "premium" | "vip";
  planName: string;
  planPrice: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface CheckoutFormProps {
  planId: string;
  planName: string;
  planPrice: number;
  clientSecret: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Inner form component that uses Stripe hooks
const CheckoutForm: React.FC<CheckoutFormProps> = ({
  planId,
  planName,
  planPrice,
  clientSecret,
  onSuccess,
  onCancel,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/subscription/success`,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "An error occurred");
        toast.error(error.message || "Payment failed");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        setSucceeded(true);

        // Update user subscription in database
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("subscriptions").upsert({
            user_id: user.id,
            tier: planId,
            status: "active",
            stripe_subscription_id: paymentIntent.id,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000,
            ).toISOString(),
          });
        }

        toast.success(`✅ Successfully subscribed to ${planName}!`);
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setErrorMessage("An unexpected error occurred");
      toast.error("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (succeeded) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8"
      >
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h2>
        <p className="text-gray-600">
          Welcome to {planName} tier. Redirecting...
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {planName} Subscription
        </h3>
        <p className="text-3xl font-bold text-blue-600">
          ${planPrice}
          <span className="text-base font-normal text-gray-600">/month</span>
        </p>
      </div>

      <PaymentElement />

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 text-sm">{errorMessage}</p>
        </div>
      )}

      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>Subscribe Now</>
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Your payment is processed securely by Stripe. We never store your card
        details.
      </p>
    </form>
  );
};

// Main wrapper component
export default function StripeCheckout({
  planId,
  planName,
  planPrice,
  onSuccess,
  onCancel,
}: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    createPaymentIntent();
  }, [planId]);

  const createPaymentIntent = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Please sign in to continue");
      }

      // Call your Edge Function to create payment intent
      const { data, error } = await supabase.functions.invoke(
        "create-payment-intent",
        {
          body: {
            planId,
            planPrice: planPrice * 100, // Convert to cents
            userId: user.id,
          },
        },
      );

      if (error) throw error;

      setClientSecret(data.clientSecret);
    } catch (err: any) {
      console.error("Error creating payment intent:", err);
      setError(err.message || "Failed to initialize payment");
      toast.error("Failed to initialize payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">Initializing secure payment...</p>
      </div>
    );
  }

  if (error || !clientSecret) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
        <p className="text-red-800 text-center mb-4">
          {error || "Failed to initialize payment"}
        </p>
        <button
          onClick={createPaymentIntent}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: "stripe" as const,
      variables: {
        colorPrimary: "#2563eb",
        colorBackground: "#ffffff",
        colorText: "#1f2937",
        colorDanger: "#ef4444",
        fontFamily: "system-ui, sans-serif",
        spacingUnit: "4px",
        borderRadius: "8px",
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm
        planId={planId}
        planName={planName}
        planPrice={planPrice}
        clientSecret={clientSecret}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
}
