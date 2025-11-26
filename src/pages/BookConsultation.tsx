import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import CalendlyWidget from '../components/booking/CalendlyWidget'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { BackButton } from '../components/ui/BackButton'

const BookConsultation: React.FC = () => {
  const [user, setUser] = useState<any>(null)
  const [selectedService, setSelectedService] = useState<string>('foreclosure-consultation')

  useEffect(() => {
    // Get current user for prefill
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  const consultationTypes = [
    {
      id: 'foreclosure-consultation',
      title: '🆘 Foreclosure Prevention Consultation',
      description: 'Get immediate help to stop foreclosure proceedings',
      duration: '60 minutes',
      price: 'FREE',
      calendlyUrl: 'your-username/foreclosure-consultation',
      features: [
        'Review your current situation',
        'Explore all available options',
        'Create an action plan',
        'Connect with professionals',
        'Follow-up support'
      ]
    },
    {
      id: 'investment-consultation',
      title: '💰 Real Estate Investment Consultation',
      description: 'Learn about real estate investment opportunities',
      duration: '45 minutes',
      price: '$97',
      calendlyUrl: 'your-username/investment-consultation',
      features: [
        'Portfolio assessment',
        'Investment strategy planning',
        'Market analysis',
        'Risk evaluation',
        'Action steps'
      ]
    },
    {
      id: 'credit-repair-consultation',
      title: '📊 Credit Repair Strategy Session',
      description: 'Personalized credit improvement plan',
      duration: '30 minutes',
      price: '$47',
      calendlyUrl: 'your-username/credit-repair-consultation',
      features: [
        'Credit report review',
        'Dispute strategy',
        'Score improvement plan',
        'Timeline expectations',
        'Resources and tools'
      ]
    }
  ]

  const selectedConsultation = consultationTypes.find(c => c.id === selectedService)

  const handleEventScheduled = (event: any) => {
    toast.success('🎉 Consultation scheduled successfully!')
    
    // Track the booking
    if (user) {
      supabase.from('consultation_bookings').insert({
        user_id: user.id,
        consultation_type: selectedService,
        calendly_event_uri: event.uri,
        scheduled_at: event.start_time,
        invitee_email: event.invitee.email
      })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <BackButton />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          📅 Book Your Free Consultation
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Get personalized help from our experts. Choose the consultation that best fits your needs.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Service Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Choose Your Consultation
            </h2>
            
            <div className="space-y-4">
              {consultationTypes.map((consultation) => (
                <motion.div
                  key={consultation.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedService === consultation.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedService(consultation.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {consultation.title}
                    </h3>
                    <span className={`text-sm font-bold ${
                      consultation.price === 'FREE' ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {consultation.price}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-xs mb-3">
                    {consultation.description}
                  </p>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>⏱️ {consultation.duration}</span>
                    <span className={`px-2 py-1 rounded ${
                      selectedService === consultation.id 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100'
                    }`}>
                      Select
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Selected Service Details */}
            {selectedConsultation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 p-4 bg-gray-50 rounded-lg"
              >
                <h3 className="font-semibold text-gray-900 mb-3">
                  What's Included:
                </h3>
                <ul className="space-y-2">
                  {selectedConsultation.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>
        </div>

        {/* Calendly Widget */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {selectedConsultation && (
              <CalendlyWidget
                url={`https://calendly.com/${selectedConsultation.calendlyUrl}`}
                prefill={{
                  name: user?.user_metadata?.full_name || '',
                  email: user?.email || ''
                }}
                utm={{
                  source: 'repmotivatedseller',
                  medium: 'website',
                  campaign: 'consultation-booking'
                }}
                height={700}
                onEventScheduled={handleEventScheduled}
                onDateAndTimeSelected={(event) => {
                  console.log('Date and time selected:', event)
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-16 bg-blue-50 rounded-lg p-8"
      >
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              📞 What to Expect
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li>• Personalized consultation with our experts</li>
              <li>• Review of your specific situation</li>
              <li>• Actionable recommendations</li>
              <li>• Follow-up resources and support</li>
              <li>• No high-pressure sales tactics</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              🛡️ Privacy & Security
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li>• All consultations are completely confidential</li>
              <li>• Secure video conferencing platform</li>
              <li>• Your information is never shared</li>
              <li>• GDPR and privacy law compliant</li>
              <li>• Cancel or reschedule anytime</li>
            </ul>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-blue-700 mb-4">
            Need immediate assistance? Call us directly:
          </p>
          <a
            href="tel:+18778064677"
            className="text-2xl font-bold text-blue-600 hover:text-blue-700"
          >
            📞 (877) 806-4677
          </a>
        </div>
      </motion.div>
    </div>
  )
}

export default BookConsultation