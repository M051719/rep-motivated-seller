import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface PricingCardProps {
  tier: "free" | "entrepreneur" | "professional" | "enterprise";
  name: string;
  price: number;
  features: readonly string[];
  apiCredits: number;
  currentTier?: string;
  onSelectPlan: () => void;
  popular?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  tier,
  name,
  price,
  features,
  apiCredits,
  currentTier,
  onSelectPlan,
  popular = false,
}) => {
  const isCurrentPlan = currentTier === tier;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative bg-white rounded-2xl shadow-xl overflow-hidden ${
        popular ? "ring-2 ring-primary-500" : ""
      }`}
    >
      {popular && (
        <div className="absolute top-0 right-0 bg-primary-500 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
          Most Popular
        </div>
      )}

      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
          <div className="flex items-baseline mb-4">
            <span className="text-5xl font-extrabold text-gray-900">
              ${price}
            </span>
            <span className="text-gray-500 ml-2">/month</span>
          </div>
          <p className="text-sm text-gray-600">
            {apiCredits === -1 ? "Unlimited" : `${apiCredits.toLocaleString()}`}{" "}
            API Credits/month
          </p>
        </div>

        {/* Features */}
        <ul className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-green-500" />
              </div>
              <span className="ml-3 text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <button
          onClick={onSelectPlan}
          disabled={isCurrentPlan}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
            isCurrentPlan
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : popular
                ? "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 hover:shadow-2xl shadow-lg"
                : "bg-gray-800 text-white hover:bg-gray-900 hover:scale-105 hover:shadow-2xl"
          }`}
          style={
            !isCurrentPlan ? { color: "white", fontWeight: "700" } : undefined
          }
        >
          {isCurrentPlan
            ? "Current Plan"
            : tier === "free"
              ? "Get Started"
              : "Upgrade Now"}
        </button>

        {isCurrentPlan && (
          <p className="text-center text-sm text-gray-500 mt-3">
            You're on this plan
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default PricingCard;
