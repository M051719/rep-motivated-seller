```typescript
// src/components/compliance/SMSOptInComponent.tsx
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface SMSOptInProps {
  onOptInComplete?: (success: boolean, phoneNumber?: string) => void;
  className?: string;
}

const SMSOptInComponent: React.FC<SMSOptInProps> = ({ onOptInComplete, className }) => {
  const [step, setStep] = useState(1); // 1: Initial, 2: Verification, 3: Complete
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleInitialOptIn = async () => {
    if (!phoneNumber || !agreedToTerms) {
      setError('Please enter your phone number and agree to the terms');
      return;
    }

    // Validate phone number format
    const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Send verification code via Twilio
      const response = await fetch('/api/sms/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: `+1${cleanPhone}`,
          message: `RepMotivatedSeller verification code: ${Math.floor(100000 + Math.random() * 900000)}. Reply STOP to opt out.`
        })
      });

      if (response.ok) {
        setStep(2);
      } else {
        throw new Error('Failed to send verification code');
      }
    } catch (error) {
      console.error('Opt-in error:', error);
      setError('Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Verify code and complete opt-in
      const response = await fetch('/api/sms/verify-opt-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: `+1${phoneNumber.replace(/[^\d]/g, '')}`,
          verificationCode,
          consentTimestamp: new Date().toISOString(),
          ipAddress: await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d => d.ip)
        })
      });

      if (response.ok) {
        // Save opt-in record to database
        const { data: { user } } = await supabase.auth.getUser();
        
        await supabase.from('sms_opt_ins').insert({
          user_id: user?.id || null,
          phone_number: `+1${phoneNumber.replace(/[^\d]/g, '')}`,
          opted_in_at: new Date().toISOString(),
          consent_method: 'double_opt_in',
          ip_address: await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d => d.ip),
          user_agent: navigator.userAgent,
          consent_text: 'I agree to receive text messages from RepMotivatedSeller about foreclosure assistance and educational resources.',
          verified: true
        });

        setStep(3);
        onOptInComplete?.(true, phoneNumber);
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onOptInComplete?.(false);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Step 1: Initial Opt-In */}
      {step === 1 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              📱 SMS Notifications (Optional)
            </h3>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              OPTIONAL
            </span>
          </div>

          <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500">
            <h4 className="font-medium text-blue-900 mb-2">🛡️ Why SMS Notifications?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Get urgent foreclosure deadline reminders</li>
              <li>• Receive time-sensitive assistance updates</li>
              <li>• Access to emergency support hotline</li>
              <li>• Educational tips and resources</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="(555) 123-4567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                maxLength={14}
              />
            </div>

            {/* TCPA Compliance Disclosure */}
            <div className="p-4 bg-gray-50 border rounded-lg">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="sms-consent"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="sms-consent" className="ml-3 text-sm text-gray-700">
                  <div className="space-y-2">
                    <p className="font-medium">
                      ✅ I consent to receive text messages from RepMotivatedSeller
                    </p>
                    
                    <div className="text-xs space-y-1">
                      <p>• <strong>Frequency:</strong> Up to 4 messages per month</p>
                      <p>• <strong>Message Types:</strong> Foreclosure alerts, educational content, appointment reminders</p>
                      <p>• <strong>Opt-Out:</strong> Reply STOP at any time</p>
                      <p>• <strong>Help:</strong> Reply HELP for assistance</p>
                      <p>• <strong>Rates:</strong> Message and data rates may apply</p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setShowDetails(!showDetails)}
                      className="text-blue-600 hover:text-blue-700 text-xs underline"
                    >
                      {showDetails ? 'Hide' : 'View'} Full Terms & Privacy Policy
                    </button>
                  </div>
                </label>
              </div>
            </div>

            {/* Detailed Terms (Collapsible) */}
            {showDetails && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-gray-600 space-y-2">
                <h5 className="font-medium text-gray-900">📋 Complete SMS Terms:</h5>
                <p>
                  <strong>Consent:</strong> By checking this box and providing your mobile number, you expressly consent 
                  to receive automated marketing text messages from RepMotivatedSeller at the number provided. 
                  Consent is not required to purchase or use our services.
                </p>
                <p>
                  <strong>Message Frequency:</strong> You may receive up to 4 messages per month. Message frequency varies 
                  based on your interaction and account activity.
                </p>
                <p>
                  <strong>Message Content:</strong> Messages may include foreclosure prevention tips, deadline reminders, 
                  educational resources, appointment confirmations, and service updates.
                </p>
                <p>
                  <strong>Opt-Out:</strong> You may opt-out at any time by replying STOP to any message. You will receive 
                  a confirmation message. No further messages will be sent after opt-out.
                </p>
                <p>
                  <strong>Support:</strong> For help, reply HELP or contact us at (555) 123-4567.
                </p>
                <p>
                  <strong>Carriers:</strong> Supported carriers include Verizon, AT&T, T-Mobile, Sprint, and others. 
                  Message and data rates may apply based on your cellular plan.
                </p>
                <p>
                  <strong>Privacy:</strong> We respect your privacy. View our full Privacy Policy at 
                  repmotivatedseller.org/privacy for information about data collection and use.
                </p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={handleInitialOptIn}
                disabled={loading || !phoneNumber || !agreedToTerms}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending Code...
                  </>
                ) : (
                  '📱 Send Verification Code'
                )}
              </button>
              
              <button
                onClick={handleSkip}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Skip for Now
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              SMS notifications are completely optional. You can still use all our services without providing a phone number.
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Verification */}
      {step === 2 && (
        <div>
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">📲</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Verification Code Sent
            </h3>
            <p className="text-gray-600">
              We sent a 6-digit code to <strong>{phoneNumber}</strong>
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
                placeholder="123456"
                className="w-full px-3 py-2 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                maxLength={6}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={handleVerification}
                disabled={loading || verificationCode.length !== 6}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  '✅ Verify & Complete'
                )}
              </button>
              
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={handleInitialOptIn}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Didn't receive code? Resend
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            SMS Notifications Enabled!
          </h3>
          <p className="text-green-700 mb-4">
            You'll now receive helpful foreclosure prevention updates and reminders.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
            <h4 className="font-medium text-green-900 mb-2">📋 What's Next?</h4>
            <ul className="text-green-700 space-y-1 text-left">
              <li>• You may receive up to 4 messages per month</li>
              <li>• Reply STOP anytime to unsubscribe</li>
              <li>• Reply HELP for customer support</li>
              <li>• Check your first welcome message!</li>
            </ul>
          </div>

          <button
            onClick={() => onOptInComplete?.(true, phoneNumber)}
            className="mt-4 bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default SMSOptInComponent;
```