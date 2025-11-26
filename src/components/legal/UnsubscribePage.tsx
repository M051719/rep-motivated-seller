```typescript
// src/components/legal/UnsubscribePage.tsx
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

const UnsubscribePage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState({
    name: '',
    address_line1: '',
    address_city: '',
    address_state: '',
    address_zip: ''
  });
  const [phone, setPhone] = useState('');
  const [unsubscribeTypes, setUnsubscribeTypes] = useState({
    email: false,
    sms: false,
    directMail: false,
    all: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Save unsubscribe request to database
      const { error } = await supabase
        .from('unsubscribe_requests')
        .insert({
          email: email || null,
          phone: phone || null,
          address: address.address_line1 ? address : null,
          types: unsubscribeTypes,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      setSuccess(true);
    } catch (error) {
      console.error('Unsubscribe error:', error);
      alert('Error processing request. Please call us at (555) 123-4567');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-800 mb-4">Unsubscribe Request Received</h1>
          <p className="text-green-700 mb-6">
            We will process your request within 10 business days. You may still receive communications 
            that were already in process.
          </p>
          <div className="text-sm text-green-600">
            <p>Questions? Call us at (555) 123-4567</p>
            <p>Email: optout@repmotivatedseller.org</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">🚫 Unsubscribe</h1>
        
        <p className="text-gray-700 mb-6">
          We respect your communication preferences. Use this form to opt out of our marketing communications.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Unsubscribe Types */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-3">What would you like to unsubscribe from?</h2>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={unsubscribeTypes.all}
                  onChange={(e) => setUnsubscribeTypes({
                    email: e.target.checked,
                    sms: e.target.checked,
                    directMail: e.target.checked,
                    all: e.target.checked
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">All communications (recommended)</span>
              </label>
              
              <label className="flex items-center ml-6">
                <input
                  type="checkbox"
                  checked={unsubscribeTypes.email}
                  onChange={(e) => setUnsubscribeTypes(prev => ({
                    ...prev,
                    email: e.target.checked,
                    all: false
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">📧 Email communications</span>
              </label>
              
              <label className="flex items-center ml-6">
                <input
                  type="checkbox"
                  checked={unsubscribeTypes.sms}
                  onChange={(e) => setUnsubscribeTypes(prev => ({
                    ...prev,
                    sms: e.target.checked,
                    all: false
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">📱 Text messages (SMS)</span>
              </label>
              
              <label className="flex items-center ml-6">
                <input
                  type="checkbox"
                  checked={unsubscribeTypes.directMail}
                  onChange={(e) => setUnsubscribeTypes(prev => ({
                    ...prev,
                    directMail: e.target.checked,
                    all: false
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">📬 Direct mail (postcards, letters)</span>
              </label>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-3">Your Contact Information</h2>
            <p className="text-sm text-gray-600 mb-4">
              Provide the information we have on file to ensure we can process your request.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Mailing Address (for direct mail opt-out) */}
          {(unsubscribeTypes.directMail || unsubscribeTypes.all) && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-3">📬 Mailing Address</h2>
              <p className="text-sm text-gray-600 mb-4">
                Required to stop direct mail communications.
              </p>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={address.name}
                  onChange={(e) => setAddress(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Full Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                
                <input
                  type="text"
                  value={address.address_line1}
                  onChange={(e) => setAddress(prev => ({ ...prev, address_line1: e.target.value }))}
                  placeholder="Street Address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={address.address_city}
                    onChange={(e) => setAddress(prev => ({ ...prev, address_city: e.target.value }))}
                    placeholder="City"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  
                  <input
                    type="text"
                    value={address.address_state}
                    onChange={(e) => setAddress(prev => ({ ...prev, address_state: e.target.value }))}
                    placeholder="State"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  
                  <input
                    type="text"
                    value={address.address_zip}
                    onChange={(e) => setAddress(prev => ({ ...prev, address_zip: e.target.value }))}
                    placeholder="ZIP"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {submitting ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                '🚫 Submit Unsubscribe Request'
              )}
            </button>
            
            <p className="text-xs text-gray-500 mt-2 text-center">
              We will process your request within 10 business days
            </p>
          </div>
        </form>

        {/* Alternative Contact */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="font-medium text-gray-900 mb-2">Prefer to call or email?</h3>
          <div className="text-sm text-gray-600">
            <p>📞 Phone: (555) 123-4567</p>
            <p>📧 Email: optout@repmotivatedseller.org</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnsubscribePage;
```