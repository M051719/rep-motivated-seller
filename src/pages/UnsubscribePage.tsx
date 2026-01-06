import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle, XCircle } from "lucide-react";
import { BackButton } from "../components/ui/BackButton";

const UnsubscribePage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      // In production, this would call your email service API to unsubscribe
      // For now, we'll simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // TODO: Integrate with MailerLite API
      // const response = await fetch('/api/unsubscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });

      setStatus("success");
      setMessage(
        "You have been successfully unsubscribed from our mailing list.",
      );
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred. Please try again or contact support.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto mb-4">
        <BackButton />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Mail className="w-8 h-8 text-gray-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Unsubscribe
            </h1>
            <p className="text-gray-600">
              We're sorry to see you go. Enter your email address to unsubscribe
              from our mailing list.
            </p>
          </div>

          {status === "idle" || status === "loading" ? (
            <form onSubmit={handleUnsubscribe} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "loading" ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Unsubscribe"
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                By unsubscribing, you will no longer receive promotional emails
                from RepMotivatedSeller. You may still receive transactional
                emails.
              </p>
            </form>
          ) : status === "success" ? (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Successfully Unsubscribed
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <a
                href="/"
                className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                Return to Home
              </a>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Something Went Wrong
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setStatus("idle");
                    setMessage("");
                  }}
                  className="w-full bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                  Try Again
                </button>
                <a
                  href="mailto:support@repmotivatedseller.com"
                  className="block text-primary-600 hover:text-primary-700 text-sm"
                >
                  Contact Support
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Changed your mind?{" "}
            <a
              href="/subscription"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Manage your preferences
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default UnsubscribePage;
