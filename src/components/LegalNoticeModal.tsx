import React, { useState } from "react";
import { X, Shield, AlertTriangle, FileText, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LegalNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export default function LegalNoticeModal({
  isOpen,
  onClose,
  onAccept,
}: LegalNoticeModalProps) {
  const [agreed, setAgreed] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isAtBottom =
      Math.abs(
        element.scrollHeight - element.scrollTop - element.clientHeight,
      ) < 10;
    if (isAtBottom) {
      setScrolledToBottom(true);
    }
  };

  const handleAccept = () => {
    if (agreed && scrolledToBottom) {
      localStorage.setItem("legal_notice_accepted", "true");
      localStorage.setItem("legal_notice_date", new Date().toISOString());
      onAccept();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">Important Legal Notice</h2>
                  <p className="text-red-100 text-sm">
                    Please read carefully before proceeding
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div
              className="px-6 py-6 overflow-y-auto max-h-[60vh] space-y-6"
              onScroll={handleScroll}
            >
              {/* Alert Banner */}
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-yellow-900 mb-1">
                      Mandatory Compliance Notice
                    </h3>
                    <p className="text-sm text-yellow-800">
                      By using RepMotivatedSeller services, tools, or materials,
                      you agree to the following legally binding terms.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 1: In-House Loan Processing */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <span>1. In-House Loan Processing Requirement</span>
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-800 leading-relaxed mb-3">
                    <strong className="text-blue-900">
                      ALL LOANS MUST BE PROCESSED THROUGH REPMOTIVATEDSELLER.
                    </strong>
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed mb-2">
                    Any real estate transaction, property acquisition, or
                    financing arrangement resulting from or facilitated by:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                    <li>
                      Use of RepMotivatedSeller website, tools, or calculators
                    </li>
                    <li>Leads generated through our marketing materials</li>
                    <li>Contacts obtained via our platform</li>
                    <li>Properties identified through our services</li>
                    <li>Information accessed through member resources</li>
                  </ul>
                  <p className="text-gray-700 text-sm leading-relaxed mt-3">
                    <strong>
                      MUST have all loan applications and financing processed
                      exclusively through RepMotivatedSeller's in-house lending
                      services.
                    </strong>
                  </p>
                </div>
              </div>

              {/* Section 2: Intellectual Property Protection */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <Shield className="w-6 h-6 text-purple-600" />
                  <span>2. Intellectual Property & Data Protection</span>
                </h3>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
                  <div>
                    <h4 className="font-semibold text-purple-900 mb-2">
                      Strictly Prohibited Actions:
                    </h4>
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 ml-4">
                      <li>
                        <strong>Theft of Data:</strong> Downloading, scraping,
                        copying, or extracting any contact information, property
                        data, or user information
                      </li>
                      <li>
                        <strong>Unauthorized Contact:</strong> Reaching out to
                        sellers, buyers, or prospects identified through our
                        platform without processing through RepMotivatedSeller
                      </li>
                      <li>
                        <strong>Material Misappropriation:</strong> Copying,
                        reproducing, or using our templates, forms, scripts, or
                        marketing materials outside of the platform
                      </li>
                      <li>
                        <strong>Post-Membership Contact:</strong> Continuing to
                        contact or solicit any leads obtained during membership
                        after termination or suspension
                      </li>
                      <li>
                        <strong>Third-Party Disclosure:</strong> Sharing
                        platform data with non-members, family, employees,
                        virtual assistants, or business partners
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white border border-purple-300 rounded p-3">
                    <p className="text-xs text-gray-600">
                      <strong>⚖️ Legal Consequences:</strong> Violations will
                      result in immediate account termination, civil liability
                      for damages, and potential criminal prosecution for theft
                      of trade secrets under federal and state law.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3: Land Acquisition Rights */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <FileText className="w-6 h-6 text-green-600" />
                  <span>3. Land Acquisition & Marketing Rights</span>
                </h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    <strong className="text-green-900">
                      RepMotivatedSeller retains exclusive marketing and
                      acquisition rights
                    </strong>{" "}
                    for all properties identified, marketed, or transacted
                    through our platform, including:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                    <li>Foreclosure properties identified via our tools</li>
                    <li>
                      Pre-foreclosure leads generated through our marketing
                    </li>
                    <li>Properties listed in our marketplace or database</li>
                    <li>Land acquisitions facilitated by our services</li>
                  </ul>
                  <div className="bg-white border border-green-300 rounded p-3 mt-3">
                    <p className="text-sm text-gray-700">
                      <strong>Direct Mail Marketing:</strong> We utilize Lob
                      (third-party service) for direct mail campaigns. All
                      properties contacted through these campaigns are subject
                      to this agreement and must be processed through
                      RepMotivatedSeller exclusively.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 4: Member Obligations */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900">
                  4. Ongoing Member Obligations
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    During and after your membership, you agree to:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>
                        Process ALL deals through RepMotivatedSeller's in-house
                        lending
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>
                        Immediately cease contact with platform leads upon
                        membership termination
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>
                        Return or destroy all downloaded materials within 24
                        hours of termination
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>
                        Not share login credentials with assistants, employees,
                        or family members
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>
                        Report any unauthorized access or data breaches
                        immediately
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Section 5: Enforcement & Remedies */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900">
                  5. Enforcement & Legal Remedies
                </h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    RepMotivatedSeller reserves all legal rights and remedies,
                    including but not limited to:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                    <li>
                      Immediate account termination and ban from all services
                    </li>
                    <li>
                      Civil damages including lost profits, treble damages, and
                      attorney fees
                    </li>
                    <li>Injunctive relief to prevent ongoing violations</li>
                    <li>
                      Criminal referral for theft of trade secrets or computer
                      fraud
                    </li>
                    <li>
                      Reporting to real estate licensing boards and regulatory
                      agencies
                    </li>
                  </ul>
                  <div className="bg-white border border-red-300 rounded p-3 mt-3">
                    <p className="text-xs text-red-800 font-semibold">
                      🚨 Minimum statutory damages of $10,000 per violation plus
                      actual damages. All legal disputes subject to binding
                      arbitration in Los Angeles County, California.
                    </p>
                  </div>
                </div>
              </div>

              {/* Governing Law */}
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">
                  Governing Law & Venue:
                </h4>
                <p className="text-xs text-gray-700 leading-relaxed">
                  This agreement is governed by the laws of the State of
                  California. Exclusive venue for any disputes shall be Los
                  Angeles County Superior Court or binding arbitration
                  administered by JAMS. By clicking "I Agree and Accept," you
                  acknowledge that you have read, understood, and agree to be
                  legally bound by these terms. This agreement is effective
                  immediately and survives termination of your membership.
                </p>
              </div>

              {/* Scroll indicator */}
              {!scrolledToBottom && (
                <div className="text-center py-2">
                  <p className="text-sm text-gray-500 animate-bounce">
                    ↓ Please scroll to the bottom to continue ↓
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
              <div className="flex items-start space-x-3 mb-4">
                <input
                  type="checkbox"
                  id="agree-checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  disabled={!scrolledToBottom}
                  className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <label
                  htmlFor="agree-checkbox"
                  className={`text-sm ${scrolledToBottom ? "text-gray-900" : "text-gray-400"} select-none`}
                >
                  I have read and understood all terms above. I agree to process
                  all loans through RepMotivatedSeller, protect all proprietary
                  information, and comply with all restrictions during and after
                  my membership. I understand violations may result in legal
                  action and significant financial penalties.
                </label>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                >
                  Decline & Exit
                </button>
                <button
                  onClick={handleAccept}
                  disabled={!agreed || !scrolledToBottom}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                    agreed && scrolledToBottom
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  I Agree and Accept
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
