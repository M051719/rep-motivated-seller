/**
 * GLBA Compliance Page
 * User-facing page displaying privacy notices, security measures, and user rights
 * Required by GLBA Privacy Rule for customer notification
 */

import React from 'react';
import { Shield, Lock, FileText, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { GLBAEncryption } from '../lib/encryption/glba-encryption';

export default function GLBACompliancePage() {
  const [complianceInfo, setComplianceInfo] = React.useState<any>(null);

  React.useEffect(() => {
    try {
      const info = GLBAEncryption.getComplianceInfo();
      setComplianceInfo(info);
    } catch (error) {
      console.error('Failed to load compliance info:', error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            GLBA Compliance & Data Security
          </h1>
          <p className="text-lg text-gray-600">
            Your privacy and data security are our top priorities. Learn how we protect your financial information.
          </p>
        </div>

        {/* Compliance Status */}
        {complianceInfo && (
          <div className="bg-green-50 border-l-4 border-green-400 p-6 mb-8">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h2 className="text-lg font-semibold text-green-900">GLBA Compliant</h2>
                <p className="text-sm text-green-700 mt-1">
                  Our systems are fully compliant with the Gramm-Leach-Bliley Act requirements.
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-green-800">
              <div>
                <strong>Encryption:</strong> {complianceInfo.algorithm.toUpperCase()}
              </div>
              <div>
                <strong>TLS Version:</strong> {complianceInfo.tlsMinVersion}+
              </div>
              <div>
                <strong>Key Rotation:</strong> Every {complianceInfo.keyRotationDays} days
              </div>
              <div>
                <strong>Audit Retention:</strong> {complianceInfo.auditRetentionDays} days (7 years)
              </div>
            </div>
          </div>
        )}

        {/* Privacy Rule Section */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center mb-6">
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Privacy Rule</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">What Information We Collect</h3>
              <p className="text-gray-600 mb-3">
                We collect and maintain the following types of Nonpublic Personal Information (NPI):
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li>Information from applications and forms (name, address, Social Security number)</li>
                <li>Transaction history and account balances</li>
                <li>Credit reports and credit scores</li>
                <li>Information from consumer reporting agencies</li>
                <li>Financial account numbers and payment information</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">How We Use Your Information</h3>
              <p className="text-gray-600 mb-3">
                We use your information to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li>Process your transactions and maintain your accounts</li>
                <li>Verify your identity and prevent fraud</li>
                <li>Provide customer service and respond to inquiries</li>
                <li>Comply with legal and regulatory requirements</li>
                <li>Improve our services and develop new products</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Information Sharing Practices</h3>
              <p className="text-gray-600 mb-3">
                We do NOT share your nonpublic personal information with non-affiliated third parties for marketing purposes. We may share information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li>With service providers who perform services on our behalf</li>
                <li>As required by law or to comply with legal process</li>
                <li>To protect against fraud and unauthorized transactions</li>
                <li>With your consent or at your direction</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Your Choice:</strong> You can limit our sharing of your information. Contact us to opt-out of certain information-sharing arrangements.
              </p>
            </div>
          </div>
        </section>

        {/* Safeguards Rule Section */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center mb-6">
            <Lock className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Safeguards Rule</h2>
          </div>

          <div className="space-y-6">
            <p className="text-gray-600">
              We maintain a comprehensive information security program to protect your financial data:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-800 mb-2">Encryption</h3>
                <p className="text-sm text-gray-600">
                  All sensitive data is encrypted using AES-256-GCM encryption, a FIPS 140-2 approved algorithm with authenticated encryption.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-800 mb-2">Secure Transport</h3>
                <p className="text-sm text-gray-600">
                  All data transmissions use TLS 1.3+ encryption with HSTS (HTTP Strict Transport Security) enabled.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-800 mb-2">Access Controls</h3>
                <p className="text-sm text-gray-600">
                  Multi-factor authentication and role-based access control ensure only authorized personnel can access your data.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-800 mb-2">Audit Logging</h3>
                <p className="text-sm text-gray-600">
                  All access to sensitive data is logged and retained for 7 years for compliance and security monitoring.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-800 mb-2">Key Rotation</h3>
                <p className="text-sm text-gray-600">
                  Encryption keys are automatically rotated every 90 days to maintain security best practices.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-800 mb-2">Security Monitoring</h3>
                <p className="text-sm text-gray-600">
                  24/7 security monitoring and incident response to detect and prevent unauthorized access attempts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Your Rights Section */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center mb-6">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              Under GLBA, you have the following rights regarding your personal information:
            </p>

            <div className="space-y-3">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800">Right to Privacy Notice</h3>
                  <p className="text-sm text-gray-600">Receive annual privacy notices about our information practices</p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800">Right to Opt-Out</h3>
                  <p className="text-sm text-gray-600">Limit sharing of your information with non-affiliated parties</p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800">Right to Access</h3>
                  <p className="text-sm text-gray-600">Request access to your personal information we maintain</p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800">Right to Correction</h3>
                  <p className="text-sm text-gray-600">Request correction of inaccurate information</p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800">Right to Security</h3>
                  <p className="text-sm text-gray-600">Expect your information to be protected with appropriate safeguards</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pretexting Protection */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center mb-6">
            <AlertCircle className="h-8 w-8 text-red-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Pretexting Protection</h2>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              Pretexting is the practice of obtaining personal information under false pretenses. We protect you by:
            </p>

            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>Verifying identity before disclosing any account information</li>
              <li>Using multi-factor authentication for sensitive operations</li>
              <li>Training employees to recognize and prevent pretexting attempts</li>
              <li>Maintaining detailed audit logs of all information access</li>
              <li>Never asking for sensitive information via email or unsolicited calls</li>
            </ul>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> We will never ask you to provide your password, SSN, or account numbers via email. If someone claims to represent us and requests this information, do not provide it and contact us immediately.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-blue-600 text-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-4">Questions About Your Privacy?</h2>
          <p className="mb-6">
            If you have questions about our privacy practices or wish to exercise your rights under GLBA, please contact us:
          </p>

          <div className="space-y-3">
            <div>
              <strong>Email:</strong> 
              <a href="mailto:privacy@repmotivatedseller.com" className="underline hover:text-blue-200">
                privacy@repmotivatedseller.com
              </a>
            </div>
            <div>
              <strong>Phone:</strong> 1-877-806-4677
            </div>
            <div>
              <strong>Mail:</strong> Privacy Officer, Rep Motivated Seller
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-blue-500">
            <p className="text-sm">
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-sm mt-2">
              This notice describes our privacy practices and is provided annually as required by the Gramm-Leach-Bliley Act.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

