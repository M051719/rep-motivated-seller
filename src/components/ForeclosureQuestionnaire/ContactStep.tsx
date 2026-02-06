import React, { useState } from "react";

const ContactStep: React.FC = () => {
  const [smsConsent, setSmsConsent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  return (
    <div className="contact-step">
      <h3>Contact Information</h3>

      <div className="phone-field">
        <label htmlFor="phone">Phone Number *</label>
        <input
          type="tel"
          id="phone"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
      </div>

      <div className="sms-consent">
        <label className="checkbox-container">
          <input
            type="checkbox"
            checked={smsConsent}
            onChange={(e) => setSmsConsent(e.target.checked)}
            required
          />
          <span className="checkmark"></span>
          <span className="consent-text">
            I consent to receive SMS text messages from RepMotivatedSeller regarding my
            foreclosure assistance inquiry. Message and data rates may apply. I can opt
            out at any time by replying STOP.
          </span>
        </label>
      </div>

      <div className="sms-disclaimer">
        <p className="text-sm text-gray-600">
          By providing your phone number and checking the box above, you agree to receive
          text messages from RepMotivatedSeller. You may receive up to 3 messages per
          week. Reply STOP to opt out or HELP for assistance.
        </p>
      </div>
    </div>
  );
};

export default ContactStep;
