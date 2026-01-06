import { useState } from "react";

interface SMSConsentCheckboxProps {
  phoneNumber: string;
  onConsentChange: (consented: boolean) => void;
  defaultChecked?: boolean;
}

export default function SMSConsentCheckbox({
  phoneNumber,
  onConsentChange,
  defaultChecked = false,
}: SMSConsentCheckboxProps) {
  const [consented, setConsented] = useState(defaultChecked);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setConsented(checked);
    onConsentChange(checked);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
      <div className="flex items-start">
        <input
          type="checkbox"
          id="sms_consent"
          checked={consented}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
        />
        <div className="ml-3 flex-1">
          <label htmlFor="sms_consent" className="block">
            <span className="font-medium text-gray-900">
              Optional: Receive SMS updates about your case
            </span>
            <span className="text-sm text-gray-600 block mt-1">
              By checking this box, you consent to receive SMS messages from
              RepMotivatedSeller at the phone number you provided (
              {phoneNumber || "your phone number"}) regarding:
            </span>
          </label>

          <ul className="mt-2 text-sm text-gray-600 space-y-1 ml-4 list-disc">
            <li>Case status updates and progress notifications</li>
            <li>Appointment reminders and confirmations</li>
            <li>Important foreclosure assistance information</li>
            <li>Occasional tips and resources (2-4 messages per month)</li>
          </ul>

          <div className="mt-3 text-xs text-gray-500 space-y-1">
            <p>
              <strong>Message frequency:</strong> Approximately 2-4 messages per
              month. Message and data rates may apply.
            </p>
            <p>
              <strong>Opt-out anytime:</strong> Reply <strong>STOP</strong> to
              any message to unsubscribe. Reply <strong>HELP</strong> for
              assistance.
            </p>
            <p>
              <strong>Not required:</strong> This is optional. You can still
              receive our full services without SMS notifications.
            </p>
            <p className="mt-2">
              For more information, see our{" "}
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="/terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Terms of Service
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
