import React from 'react';
import { BackButton } from '../components/ui/BackButton';

export const DisclaimerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto mb-4">
        <BackButton />
      </div>
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 pb-3 border-b-4 border-red-600">
          Disclaimer
        </h1>
        <p className="text-gray-600 mb-6">Last updated: July 17, 2025</p>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <p className="text-gray-800">
            <strong>Important Notice:</strong> This disclaimer contains important information about the limitations of our foreclosure assistance services. Please read carefully before using our platform.
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
        <p className="text-gray-700 mb-4">For the purposes of this Disclaimer:</p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
          <li>
            <strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Disclaimer) refers to sofie's investment group llc, 14603 gilmore street.
          </li>
          <li>
            <strong>Service</strong> refers to the Website or the Application or both.
          </li>
          <li>
            <strong>You</strong> means the individual accessing the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.
          </li>
          <li>
            <strong>Website</strong> refers to RepMotivatedSeller - Foreclosure Assistance Platform, accessible from{' '}
            <a href="https://repmotivatedseller.shoprealestatespace.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              https://repmotivatedseller.shoprealestatespace.org
            </a>
          </li>
          <li>
            <strong>Application</strong> means the software program provided by the Company downloaded by You on any electronic device named RepMotivatedSeller.
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
          General Disclaimer
        </h2>
        <p className="text-gray-700 mb-4">
          The information contained on the Service is for general information purposes only.
        </p>
        <p className="text-gray-700 mb-4">
          The Company assumes no responsibility for errors or omissions in the contents of the Service.
        </p>
        <p className="text-gray-700 mb-6">
          In no event shall the Company be liable for any special, direct, indirect, consequential, or incidental damages or any damages whatsoever, whether in an action of contract, negligence or other tort, arising out of or in connection with the use of the Service or the contents of the Service.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Legal Advice Disclaimer</h3>
          <p className="text-gray-700 mb-3">
            <strong>We are not attorneys and do not provide legal advice.</strong>
          </p>
          <p className="text-gray-700 mb-3">
            The information provided through our foreclosure assistance platform is for informational purposes only and should not be considered legal advice. Every foreclosure situation is unique and may require professional legal counsel.
          </p>
          <p className="text-gray-700">
            We strongly recommend consulting with a qualified attorney or HUD-approved housing counselor before making any decisions regarding your foreclosure situation.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
          No Guarantees
        </h2>
        <p className="text-gray-700 mb-4">
          The Company reserves the right to make additions, deletions, or modifications to the contents on the Service at any time without prior notice.
        </p>
        <p className="text-gray-700 mb-6">
          The Company does not warrant that the Service is free of viruses or other harmful components.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
          Property Analysis Disclaimer
        </h2>
        <p className="text-gray-700 mb-6">
          Property valuations, market analyses, and foreclosure assistance information provided through our platform are estimates based on available data and should not be solely relied upon for making financial or legal decisions. Always verify information with qualified professionals.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
          External Links Disclaimer
        </h2>
        <p className="text-gray-700 mb-6">
          The Service may contain links to external websites that are not provided or maintained by or in any way affiliated with the Company. Please note that the Company does not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
          Errors and Omissions Disclaimer
        </h2>
        <p className="text-gray-700 mb-6">
          The information given by the Service is for general guidance on matters of interest only. Even if the Company takes every precaution to ensure that the content of the Service is both current and accurate, errors can occur. Plus, given the changing nature of laws, rules and regulations, there may be delays, omissions or inaccuracies in the information contained on the Service.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
          Fair Use Disclaimer
        </h2>
        <p className="text-gray-700 mb-6">
          The Company may use copyrighted material which has not always been specifically authorized by the copyright owner. The Company is making such material available for criticism, comment, news reporting, teaching, scholarship, or research.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
          Views Expressed Disclaimer
        </h2>
        <p className="text-gray-700 mb-6">
          The Service may contain views and opinions which are those of the authors and do not necessarily reflect the official policy or position of any other author, agency, organization, employer or company, including the Company.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
          No Responsibility Disclaimer
        </h2>
        <p className="text-gray-700 mb-6">
          The information on the Service is provided with the understanding that the Company is not herein engaged in rendering legal, accounting, tax, or other professional advice and services. As such, it should not be used as a substitute for consultation with professional accounting, tax, legal or other competent advisers.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
          Contact Us
        </h2>
        <p className="text-gray-700 mb-4">
          If you have any questions about this Disclaimer, You can contact us:
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

export default DisclaimerPage;
