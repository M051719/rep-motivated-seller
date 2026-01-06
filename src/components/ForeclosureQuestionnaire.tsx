import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { createClient } from "@supabase/supabase-js";
import SMSConsentCheckbox from "./SMSConsentCheckbox";
import BackButton from "./ui/BackButton";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type FormData = {
  // Contact Information
  name: string;
  email: string;
  phone: string;

  // Situation Assessment
  property_address: string;
  property_value: number;
  mortgage_balance: number;
  missed_payments: number;
  received_nod: boolean;

  // Problem Identification
  challenges: string;
  difficulties: string;

  // Impact Analysis
  family_impact: string;
  financial_impact: string;

  // Solution Planning
  preferred_solution: string;
  openness_to_options: string;
};

const ForeclosureQuestionnaire = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>();

  // Watch phone number for SMS consent component
  const phoneNumber = useWatch({
    control,
    name: "phone",
    defaultValue: "",
  });

  const totalSteps = 5;

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Insert foreclosure response data
      const { data: responseData, error: responseError } = await supabase
        .from("foreclosure_responses")
        .insert([data])
        .select()
        .single();

      if (responseError) throw responseError;

      // If user consented to SMS, record their consent
      if (smsConsent && data.phone) {
        const { error: consentError } = await supabase.rpc(
          "record_sms_opt_in",
          {
            p_phone_number: data.phone,
            p_method: "web_form",
            p_ip_address: null, // Client IP not available in browser
            p_user_agent: navigator.userAgent,
          },
        );

        if (consentError) {
          console.error("Error recording SMS consent:", consentError);
          // Don't fail the entire submission if consent recording fails
        }
      }

      setSubmitSuccess(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError(
        "There was an error submitting your information. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Thank You!</h2>
        <p className="mb-4">
          Your information has been submitted successfully. One of our
          foreclosure specialists will contact you shortly.
        </p>
        <p>
          If you have any urgent questions, please call us at{" "}
          <a href="tel:555-123-4567" className="text-blue-600 font-bold">
            555-123-4567
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <div className="mb-4">
        <BackButton label="← Back to Home" fallbackPath="/" />
      </div>
      <h1 className="text-2xl font-bold mb-6">
        Foreclosure Assistance Questionnaire
      </h1>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>
        <div className="text-right text-sm text-gray-500 mt-1">
          Step {step} of {totalSteps}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Contact Information */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                {...register("name", { required: "Name is required" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                {...register("phone", { required: "Phone number is required" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* SMS Consent - Optional */}
            {phoneNumber && (
              <SMSConsentCheckbox
                phoneNumber={phoneNumber}
                onConsentChange={setSmsConsent}
                defaultChecked={false}
              />
            )}

            <div className="pt-4">
              <button
                type="button"
                onClick={nextStep}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Situation Assessment */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Situation Assessment</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Address
              </label>
              <input
                type="text"
                {...register("property_address")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Property Value ($)
              </label>
              <input
                type="number"
                {...register("property_value", { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mortgage Balance ($)
              </label>
              <input
                type="number"
                {...register("mortgage_balance", { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Missed Payments
              </label>
              <input
                type="number"
                {...register("missed_payments", { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Have you received a Notice of Default (NOD)?
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* Yes Option */}
                <button
                  type="button"
                  onClick={() => setValue("received_nod", true)}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    watch("received_nod") === true
                      ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                      : "border-gray-300 bg-white text-gray-700 hover:border-blue-400"
                  }`}
                >
                  <div className="text-lg mb-1">✓</div>
                  <div>Yes</div>
                </button>

                {/* No Option */}
                <button
                  type="button"
                  onClick={() => setValue("received_nod", false)}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    watch("received_nod") === false
                      ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                      : "border-gray-300 bg-white text-gray-700 hover:border-blue-400"
                  }`}
                >
                  <div className="text-lg mb-1">✗</div>
                  <div>No</div>
                </button>
              </div>
            </div>{" "}
            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Problem Identification */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">
              Problem Identification
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What challenges are you facing with your mortgage?
              </label>
              <textarea
                {...register("challenges")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What difficulties have you encountered when trying to resolve
                this situation?
              </label>
              <textarea
                {...register("difficulties")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Impact Analysis */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Impact Analysis</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How is this situation affecting you and your family?
              </label>
              <textarea
                {...register("family_impact")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What financial impact has this had on your situation?
              </label>
              <textarea
                {...register("financial_impact")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Solution Planning */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Solution Planning</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What solution would you prefer for your situation?
              </label>
              <select
                {...register("preferred_solution")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an option</option>
                <option value="loan_modification">Loan Modification</option>
                <option value="refinance">Refinance</option>
                <option value="sell_property">Sell the Property</option>
                <option value="short_sale">Short Sale</option>
                <option value="deed_in_lieu">
                  Deed in Lieu of Foreclosure
                </option>
                <option value="bankruptcy">Bankruptcy</option>
                <option value="not_sure">Not Sure / Need Advice</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How open are you to exploring different options?
              </label>
              <textarea
                {...register("openness_to_options")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {submitError}
              </div>
            )}

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Previous
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ForeclosureQuestionnaire;
