import { loadStripe } from "@stripe/stripe-js";

// Get Stripe publishable key from environment variables
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn(
    "Stripe publishable key not found. Payment features will not work.",
  );
}

// Initialize Stripe
const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : Promise.resolve(null);

export default stripePromise;
