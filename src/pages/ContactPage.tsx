import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { BackButton } from "../components/ui/BackButton";

const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission to Supabase or email service
    console.log("Form submitted:", formData);
    setSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - RepMotivatedSeller</title>
        <meta
          name="description"
          content="Get in touch with RepMotivatedSeller for foreclosure assistance, property analysis, or investment opportunities."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <BackButton />

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                Contact Us
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                We're here to help you save your home and achieve your real
                estate goals.
              </p>

              <div className="space-y-6">
                {/* Emergency Contact */}
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-red-900 mb-2">
                    🆘 Emergency Foreclosure Help
                  </h3>
                  <p className="text-red-700 mb-3">
                    If you're facing imminent foreclosure, call us immediately:
                  </p>
                  <a
                    href="tel:+18778064677"
                    className="text-2xl font-bold text-red-600 hover:text-red-700"
                  >
                    (877) 806-4677
                  </a>
                  <p className="text-sm text-red-600 mt-2">
                    Available 24/7 for crisis situations
                  </p>
                </div>

                {/* Office Contact */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    📍 Office Information
                  </h3>
                  <div className="space-y-3 text-gray-700">
                    <div className="flex items-start">
                      <span className="text-blue-600 mr-3">📞</span>
                      <div>
                        <p className="font-medium">Phone</p>
                        <a
                          href="tel:+18778064677"
                          className="text-blue-600 hover:underline"
                        >
                          (877) 806-4677
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-600 mr-3">📧</span>
                      <div>
                        <p className="font-medium">Email</p>
                        <a
                          href="mailto:admin@repmotivatedseller.shoprealestatespace.org"
                          className="text-blue-600 hover:underline"
                        >
                          admin@repmotivatedseller.shoprealestatespace.org
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-600 mr-3">⏰</span>
                      <div>
                        <p className="font-medium">Business Hours</p>
                        <p className="text-gray-600">
                          Monday - Friday: 8am - 8pm EST
                        </p>
                        <p className="text-gray-600">
                          Saturday: 10am - 4pm EST
                        </p>
                        <p className="text-gray-600">
                          Sunday: Emergency calls only
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    🌐 Connect With Us
                  </h3>
                  <div className="flex space-x-4">
                    <a
                      href="#"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <span className="text-2xl">📘</span>
                    </a>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-blue-400 transition-colors"
                    >
                      <span className="text-2xl">🐦</span>
                    </a>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-pink-600 transition-colors"
                    >
                      <span className="text-2xl">📷</span>
                    </a>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-blue-700 transition-colors"
                    >
                      <span className="text-2xl">💼</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white rounded-lg shadow-md p-8">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Thank you for contacting us. We'll respond within 24
                      hours.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Send Us a Message
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="john@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="(555) 123-4567"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subject *
                        </label>
                        <select
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select a subject</option>
                          <option value="foreclosure">
                            Foreclosure Assistance
                          </option>
                          <option value="investment">
                            Investment Opportunities
                          </option>
                          <option value="property_analysis">
                            Property Analysis
                          </option>
                          <option value="general">General Inquiry</option>
                          <option value="support">Technical Support</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Message *
                        </label>
                        <textarea
                          name="message"
                          required
                          value={formData.message}
                          onChange={handleChange}
                          rows={6}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Tell us how we can help you..."
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        Send Message
                      </button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
