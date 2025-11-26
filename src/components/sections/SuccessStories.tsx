import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function SuccessStories() {
  const stories = [
    {
      id: 1,
      name: 'John D.',
      location: 'Phoenix, AZ',
      situation: 'Facing Foreclosure - 3 months behind',
      outcome: 'Saved home with loan modification',
      savings: '$45,000',
      image: '/images/success-home-1.jpg',
      quote: 'RepMotivatedSeller helped me navigate foreclosure and save my home. The support was invaluable!',
      details: 'After losing my job, I fell 3 months behind on payments. The team helped me negotiate a loan modification and get back on track.'
    },
    {
      id: 2,
      name: 'Sarah M.',
      location: 'Dallas, TX',
      situation: 'Underwater mortgage',
      outcome: 'Short sale approved, debt forgiven',
      savings: '$78,000',
      image: '/images/success-home-2.jpg',
      quote: 'The platform made a difficult situation manageable. I\'m grateful for the guidance!',
      details: 'I was underwater on my mortgage after divorce. They helped me complete a short sale and move forward debt-free.'
    },
    {
      id: 3,
      name: 'Michael & Lisa T.',
      location: 'Orlando, FL',
      situation: 'Property tax debt',
      outcome: 'Payment plan established',
      savings: '$23,000',
      image: '/images/success-home-3.jpg',
      quote: 'We thought we\'d lose everything. Now we have a manageable payment plan and peace of mind.',
      details: 'Years of back property taxes threatened our home. The education platform taught us our options and helped us negotiate with the county.'
    },
    {
      id: 4,
      name: 'Robert K.',
      location: 'Atlanta, GA',
      situation: 'Medical emergency expenses',
      outcome: 'Refinanced and consolidated debt',
      savings: '$32,000',
      image: '/images/success-home-4.jpg',
      quote: 'After a medical emergency, I didn\'t know where to turn. This platform saved my family\'s home.',
      details: 'Medical bills pushed me to the brink. With their help, I refinanced, consolidated debt, and now make one affordable payment.'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            🏆 Real Families, Real Results
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how we've helped families across America save their homes and regain financial stability
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {stories.map((story, index) => (
            <motion.div
              key={story.id}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* Image placeholder - replace with actual property images */}
              <div className="relative h-48 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                <div className="text-center text-white p-4">
                  <div className="text-5xl mb-2">🏠</div>
                  <p className="font-semibold text-lg">{story.location}</p>
                </div>
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  ✓ Success
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{story.name}</h3>
                    <p className="text-sm text-gray-600">{story.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{story.savings}</p>
                    <p className="text-xs text-gray-600">Saved</p>
                  </div>
                </div>

                <div className="mb-4 space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="text-red-500 mr-2">📉</span>
                    <span className="text-gray-700"><strong>Situation:</strong> {story.situation}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">📈</span>
                    <span className="text-gray-700"><strong>Outcome:</strong> {story.outcome}</span>
                  </div>
                </div>

                <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 italic text-gray-700">
                  "{story.quote}"
                </blockquote>

                <p className="text-sm text-gray-600 mb-4">
                  {story.details}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA to view more */}
        <div className="text-center">
          <Link
            to="/success-stories"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            View All Success Stories →
          </Link>
        </div>
      </div>
    </section>
  );
}