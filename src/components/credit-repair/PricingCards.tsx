import React from "react";
import { useNavigate } from "react-router-dom";
import { MEMBERSHIP_TIERS } from "../../services/credit-repair/config/membership-tiers";

interface PricingCardsProps {
  billingCycle: "monthly" | "annual";
}

const PricingCards: React.FC<PricingCardsProps> = ({ billingCycle }) => {
  const navigate = useNavigate();

  const handleSignup = (tierId: string) => {
    navigate(`/auth?signup=true&tier=${tierId}&billing=${billingCycle}`);
  };

  const tiers = [
    MEMBERSHIP_TIERS.FREE,
    MEMBERSHIP_TIERS.PREMIUM,
    MEMBERSHIP_TIERS.ELITE,
  ];

  const getDisplayPrice = (tier: typeof MEMBERSHIP_TIERS.FREE) => {
    if (tier.price === 0) return 0;
    if (billingCycle === "annual" && tier.annualPrice) {
      return Math.floor(tier.annualPrice / 12);
    }
    return tier.price;
  };

  const getSavings = (tier: typeof MEMBERSHIP_TIERS.FREE) => {
    if (!tier.annualPrice || tier.price === 0) return 0;
    return tier.price * 12 - tier.annualPrice;
  };

  return (
    <div className="pricing-grid">
      {tiers.map((tier) => {
        const displayPrice = getDisplayPrice(tier);
        const savings = getSavings(tier);

        return (
          <div
            key={tier.id}
            className={`pricing-card tier-${tier.id} ${tier.popular ? "popular" : ""}`}
          >
            {tier.popular && <div className="popular-badge">Most Popular</div>}
            {tier.badge && <div className="elite-badge">{tier.badge}</div>}

            <div className="pricing-header">
              <h3>{tier.displayName}</h3>
              <div className="price">
                <span className="currency">$</span>
                <span className="amount">{displayPrice}</span>
                <span className="period">
                  /{tier.price === 0 ? "forever" : "month"}
                </span>
              </div>
              {billingCycle === "annual" && savings > 0 && (
                <p className="annual-savings">${savings}/year savings</p>
              )}
            </div>

            <div className="pricing-features">
              <ul>
                {tier.highlights.map((highlight, index) => (
                  <li key={index}>✓ {highlight}</li>
                ))}
              </ul>
            </div>

            <button
              className={`btn ${tier.id === "elite" ? "btn-elite" : tier.price === 0 ? "btn-outline" : "btn-primary"} btn-block`}
              onClick={() => handleSignup(tier.id)}
            >
              {tier.ctaText}
            </button>

            {tier.price === 0 ? (
              <p className="no-cc">No credit card required</p>
            ) : (
              <p className="money-back">
                {tier.id === "elite" ? "60" : "30"}-day money-back guarantee
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PricingCards;
