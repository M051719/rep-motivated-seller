import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PricingCards from "../../components/credit-repair/PricingCards";
import "../../services/credit-repair/styles/landing.css";

const CreditRepairLanding: React.FC = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly",
  );

  const stats = [
    { number: "50,000+", label: "Active Members" },
    { number: "120+", label: "Avg Credit Score Improvement" },
    { number: "$2.5M+", label: "Total Property Deals Analyzed" },
  ];

  const features = [
    {
      icon: "📊",
      title: "Property Analysis",
      description:
        "Access detailed property data, comps, and market analytics. Make informed investment decisions fast.",
    },
    {
      icon: "💳",
      title: "Credit Repair",
      description:
        "Professional credit repair tools and services. Dispute errors, build credit, track progress.",
    },
    {
      icon: "🏠",
      title: "Pre-Foreclosure Database",
      description:
        "Find distressed properties before they hit the market. Get ahead of the competition.",
    },
    {
      icon: "🤖",
      title: "AI Assistant",
      description:
        "Ask questions, analyze deals, generate documents. AI-powered insights at your fingertips.",
    },
    {
      icon: "📚",
      title: "Education Hub",
      description:
        "Video tutorials, courses, and resources. Learn from industry experts.",
    },
    {
      icon: "🎯",
      title: "Deal Calculator",
      description:
        "Quick buy/hold analysis. Calculate ROI, cash flow, and profit potential instantly.",
    },
  ];

  const testimonials = [
    {
      rating: 5,
      text: "Increased my credit score by 143 points in 4 months. The credit repair tools are incredible, and now I'm investing in pre-foreclosures!",
      author: "Sarah M.",
      location: "Elite Member, Atlanta GA",
    },
    {
      rating: 5,
      text: "The property analysis tools saved me from a bad deal and helped me find 3 great investments. ROI paid for itself in the first month.",
      author: "Michael R.",
      location: "Professional Member, Phoenix AZ",
    },
    {
      rating: 5,
      text: "The 24/7 support is amazing. I can call anytime when evaluating deals. The Facebook group alone is worth the Elite membership.",
      author: "David L.",
      location: "Elite Member, Miami FL",
    },
  ];

  const faqs = [
    {
      question: "How quickly will I see results with credit repair?",
      answer:
        "Most members see improvements within 30-45 days. The average score increase is 120+ points within 4-6 months, though results vary based on individual circumstances.",
    },
    {
      question: "Can I cancel my membership anytime?",
      answer:
        "Yes! All paid memberships can be cancelled anytime with no penalties. We also offer 30-day (Professional) and 60-day (Elite) money-back guarantees.",
    },
    {
      question: "What makes Elite membership worth $297/month?",
      answer:
        "Elite includes 24/7 phone support, unlimited property analysis, a dedicated credit specialist, private investor network, and a personal account manager. For active investors, the time saved and deals found typically return 10-20x the membership cost.",
    },
    {
      question: "Do I need real estate experience?",
      answer:
        "No! Our platform is designed for all levels. The Basic tier is perfect for beginners with comprehensive education resources. As you grow, upgrade to access professional tools.",
    },
  ];

  return (
    <div className="credit-repair-landing">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay" />
        <div className="hero-content container">
          <h1 className="hero-title">
            Transform Your Financial Future
            <br />
            <span className="highlight">Credit Repair</span> &{" "}
            <span className="highlight">Pre-Foreclosure</span> Solutions
          </h1>
          <p className="hero-subtitle">
            Professional tools for credit repair, property analysis, and real
            estate investing.
            <br />
            Join thousands of successful investors and homeowners rebuilding
            their financial future.
          </p>
          <div className="hero-cta">
            <button
              className="btn btn-primary btn-lg"
              onClick={() =>
                document
                  .getElementById("pricing")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              View Membership Options
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => navigate("/signup?tier=free")}
            >
              Start Free
            </button>
          </div>
          <div className="hero-stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat">
                <span className="stat-number">{stat.number}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="features-section section-padding bg-light">
        <div className="container">
          <h2 className="section-title text-center">
            Comprehensive Tools for Your Success
          </h2>
          <p className="section-subtitle text-center">
            Everything you need in one powerful platform
          </p>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section section-padding" id="pricing">
        <div className="container">
          <h2 className="section-title text-center">
            Choose Your Path to Success
          </h2>
          <p className="section-subtitle text-center">
            Flexible plans designed for every stage of your journey
          </p>

          <div className="pricing-toggle">
            <span>Monthly</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={billingCycle === "annual"}
                onChange={(e) =>
                  setBillingCycle(e.target.checked ? "annual" : "monthly")
                }
              />
              <span className="slider" />
            </label>
            <span>
              Annual <span className="save-badge">Save 20%</span>
            </span>
          </div>

          <PricingCards billingCycle={billingCycle} />
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section section-padding bg-light">
        <div className="container">
          <h2 className="section-title text-center">Success Stories</h2>
          <p className="section-subtitle text-center">
            Real results from real members
          </p>

          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-rating">
                  {"⭐".repeat(testimonial.rating)}
                </div>
                <p className="testimonial-text">{testimonial.text}</p>
                <div className="testimonial-author">
                  <strong>{testimonial.author}</strong>
                  <span>{testimonial.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section section-padding">
        <div className="container">
          <h2 className="section-title text-center">
            Frequently Asked Questions
          </h2>

          <div className="faq-container">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <h3 className="faq-question">{faq.question}</h3>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="cta-section section-padding bg-dark text-white">
        <div className="container text-center">
          <h2>Ready to Transform Your Financial Future?</h2>
          <p className="lead">
            Join 50,000+ members who are rebuilding credit and building wealth
            through real estate
          </p>
          <div className="cta-buttons">
            <button
              className="btn btn-light btn-lg"
              onClick={() => navigate("/signup?tier=free")}
            >
              Start Free Today
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate("/signup?tier=elite&trial=true")}
            >
              Try Elite - First Month 50% Off
            </button>
          </div>
          <p className="small mt-3">
            No credit card required for free tier • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
};

export default CreditRepairLanding;
