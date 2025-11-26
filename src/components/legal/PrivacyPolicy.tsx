```typescript
// src/components/legal/PrivacyPolicy.tsx
import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              RepMotivatedSeller ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you visit our website, 
              use our services, or interact with our direct mail marketing campaigns.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">2.1 Personal Information You Provide</h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li><strong>Contact Information:</strong> Name, email address, phone number, mailing address</li>
              <li><strong>Property Information:</strong> Property address, mortgage details, financial situation</li>
              <li><strong>Communication Preferences:</strong> SMS opt-ins, email preferences, direct mail preferences</li>
              <li><strong>Financial Information:</strong> Income details, debt information (for foreclosure assistance)</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">2.2 Information We Collect Automatically</h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li><strong>Usage Data:</strong> Pages visited, time spent on site, click patterns</li>
              <li><strong>Device Information:</strong> IP address, browser type, device identifiers</li>
              <li><strong>Location Data:</strong> General geographic location based on IP address</li>
              <li><strong>Cookies and Tracking:</strong> Website analytics and performance data</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">2.3 Third-Party Data Sources</h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li><strong>Public Records:</strong> Property ownership, foreclosure filings, tax records</li>
              <li><strong>Data Providers:</strong> Address verification, demographic information</li>
              <li><strong>Marketing Lists:</strong> Pre-foreclosure leads, distressed property information</li>
              <li><strong>Credit Information:</strong> With your consent, for assistance evaluation</li>
            </ul>
          </section>

          {/* Direct Mail Marketing */}
          <section className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Direct Mail Marketing</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">3.1 How We Use Direct Mail</h3>
            <p className="text-gray-700 mb-4">
              We may send you direct mail (postcards, letters) containing information about:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Foreclosure prevention services</li>
              <li>Real estate investment opportunities</li>
              <li>Educational resources and workshops</li>
              <li>Time-sensitive assistance programs</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">3.2 Direct Mail Data Sources</h3>
            <p className="text-gray-700 mb-4">
              We obtain mailing addresses from:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Information you provide directly to us</li>
              <li>Public records (property ownership, foreclosure filings)</li>
              <li>Licensed data providers and marketing lists</li>
              <li>Address verification services</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">3.3 Opt-Out Rights</h3>
            <div className="bg-white p-4 rounded border-l-4 border-blue-500">
              <p className="text-gray-700 mb-2">
                <strong>You have the right to opt out of direct mail at any time:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Call us at: <strong>(555) 123-4567</strong></li>
                <li>Email us at: <strong>optout@repmotivatedseller.org</strong></li>
                <li>Visit: <strong>repmotivatedseller.org/unsubscribe</strong></li>
                <li>Write to us at our mailing address (below)</li>
              </ul>
              <p className="text-sm text-gray-600 mt-2">
                We will process opt-out requests within 10 business days.
              </p>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. How We Use Your Information</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">4.1 Primary Uses</h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li><strong>Foreclosure Assistance:</strong> Providing consultation and assistance services</li>
              <li><strong>Communication:</strong> Responding to inquiries and providing updates</li>
              <li><strong>Service Delivery:</strong> Connecting you with appropriate resources</li>
              <li><strong>Legal Compliance:</strong> Meeting regulatory and legal requirements</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">4.2 Marketing Uses</h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li><strong>Direct Mail Campaigns:</strong> Sending relevant service information</li>
              <li><strong>Email Marketing:</strong> With your consent, educational content and offers</li>
              <li><strong>SMS Marketing:</strong> With your explicit consent, urgent updates</li>
              <li><strong>Targeted Advertising:</strong> Showing relevant ads on other platforms</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Information Sharing and Disclosure</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">5.1 Service Providers</h3>
            <p className="text-gray-700 mb-4">We share information with trusted third parties who help us operate our business:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li><strong>Direct Mail Services:</strong> Lob, PostGrid (for printing and mailing)</li>
              <li><strong>SMS Services:</strong> Twilio (for text messaging)</li>
              <li><strong>Email Services:</strong> SendGrid, Mailchimp (for email campaigns)</li>
              <li><strong>Analytics:</strong> Google Analytics, Hotjar (for website analysis)</li>
              <li><strong>Cloud Storage:</strong> Supabase, AWS (for data storage)</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">5.2 Legal Professionals</h3>
            <p className="text-gray-700 mb-4">
              With your consent, we may share your information with qualified attorneys, financial counselors, 
              or real estate professionals who can assist with your situation.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3">5.3 Legal Requirements</h3>
            <p className="text-gray-700 mb-4">
              We may disclose your information when required by law, court order, or to protect our rights and safety.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement appropriate security measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>SSL encryption for data transmission</li>
              <li>Secure cloud storage with access controls</li>
              <li>Regular security audits and updates</li>
              <li>Employee training on data protection</li>
              <li>Third-party security certifications</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section className="bg-green-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Privacy Rights</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">📧 Email Opt-Out</h3>
                <p className="text-sm text-gray-600 mb-2">Unsubscribe links in every email</p>
                
                <h3 className="text-lg font-medium text-gray-800 mb-2">📱 SMS Opt-Out</h3>
                <p className="text-sm text-gray-600 mb-2">Reply "STOP" to any text message</p>
                
                <h3 className="text-lg font-medium text-gray-800 mb-2">📬 Direct Mail Opt-Out</h3>
                <p className="text-sm text-gray-600">Call or email us to remove your address</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">🔍 Access Your Data</h3>
                <p className="text-sm text-gray-600 mb-2">Request a copy of your personal information</p>
                
                <h3 className="text-lg font-medium text-gray-800 mb-2">✏️ Correct Your Data</h3>
                <p className="text-sm text-gray-600 mb-2">Update or correct inaccurate information</p>
                
                <h3 className="text-lg font-medium text-gray-800 mb-2">🗑️ Delete Your Data</h3>
                <p className="text-sm text-gray-600">Request deletion of your personal information</p>
              </div>
            </div>
          </section>

          {/* State-Specific Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. State-Specific Privacy Rights</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">8.1 California Residents (CCPA)</h3>
            <p className="text-gray-700 mb-4">
              California residents have additional rights under the California Consumer Privacy Act:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Right to know what personal information we collect</li>
              <li>Right to delete personal information</li>
              <li>Right to opt-out of sale of personal information</li>
              <li>Right to non-discrimination for exercising privacy rights</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">8.2 Other States</h3>
            <p className="text-gray-700 mb-4">
              We comply with applicable state privacy laws including Virginia, Colorado, and Connecticut privacy acts.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              For questions about this Privacy Policy or to exercise your rights:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">📞 Phone</h3>
                <p className="text-gray-700 mb-4">(555) 123-4567</p>
                
                <h3 className="font-medium text-gray-800 mb-2">📧 Email</h3>
                <p className="text-gray-700 mb-4">privacy@repmotivatedseller.org</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 mb-2">📬 Mailing Address</h3>
                <div className="text-gray-700">
                  <p>RepMotivatedSeller Privacy Office</p>
                  <p>123 Business Avenue</p>
                  <p>Your City, State 12345</p>
                </div>
              </div>
            </div>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy periodically. We will notify you of material changes by:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Posting the updated policy on our website</li>
              <li>Sending email notification to registered users</li>
              <li>Including notice in direct mail communications</li>
            </ul>
            <p className="text-gray-700">
              Your continued use of our services after changes indicates acceptance of the updated policy.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t pt-8 mt-8">
          <p className="text-sm text-gray-500 text-center">
            This Privacy Policy is effective as of {new Date().toLocaleDateString()} and governs all 
            interactions with RepMotivatedSeller services.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
```