/**
 * PCI DSS Compliance Page
 * User-facing page displaying payment card security measures and compliance
 * Required by PCI DSS for transparency in payment processing
 */

import React from 'react';
import { Shield, CreditCard, Lock, CheckCircle, AlertCircle, Server, Eye } from 'lucide-react';

export default function PCIDSSCompliancePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <CreditCard className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PCI DSS Compliance & Payment Security
          </h1>
          <p className="text-lg text-gray-600">
            Your payment information is secure. Learn about our PCI DSS compliance and security measures.
          </p>
        </div>

        {/* Compliance Status */}
        <div className="bg-green-50 border-l-4 border-green-400 p-6 mb-8">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-green-900">PCI DSS Level 1 Service Provider</h2>
              <p className="text-sm text-green-700 mt-1">
                We maintain the highest level of PCI DSS compliance through our payment processor, Stripe.
              </p>
            </div>
          </div>
        </div>

        {/* What is PCI DSS Section */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center mb-6">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">What is PCI DSS?</h2>
          </div>
          <p className="text-gray-600 mb-4">
            The Payment Card Industry Data Security Standard (PCI DSS) is a set of security standards designed to ensure that all 
            companies that accept, process, store, or transmit credit card information maintain a secure environment.
          </p>
          <p className="text-gray-600">
            PCI DSS was created by major card brands including Visa, Mastercard, American Express, Discover, and JCB to protect 
            cardholder data and reduce credit card fraud.
          </p>
        </section>

        {/* 12 Requirements Section */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center mb-6">
            <Lock className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">The 12 PCI DSS Requirements</h2>
          </div>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-800">Build and Maintain a Secure Network</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 mt-2 ml-4">
                <li>Install and maintain firewall configuration to protect cardholder data</li>
                <li>Do not use vendor-supplied defaults for system passwords and security parameters</li>
              </ul>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-gray-800">Protect Cardholder Data</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 mt-2 ml-4">
                <li>Protect stored cardholder data with strong encryption</li>
                <li>Encrypt transmission of cardholder data across open, public networks</li>
              </ul>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-800">Maintain a Vulnerability Management Program</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 mt-2 ml-4">
                <li>Protect all systems against malware and regularly update anti-virus software</li>
                <li>Develop and maintain secure systems and applications</li>
              </ul>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-semibold text-gray-800">Implement Strong Access Control Measures</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 mt-2 ml-4">
                <li>Restrict access to cardholder data by business need-to-know</li>
                <li>Identify and authenticate access to system components</li>
                <li>Restrict physical access to cardholder data</li>
              </ul>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-semibold text-gray-800">Regularly Monitor and Test Networks</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 mt-2 ml-4">
                <li>Track and monitor all access to network resources and cardholder data</li>
                <li>Regularly test security systems and processes</li>
              </ul>
            </div>
            <div className="border-l-4 border-indigo-500 pl-4">
              <h3 className="font-semibold text-gray-800">Maintain an Information Security Policy</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 mt-2 ml-4">
                <li>Maintain a policy that addresses information security for all personnel</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How We Protect Your Payment Information */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center mb-6">
            <Server className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">How We Protect Your Payment Information</h2>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                Secure Payment Processing
              </h3>
              <p className="text-gray-600">
                We use Stripe, a PCI DSS Level 1 certified payment processor, to handle all credit card transactions. 
                Your payment information never touches our servers - it goes directly to Stripe's secure, encrypted systems.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                Industry-Standard Encryption
              </h3>
              <p className="text-gray-600">
                All payment data is encrypted using TLS 1.2+ during transmission and AES-256 encryption at rest. 
                We never store complete credit card numbers, CVV codes, or PIN numbers.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                Tokenization
              </h3>
              <p className="text-gray-600">
                Instead of storing card details, we use secure tokens provided by Stripe. These tokens are useless 
                to anyone who might intercept them and cannot be reverse-engineered to reveal card information.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                Regular Security Audits
              </h3>
              <p className="text-gray-600">
                We undergo regular security assessments and vulnerability scans to ensure our systems remain secure 
                and compliant with the latest PCI DSS requirements.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                Fraud Monitoring
              </h3>
              <p className="text-gray-600">
                Stripe's advanced fraud detection systems, powered by machine learning, monitor transactions 24/7 
                to identify and prevent fraudulent activity.
              </p>
            </div>
          </div>
        </section>

        {/* What Information We Collect */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center mb-6">
            <Eye className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Payment Information We Process</h2>
          </div>
          <p className="text-gray-600 mb-4">
            When you make a payment, the following information is securely processed by Stripe:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Credit or debit card number</li>
            <li>Card expiration date</li>
            <li>Cardholder name</li>
            <li>Billing address</li>
            <li>Transaction amount and currency</li>
          </ul>
          <p className="text-gray-600 mt-4">
            <strong>What we do NOT store:</strong> We never store complete credit card numbers, CVV/CVC codes, 
            or magnetic stripe data. Only Stripe has access to your full payment card details.
          </p>
        </section>

        {/* Your Rights and Responsibilities */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center mb-6">
            <AlertCircle className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Your Rights and Responsibilities</h2>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Rights:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li>Request information about how your payment data is processed</li>
                <li>Update or delete stored payment methods at any time</li>
                <li>Dispute unauthorized transactions with your card issuer</li>
                <li>Opt out of storing payment information for future use</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Responsibilities:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li>Keep your account credentials secure and confidential</li>
                <li>Review your account statements regularly for unauthorized charges</li>
                <li>Report any suspicious activity immediately</li>
                <li>Use secure internet connections when making payments</li>
                <li>Keep your contact information up to date</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Security Best Practices */}
        <section className="bg-blue-50 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Best Practices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">For You:</h3>
              <ul className="list-disc list-inside space-y-2 text-blue-800 text-sm">
                <li>Use strong, unique passwords</li>
                <li>Enable two-factor authentication</li>
                <li>Avoid public WiFi for transactions</li>
                <li>Keep your device software updated</li>
                <li>Verify website security (HTTPS)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">For Us:</h3>
              <ul className="list-disc list-inside space-y-2 text-blue-800 text-sm">
                <li>SSL/TLS encryption for all connections</li>
                <li>Regular security training for staff</li>
                <li>Incident response procedures</li>
                <li>Continuous security monitoring</li>
                <li>Annual PCI DSS compliance validation</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions or Concerns?</h2>
          <p className="text-gray-600 mb-4">
            If you have questions about our payment security practices or wish to report a security concern, 
            please contact us:
          </p>
          <div className="space-y-3">
            <div>
              <strong>Email:</strong>{' '}
              <a href="mailto:privacy@repmotivatedseller.shoprealestatespace.org" className="underline hover:text-blue-200">
                privacy@repmotivatedseller.shoprealestatespace.org
              </a>
            </div>
            <div>
              <strong>Phone:</strong> 1-877-806-4677
            </div>
            <div>
              <strong>Mail:</strong> Privacy Officer, Rep Motivated Seller
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This page describes our commitment to PCI DSS compliance. For information about how we use your 
              personal information, please see our <a href="/privacy-policy" className="text-blue-600 underline">Privacy Policy</a>.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
