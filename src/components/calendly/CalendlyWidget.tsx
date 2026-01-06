/**
 * Calendly Widget Component
 * Embeds Calendly scheduling widget for consultation bookings
 */

import React, { useEffect } from 'react';
import { InlineWidget, PopupWidget, useCalendlyEventListener } from 'react-calendly';
import { Calendar, Clock, Video, Check } from 'lucide-react';

interface CalendlyWidgetProps {
  type?: 'inline' | 'popup';
  buttonText?: string;
  buttonClassName?: string;
}

const CalendlyWidget: React.FC<CalendlyWidgetProps> = ({ 
  type = 'inline',
  buttonText = 'Schedule Consultation',
  buttonClassName = ''
}) => {
  // Build Calendly URL from environment variables
  const calendlyEventUrl = import.meta.env.VITE_CALENDLY_FORECLOSURE_URL || 'melvin-sofiesentrepreneurialgroup/foreclosure-prevention-consultation';
  
  const calendlyUrl = `https://calendly.com/${calendlyEventUrl}`;

  // Event listeners for analytics
  useCalendlyEventListener({
    onEventScheduled: (e) => {
      console.log('Consultation scheduled:', e.data.payload);
      // Track event for analytics
      if (window.gtag) {
        window.gtag('event', 'consultation_scheduled', {
          event_category: 'engagement',
          event_label: 'calendly_booking'
        });
      }
    },
  });

  // Load Calendly CSS
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://assets.calendly.com/assets/external/widget.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  if (type === 'popup') {
    return (
      <PopupWidget
        url={calendlyUrl}
        rootElement={document.getElementById('root') as HTMLElement}
        text={buttonText}
        textColor="#ffffff"
        color="#2563eb"
        className={buttonClassName || 'calendly-popup-button'}
      />
    );
  }

  return (
    <div className="calendly-widget-container">
      <InlineWidget
        url={calendlyUrl}
        styles={{
          height: '700px',
          minWidth: '320px',
        }}
        pageSettings={{
          backgroundColor: 'ffffff',
          hideEventTypeDetails: false,
          hideLandingPageDetails: false,
          primaryColor: '2563eb',
          textColor: '1f2937',
        }}
      />
    </div>
  );
};

export default CalendlyWidget;

/**
 * Calendly Features Display Component
 * Shows benefits and features of consultation booking
 */
export const CalendlyFeatures: React.FC = () => {
  const features = [
    {
      icon: <Calendar className="h-6 w-6 text-blue-600" />,
      title: 'Easy Scheduling',
      description: 'Pick a time that works best for you from our available slots'
    },
    {
      icon: <Clock className="h-6 w-6 text-blue-600" />,
      title: 'Flexible Duration',
      description: '15-minute quick consultations or 60-minute deep-dive sessions'
    },
    {
      icon: <Video className="h-6 w-6 text-blue-600" />,
      title: 'Virtual Meetings',
      description: 'Zoom video calls - no travel required, meet from anywhere'
    },
    {
      icon: <Check className="h-6 w-6 text-blue-600" />,
      title: 'Instant Confirmation',
      description: 'Receive email confirmation and calendar invite immediately'
    }
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {features.map((feature, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
            {feature.icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {feature.title}
          </h3>
          <p className="text-gray-600 text-sm">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
};

/**
 * Consultation Types Component
 * Displays available consultation packages
 */
export const ConsultationTypes: React.FC = () => {
  const consultations = [
    {
      name: 'Quick Assessment',
      duration: '15 minutes',
      price: 'FREE',
      features: [
        'Initial situation review',
        'Foreclosure timeline assessment',
        'Quick action recommendations',
        'Resource overview'
      ],
      popular: false
    },
    {
      name: 'Strategy Session',
      duration: '30 minutes',
      price: '$49',
      features: [
        'Detailed foreclosure analysis',
        'Personalized action plan',
        'Credit repair strategies',
        'Loss mitigation options',
        'Document review'
      ],
      popular: true
    },
    {
      name: 'Comprehensive Review',
      duration: '60 minutes',
      price: '$99',
      features: [
        'Complete financial assessment',
        'Custom recovery roadmap',
        'Lender negotiation prep',
        'Legal option analysis',
        'Document preparation',
        '30-day follow-up included'
      ],
      popular: false
    }
  ];

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
        Choose Your Consultation
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {consultations.map((consultation, index) => (
          <div 
            key={index}
            className={`relative bg-white rounded-lg shadow-lg p-8 ${
              consultation.popular ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            {consultation.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {consultation.name}
              </h3>
              <div className="text-4xl font-extrabold text-blue-600 mb-2">
                {consultation.price}
              </div>
              <p className="text-gray-600">{consultation.duration}</p>
            </div>

            <ul className="space-y-3 mb-8">
              {consultation.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="text-center text-sm text-gray-500 mt-4">
              Select this option when booking below
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

