import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";

const WhatWeDoPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>
          What We Do - Private Funding Solutions | Sofie's Investment Group
        </title>
        <meta
          name="description"
          content="Connecting real estate professionals with private funding options for non-owner-occupied single-family rentals. Quick funding, cash-out refinance, and investment property loans."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-green-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4">
            <button
              onClick={() => navigate("/")}
              className="mb-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 border border-white/30 rounded-lg hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors backdrop-blur-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Home
            </button>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                What We Do
              </h1>
              <p className="text-2xl md:text-3xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
                Connecting Real Estate Professionals with Private Funding
                Solutions
              </p>
              <p className="text-xl text-blue-50 max-w-3xl mx-auto">
                Sofie's Investment Group | RepMotivatedSeller
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Value Proposition */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Your Partner in Private Real Estate Funding
                </h2>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  Our service connects real estate professionals with private
                  funding options to assist financially challenged clients in
                  purchasing{" "}
                  <strong>non-owner-occupied single-family rentals</strong>.
                  This unique feature allows realtors and brokers to provide
                  their clients with access to funding solutions that
                  traditional lenders may not offer.
                </p>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  The advantage of our service is the ability to{" "}
                  <strong>secure funding quickly and efficiently</strong>,
                  helping clients overcome financial obstacles and secure their
                  dream properties.
                </p>
                <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg">
                  <p className="text-gray-800 font-semibold">
                    By partnering with us, real estate professionals can offer a
                    valuable resource to their clients, leading to increased
                    customer satisfaction and loyalty.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-green-600 to-blue-700 rounded-2xl shadow-2xl p-8 text-white"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold mb-6">Quick Facts</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-3xl">💰</span>
                    <div>
                      <p className="font-bold text-lg">$30K - FHA Cap</p>
                      <p className="text-green-100">Flexible loan amounts</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-3xl">⚡</span>
                    <div>
                      <p className="font-bold text-lg">Fast Approval</p>
                      <p className="text-green-100">7 business day decisions</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-3xl">🏠</span>
                    <div>
                      <p className="font-bold text-lg">Investment Properties</p>
                      <p className="text-green-100">
                        Non-owner-occupied single-family rentals
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-3xl">📈</span>
                    <div>
                      <p className="font-bold text-lg">8-15% Interest Rates</p>
                      <p className="text-green-100">
                        Competitive private money rates
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-3xl">📅</span>
                    <div>
                      <p className="font-bold text-lg">6-24 Month Terms</p>
                      <p className="text-green-100">
                        Short-term financing options
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Services We Offer */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Funding Solutions We Provide
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Are you currently on the market for funding? We offer flexible
                financing options for real estate investors and professionals.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Purchase Funding */}
              <motion.div
                className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-blue-600"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-5xl mb-4">🏡</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Investment Property Purchase
                </h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Any deals in the works that you need funding for? We provide
                  quick funding for non-owner-occupied single-family rental
                  purchases when traditional lenders say no or take too long.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <span className="text-green-600 font-bold mr-2">✓</span>
                    <span className="text-gray-700">
                      Perfect for investment properties
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 font-bold mr-2">✓</span>
                    <span className="text-gray-700">
                      Fast approval and closing
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 font-bold mr-2">✓</span>
                    <span className="text-gray-700">
                      For financially challenged clients
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 font-bold mr-2">✓</span>
                    <span className="text-gray-700">
                      Single-family rentals only
                    </span>
                  </li>
                </ul>
                <Link
                  to="/loan-application"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Apply for Purchase Funding →
                </Link>
              </motion.div>

              {/* Cash-Out Refinance */}
              <motion.div
                className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-green-600"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="text-5xl mb-4">💵</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Cash-Out Refinance
                </h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Any free & clear assets that you'd maybe like to leverage with
                  a cash-out refinance? Unlock the equity in your properties to
                  fund new investments, renovations, or other business needs.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <span className="text-green-600 font-bold mr-2">✓</span>
                    <span className="text-gray-700">
                      Leverage free & clear properties
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 font-bold mr-2">✓</span>
                    <span className="text-gray-700">Access equity quickly</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 font-bold mr-2">✓</span>
                    <span className="text-gray-700">
                      Fund new deals or renovations
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 font-bold mr-2">✓</span>
                    <span className="text-gray-700">Flexible use of funds</span>
                  </li>
                </ul>
                <Link
                  to="/loan-application"
                  className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Apply for Cash-Out Refinance →
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Who We Serve */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Who We Serve
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our private funding solutions are designed specifically for real
                estate professionals and their clients.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                className="text-center p-8 bg-gray-50 rounded-xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-6xl mb-4">🏢</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Real Estate Professionals
                </h3>
                <p className="text-gray-700">
                  Realtors, brokers, and agents looking to provide additional
                  value to their clients through alternative funding options.
                </p>
              </motion.div>

              <motion.div
                className="text-center p-8 bg-gray-50 rounded-xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="text-6xl mb-4">💼</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Real Estate Investors
                </h3>
                <p className="text-gray-700">
                  Active investors seeking quick funding for non-owner-occupied
                  single-family rental properties and portfolio expansion.
                </p>
              </motion.div>

              <motion.div
                className="text-center p-8 bg-gray-50 rounded-xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="text-6xl mb-4">🔑</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Financially Challenged Clients
                </h3>
                <p className="text-gray-700">
                  Buyers who don't qualify for traditional financing but have
                  viable investment opportunities and need alternative funding
                  solutions.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why Partner With Us */}
        <section className="py-20 bg-gradient-to-br from-blue-900 to-green-700 text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                Why Partner With Sofie's Investment Group?
              </h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Let us help you support your clients in achieving their real
                estate goals.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div
                className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-bold mb-3">Quick & Efficient</h3>
                <p className="text-blue-100">
                  Professional approval process with decisions in 7 business days. No
                  lengthy bank processes or excessive documentation
                  requirements.
                </p>
              </motion.div>

              <motion.div
                className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-bold mb-3">Alternative Lending</h3>
                <p className="text-blue-100">
                  Access to funding solutions that traditional lenders may not
                  offer. Perfect for clients who don't fit the conventional
                  lending box.
                </p>
              </motion.div>

              <motion.div
                className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-4xl mb-4">💪</div>
                <h3 className="text-xl font-bold mb-3">Overcome Obstacles</h3>
                <p className="text-blue-100">
                  Help your clients overcome financial obstacles and secure
                  their dream properties when traditional financing isn't an
                  option.
                </p>
              </motion.div>

              <motion.div
                className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-4xl mb-4">😊</div>
                <h3 className="text-xl font-bold mb-3">
                  Customer Satisfaction
                </h3>
                <p className="text-blue-100">
                  Increase customer satisfaction and loyalty by offering
                  valuable funding resources that help close more deals.
                </p>
              </motion.div>

              <motion.div
                className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold mb-3">Specialized Focus</h3>
                <p className="text-blue-100">
                  Expertise in non-owner-occupied single-family rentals. We
                  understand investment properties and investor needs.
                </p>
              </motion.div>

              <motion.div
                className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-xl font-bold mb-3">Zero Tolerance Fraud</h3>
                <p className="text-blue-100">
                  Secure, transparent, and trustworthy lending with strict fraud
                  prevention policies that protect all parties involved.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our streamlined process makes securing private funding simple
                and efficient.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Initial Inquiry
                </h3>
                <p className="text-gray-700">
                  Contact us or submit a pre-loan application. Share details
                  about your deal or property that needs funding.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Review & Evaluation
                </h3>
                <p className="text-gray-700">
                  We review your application and property details. Our team
                  evaluates the deal and determines funding options.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Approval & Terms
                </h3>
                <p className="text-gray-700">
                  Professional approval decision within 7 business days. We present loan
                  terms including rate, amount, and timeline.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  4
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Funding & Closing
                </h3>
                <p className="text-gray-700">
                  Quick closing process with funding disbursed efficiently. Your
                  client secures their property and achieves their goals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl md:text-2xl text-green-100 mb-8 leading-relaxed">
              This is Melvin at Sofie's Investment Group. Are you currently on
              the market for funding? Let us help you in achieving your real
              estate goals and your clients in securing their dream properties.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                to="/loan-application"
                className="bg-white text-green-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-50 transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                Apply Now - Free Pre-Qualification
              </Link>
              <a
                href="mailto:admin@repmotivatedseller.shoprealestatespace.org"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-green-700 transition-all duration-300 transform hover:scale-105"
              >
                Contact Melvin
              </a>
            </div>

            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl">✓</span>
                <span>No obligation consultation</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl">✓</span>
                <span>7 business day decisions</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl">✓</span>
                <span>Real estate professionals welcome</span>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Resources */}
        <section className="py-12 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <Link
                to="/terms-of-service"
                className="hover:text-blue-600 transition-colors"
              >
                Terms of Service
              </Link>
              <span className="text-gray-400">•</span>
              <Link
                to="/privacy-policy"
                className="hover:text-blue-600 transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-gray-400">•</span>
              <Link
                to="/refund-policy"
                className="hover:text-blue-600 transition-colors"
              >
                Refund Policy
              </Link>
              <span className="text-gray-400">•</span>
              <Link
                to="/disclaimer"
                className="hover:text-blue-600 transition-colors"
              >
                Disclaimer
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default WhatWeDoPage;
