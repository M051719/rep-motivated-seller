import React from 'react';
import { Link } from 'react-router-dom';

const MarketingDashboard: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Marketing Dashboard</h1>
      <div className="mb-12">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 flex flex-col md:flex-row items-center justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h2 className="text-3xl font-bold text-white mb-2">Direct Mail Marketing</h2>
            <p className="text-lg text-blue-100 max-w-xl">Create beautiful, effective postcards and letters. Empathic, real-world CTAs. Send offers, proposals, and campaigns—all in one place.</p>
          </div>
          <Link to="/marketing/send-letter" className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg shadow hover:bg-blue-50 transition text-lg">Start Campaign</Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Lob & Canva Options */}
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center border border-blue-100 hover:shadow-2xl transition">
          <span className="text-5xl mb-4">📬</span>
          <h2 className="text-2xl font-bold mb-2 text-blue-700">Lob Delivery</h2>
          <p className="text-gray-600 mb-4 text-center">Mail via Lob: fast, secure, and trackable. Choose letters, postcards, or bulk campaigns.</p>
          <div className="w-full flex flex-col gap-2 mb-4">
            <Link to="/marketing/send-letter?type=letter" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Send Letter</Link>
            <Link to="/marketing/send-letter?type=postcard" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">Send Postcard</Link>
            <Link to="/marketing/send-letter?type=campaign" className="bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500 transition">Start Campaign</Link>
          </div>
          <div className="text-sm text-blue-500 font-medium">Lob Pricing: <span className="font-bold">Letters $0.99+, Postcards $0.70+</span></div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center border border-pink-100 hover:shadow-2xl transition">
          <span className="text-5xl mb-4">🎨</span>
          <h2 className="text-2xl font-bold mb-2 text-pink-600">Canva Design</h2>
          <p className="text-gray-600 mb-4 text-center">Design with Canva: drag-and-drop templates for postcards, letters, and offers. Download or send directly.</p>
          <div className="w-full flex flex-col gap-2 mb-4">
            <a href="https://www.canva.com/" target="_blank" rel="noopener noreferrer" className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition">Open Canva</a>
            <Link to="/marketing/send-letter?type=canva" className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition">Import Canva Design</Link>
          </div>
          <div className="text-sm text-pink-500 font-medium">Canva Pricing: <span className="font-bold">Free & Pro Options</span></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {/* Offer Letter */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border border-green-100 hover:shadow-xl transition">
          <span className="text-4xl mb-4">💼</span>
          <h3 className="text-lg font-semibold mb-2 text-green-700">Create Offer Letter</h3>
          <p className="text-gray-600 mb-4 text-center">Investor’s offer price, seller’s asking price, actual cost, property info, and more. Empathic, clear, and professional.</p>
          <Link to="/marketing/send-letter?type=offer" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">Create Offer Letter</Link>
        </div>
        {/* Proposal */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border border-yellow-100 hover:shadow-xl transition">
          <span className="text-4xl mb-4">📝</span>
          <h3 className="text-lg font-semibold mb-2 text-yellow-700">Create Proposal</h3>
          <p className="text-gray-600 mb-4 text-center">Send a professional proposal for any property or campaign. Customizable and ready to mail or download.</p>
          <Link to="/marketing/send-letter?type=proposal" className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition">Create Proposal</Link>
        </div>
        {/* Pricing Card */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border border-indigo-100 hover:shadow-xl transition">
          <span className="text-4xl mb-4">💳</span>
          <h3 className="text-lg font-semibold mb-2 text-indigo-700">Mailing & Delivery Pricing</h3>
          <p className="text-gray-600 mb-4 text-center">Compare Lob and Canva rates. Transparent, up-to-date pricing for all delivery options.</p>
          <div className="w-full flex flex-col gap-2 mb-2">
            <div className="bg-blue-50 text-blue-700 rounded px-3 py-2 font-medium">Lob: Letters $0.99+, Postcards $0.70+</div>
            <div className="bg-pink-50 text-pink-600 rounded px-3 py-2 font-medium">Canva: Free & Pro Options</div>
          </div>
          <Link to="/pricing" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">View Full Pricing</Link>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-12">
        {/* Payment Options */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border border-gray-200 hover:shadow-xl transition w-full md:w-1/2">
          <span className="text-4xl mb-4">💳</span>
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Payment Options</h3>
          <p className="text-gray-600 mb-4 text-center">Pay for your mailings with Stripe or PayPal. Secure, fast, and easy.</p>
          <div className="flex gap-4">
            <Link to="/pay/stripe" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"><span>💳</span> Pay with Stripe</Link>
            <Link to="/pay/paypal" className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition flex items-center gap-2"><span>🅿️</span> Pay with PayPal</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingDashboard;
