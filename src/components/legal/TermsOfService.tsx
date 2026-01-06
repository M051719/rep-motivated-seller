```typescript
// src/components/legal/TermsOfService.tsx
import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        <p className="text-sm text-gray-600 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8">
          {/* Acceptance */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing our website, using our services, or responding to our marketing communications 
              (including direct mail), you agree to be bound by these Terms of Service and our Privacy Policy.
            </p>
          </section>

          {/* Services Description */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Our Services</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">2.1 Foreclosure Assistance</h3>
            <p className="text-gray-700 mb-4">
              We provide educational resources, consultation services, and connections to qualified 
              professionals to help homeowners facing foreclosure.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3">2.2 Marketing Communications</h3>
            <p className="text-gray-700 mb-4">
              Our marketing includes:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li><strong>Direct Mail:</strong> Postcards and letters with foreclosure assistance information</li>
              <li><strong>Email Marketing:</strong> Educational content and service updates</li>
              <li><strong>SMS Marketing:</strong> Time-sensitive assistance notifications</li>
              <li><strong>Digital Advertising:</strong> Online ads for our services</li>
            </ul>
          </section>

          {/* Marketing Terms */}
          <section className="bg-yellow-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Marketing Communications Terms</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">3.1 Direct Mail Marketing</h3>
            <div className="bg-white p-4 rounded border">
              <h4 className="font-medium text-gray-800 mb-2">📬 What We Send</h4>
              <p className="text-gray-700 mb-3">
                We may send you direct mail containing information about foreclosure prevention services, 
                real estate opportunities, and educational resources.
              </p>
              
              <h4 className="font-medium text-gray-800 mb-2">📍 Address Sources</h4>
              <p className="text-gray-700 mb-3">
                We obtain mailing addresses from public records, data providers, and information you provide.
              </p>
              
              <h4 className="font-medium text-gray-800 mb-2">🚫 How to Opt Out</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Call: (555) 123-4567</li>
                <li>Email: optout@repmotivatedseller.org</li>
                <li>Visit: repmotivatedseller.org/unsubscribe</li>
              </ul>
            </div>

            <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">3.2 SMS Marketing</h3>
            <div className="bg-white p-4 rounded border">
              <p className="text-gray-700 mb-2">
                By providing your phone number and opting in, you consent to receive text messages. 
                Standard message and data rates apply.
              </p>
              <p className="text-sm text-gray-600">
                Reply STOP to opt out. Reply HELP for assistance.
              </p>
            </div>
          </section>

          {/* Legal Disclaimers */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Legal Disclaimers</h2>
            
            <div className="bg-red-50 p-4 rounded border-l-4 border-red-500 mb-4">
              <h3 className="font-medium text-red-800 mb-2">⚠️ Important Legal Notice</h3>
              <p className="text-red-700 text-sm">
                We are not attorneys and do not provide legal advice. We are not licensed mortgage brokers 
                or financial advisors. Our services are educational and referral-based only.
              </p>
            </div>

            <h3 className="text-xl font-medium text-gray-800 mb-3">4.1 No Attorney-Client Relationship</h3>
            <p className="text-gray-700 mb-4">
              Communication with us does not create an attorney-client relationship. For legal advice, 
              consult with a qualified attorney.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3">4.2 No Guarantee of Results</h3>
            <p className="text-gray-700 mb-4">
              We cannot guarantee any specific outcome regarding foreclosure prevention, loan modification, 
              or other financial matters.
            </p>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Responsibilities</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Act promptly on time-sensitive matters</li>
              <li>Consult with qualified professionals for legal and financial advice</li>
              <li>Respect our communication preferences and opt-out requests</li>
              <li>Use our services lawfully and ethically</li>
            </ul>
          </section>

          {/* Contact Information */}
          <section className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Contact Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Business Information</h3>
                <div className="text-gray-700 space-y-1">
                  <p>RepMotivatedSeller</p>
                  <p>123 Business Avenue</p>
                  <p>Your City, State 12345</p>
                  <p>Phone: (555) 123-4567</p>
                  <p>Email: info@repmotivatedseller.org</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Opt-Out Requests</h3>
                <div className="text-gray-700 space-y-1">
                  <p>Email: optout@repmotivatedseller.org</p>
                  <p>Phone: (555) 123-4567</p>
                  <p>Website: repmotivatedseller.org/unsubscribe</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
```;
