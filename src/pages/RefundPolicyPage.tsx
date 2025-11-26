import React from 'react';
import { BackButton } from '../components/ui/BackButton';

export const RefundPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto mb-4">
        <BackButton />
      </div>
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 pb-3 border-b-4 border-green-600">
          Return and Refund Policy
        </h1>
        <p className="text-gray-600 mb-6">Last updated: July 17, 2025</p>

        <p className="text-gray-700 mb-4">
          Thank you for choosing RepMotivatedSeller - Foreclosure Assistance Platform for your foreclosure assistance needs.
        </p>
        <p className="text-gray-700 mb-6">
          If, for any reason, You are not completely satisfied with a purchase We invite You to review our policy on refunds and returns.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <p className="text-gray-800">
            <strong>Our Commitment:</strong> We stand behind our foreclosure assistance services and want to ensure your complete satisfaction with our platform.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
          Interpretation and Definitions
        </h2>

        <h3 className="text-xl font-semibold text-gray-800 mb-3">Interpretation</h3>
        <p className="text-gray-700 mb-6">
          The words of which the initial letter is capitalized have meanings defined under the following conditions.
          The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
        </p>

        <h3 className="text-xl font-semibold text-gray-800 mb-3">Definitions</h3>
        <p className="text-gray-700 mb-4">For the purposes of this Return and Refund Policy:</p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
          <li>
            <strong>Application</strong> means the software program provided by the Company downloaded by You on any electronic device, named RepMotivatedSeller
          </li>
          <li>
            <strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to sofie's investment group llc, 14603 gilmore street apt 7.
          </li>
          <li>
            <strong>Services</strong> refer to the foreclosure assistance services offered through the platform.
          </li>
          <li>
            <strong>Orders</strong> mean a request by You to purchase Services from Us.
          </li>
          <li>
            <strong>Service</strong> refers to the Application or the Website or both.
          </li>
          <li>
            <strong>Website</strong> refers to RepMotivatedSeller - Foreclosure Assistance Platform, accessible from{' '}
            <a href="https://repmotivatedseller.shoprealestatespace.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              https://repmotivatedseller.shoprealestatespace.org
            </a>
          </li>
          <li>
            <strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
          Foreclosure Assistance Services Refund Policy
        </h2>
        <p className="text-gray-700 mb-6">
          Due to the nature of our foreclosure assistance services, refunds are handled on a case-by-case basis.
          We understand that foreclosure situations are unique and time-sensitive.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <p className="text-gray-800 mb-4">
            <strong>Service Guarantee:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Professional consultation services provided in good faith</li>
            <li>Accurate property analysis and market comparisons</li>
            <li>Timely response to foreclosure assistance inquiries</li>
            <li>Transparent pricing with no hidden fees</li>
          </ul>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
          Contact Us
        </h2>
        <p className="text-gray-700 mb-4">
          If you have any questions about our Return and Refund Policy, please contact us:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>By email: melvin@repmotivatedseller.shoprealestatespace.org</li>
          <li>By phone number: 8337289278</li>
          <li>By visiting this page on our website:{' '}
            <a href="https://repmotivatedseller.shoprealestatespace.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              https://repmotivatedseller.shoprealestatespace.org
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RefundPolicyPage;
