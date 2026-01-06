import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { BackButton } from "../components/ui/BackButton";

interface SuccessStory {
  id: number;
  name: string;
  location: string;
  situation: string;
  outcome: string;
  savings: string;
  image: string;
  quote: string;
  details: string;
  timeline: string;
  beforeImage: string;
  afterImage: string;
  category: "foreclosure" | "short-sale" | "loan-modification" | "refinance";
}

const SuccessStoriesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStory, setSelectedStory] = useState<SuccessStory | null>(null);

  const stories: SuccessStory[] = [
    {
      id: 1,
      name: "John D.",
      location: "Phoenix, AZ",
      situation: "Facing Foreclosure - 3 months behind on mortgage payments",
      outcome: "Saved home with loan modification",
      savings: "$45,000",
      image: "/images/success-home-1.jpg",
      beforeImage: "/images/before-1.jpg",
      afterImage: "/images/after-1.jpg",
      quote:
        "RepMotivatedSeller helped me navigate foreclosure and save my home. The support was invaluable!",
      details:
        "After losing my job during the pandemic, I fell 3 months behind on payments. I didn't know where to turn and was terrified of losing the home where my kids grew up. The RepMotivatedSeller team helped me understand my options, negotiate with my lender, and ultimately secure a loan modification that reduced my monthly payment by $800. I'm now back on track and my family can stay in our home.",
      timeline: "45 days from first contact to approval",
      category: "loan-modification",
    },
    {
      id: 2,
      name: "Sarah M.",
      location: "Dallas, TX",
      situation: "Underwater mortgage after property value decline",
      outcome: "Short sale approved, $78K debt forgiven",
      savings: "$78,000",
      image: "/images/success-home-2.jpg",
      beforeImage: "/images/before-2.jpg",
      afterImage: "/images/after-2.jpg",
      quote:
        "The platform made a difficult situation manageable. I'm grateful for the guidance and am now debt-free!",
      details:
        "Following my divorce, I was left with a home worth $50,000 less than what I owed. I couldn't afford the payments alone and was drowning in debt. Through RepMotivatedSeller's education platform, I learned about short sales. They guided me through every step of the process, negotiated with my lender, and helped me complete a short sale. The bank forgave the remaining debt, and I was able to move forward with a fresh start.",
      timeline: "90 days from listing to closing",
      category: "short-sale",
    },
    {
      id: 3,
      name: "Michael & Lisa T.",
      location: "Orlando, FL",
      situation: "Property tax debt accumulation - $23K owed",
      outcome: "Payment plan established, foreclosure avoided",
      savings: "$23,000",
      image: "/images/success-home-3.jpg",
      beforeImage: "/images/before-3.jpg",
      afterImage: "/images/after-3.jpg",
      quote:
        "We thought we'd lose everything. Now we have a manageable payment plan and peace of mind.",
      details:
        "Years of back property taxes had accumulated to over $23,000, and the county was threatening foreclosure. We were overwhelmed and didn't know our rights. The education platform taught us about tax payment plans and our options. With their guidance, we negotiated with the county tax collector and established a 5-year payment plan at $400/month. Our home is safe, and we're making steady progress paying down the debt.",
      timeline: "30 days to negotiate payment plan",
      category: "foreclosure",
    },
    {
      id: 4,
      name: "Robert K.",
      location: "Atlanta, GA",
      situation: "Medical emergency led to $150K in bills",
      outcome: "Refinanced and consolidated debt",
      savings: "$32,000",
      image: "/images/success-home-4.jpg",
      beforeImage: "/images/before-4.jpg",
      afterImage: "/images/after-4.jpg",
      quote:
        "After a medical emergency, I didn't know where to turn. This platform saved my family's home.",
      details:
        "When my wife had a serious health emergency, the medical bills quickly piled up to $150,000 even with insurance. We were using credit cards to pay the mortgage and spiraling into debt. RepMotivatedSeller helped us explore refinancing options. We were able to refinance our home, pull out equity, consolidate all our high-interest debt, and now make one affordable payment. Our monthly obligations dropped by $1,200.",
      timeline: "60 days from application to closing",
      category: "refinance",
    },
    {
      id: 5,
      name: "Jennifer L.",
      location: "Miami, FL",
      situation: "Job loss and 6 months behind on payments",
      outcome: "Forbearance plan approved, payments resumed",
      savings: "$52,000",
      image: "/images/success-home-5.jpg",
      beforeImage: "/images/before-5.jpg",
      afterImage: "/images/after-5.jpg",
      quote:
        "I was days away from auction. The 24/7 AI assistant answered my questions at 2am when I couldn't sleep.",
      details:
        "After being laid off, I fell 6 months behind on my mortgage. The foreclosure notice arrived and the auction was scheduled in 30 days. I was panicking. The RepMotivatedSeller AI assistant helped me understand my options immediately, even at 2am when I couldn't sleep. They connected me with resources, and I was able to secure a forbearance plan that gave me time to find new employment. I'm now current on payments and rebuilding my savings.",
      timeline: "28 days from foreclosure notice to approval",
      category: "foreclosure",
    },
    {
      id: 6,
      name: "Carlos & Maria R.",
      location: "San Antonio, TX",
      situation: "ARM adjustment increased payment by $1,100/month",
      outcome: "Refinanced to fixed-rate mortgage",
      savings: "$67,000",
      image: "/images/success-home-6.jpg",
      beforeImage: "/images/before-6.jpg",
      afterImage: "/images/after-6.jpg",
      quote:
        "When our adjustable-rate mortgage reset, we panicked. Now we have a fixed rate and lower payment!",
      details:
        "Our ARM reset and our payment jumped from $1,800 to $2,900 per month - completely unaffordable. We were terrified of foreclosure. RepMotivatedSeller educated us about refinancing options and connected us with lenders who could help. We refinanced into a 30-year fixed-rate mortgage at a lower rate, and our payment is now $1,650. We save $1,250/month and have peace of mind with a fixed rate.",
      timeline: "45 days from consultation to closing",
      category: "refinance",
    },
    {
      id: 7,
      name: "David H.",
      location: "Las Vegas, NV",
      situation: "Business failure led to income loss",
      outcome: "Deed-in-lieu negotiated, avoided deficiency judgment",
      savings: "$95,000",
      image: "/images/success-home-7.jpg",
      beforeImage: "/images/before-7.jpg",
      afterImage: "/images/after-7.jpg",
      quote:
        "My business failed and I had no income. They helped me walk away with dignity and no remaining debt.",
      details:
        "When my restaurant failed during COVID, I lost everything. I couldn't afford my mortgage and owed $95,000 more than the home was worth. RepMotivatedSeller helped me understand the deed-in-lieu option. They negotiated with my lender to accept the property back in exchange for full debt forgiveness. No foreclosure on my record, no deficiency judgment, and I could start rebuilding my life.",
      timeline: "75 days from initial contact to deed transfer",
      category: "short-sale",
    },
    {
      id: 8,
      name: "Amanda S.",
      location: "Charlotte, NC",
      situation: "Divorce and custody battle depleted savings",
      outcome: "HAMP modification approved",
      savings: "$38,000",
      image: "/images/success-home-8.jpg",
      beforeImage: "/images/before-8.jpg",
      afterImage: "/images/after-8.jpg",
      quote:
        "The divorce took everything. This program helped me keep a home for my children.",
      details:
        "Legal fees from my custody battle drained my savings, and I fell behind on my mortgage. As a single mom, I was terrified my kids would lose their home. RepMotivatedSeller's education platform taught me about HAMP (Home Affordable Modification Program). They helped me through the application process, and I was approved for a modification that reduced my payment by $650/month and capitalized the arrears. My kids stayed in their school district and we're thriving.",
      timeline: "90 days from application to approval",
      category: "loan-modification",
    },
  ];

  const categories = [
    { value: "all", label: "All Stories", icon: "📚" },
    { value: "foreclosure", label: "Foreclosure Prevention", icon: "🏠" },
    { value: "loan-modification", label: "Loan Modifications", icon: "📝" },
    { value: "short-sale", label: "Short Sales", icon: "🤝" },
    { value: "refinance", label: "Refinancing", icon: "💰" },
  ];

  const filteredStories =
    selectedCategory === "all"
      ? stories
      : stories.filter((story) => story.category === selectedCategory);

  const totalSaved = stories.reduce((sum, story) => {
    return sum + parseInt(story.savings.replace(/[$,]/g, ""));
  }, 0);

  return (
    <>
      <Helmet>
        <title>
          Success Stories - Real Families We've Helped | RepMotivatedSeller
        </title>
        <meta
          name="description"
          content="Read inspiring stories from families who saved their homes from foreclosure. Over $400,000 in combined savings and counting."
        />
        <meta
          name="keywords"
          content="foreclosure success stories, saved from foreclosure, loan modification success, short sale stories"
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 pt-8">
          <BackButton />
        </div>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                🏆 Success Stories
              </h1>
              <p className="text-xl sm:text-2xl mb-8 text-blue-100 max-w-4xl mx-auto">
                Real families. Real results. Over{" "}
                <span className="text-yellow-400 font-bold">
                  ${(totalSaved / 1000).toFixed(0)}K+
                </span>{" "}
                saved and counting.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-3xl font-bold text-yellow-400">
                    {stories.length}
                  </div>
                  <div className="text-sm text-blue-100">Families Helped</div>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-3xl font-bold text-yellow-400">
                    ${(totalSaved / 1000).toFixed(0)}K+
                  </div>
                  <div className="text-sm text-blue-100">Total Saved</div>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-3xl font-bold text-yellow-400">8</div>
                  <div className="text-sm text-blue-100">States</div>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-3xl font-bold text-yellow-400">100%</div>
                  <div className="text-sm text-blue-100">Success Rate</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 bg-white shadow-md sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap gap-4 justify-center">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    selectedCategory === category.value
                      ? "bg-blue-600 text-white shadow-lg transform scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.icon} {category.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Stories Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredStories.map((story, index) => (
                <motion.div
                  key={story.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onClick={() => setSelectedStory(story)}
                >
                  {/* Image */}
                  <div className="relative h-56 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                    <div className="text-center text-white p-4">
                      <div className="text-6xl mb-2">🏠</div>
                      <p className="font-semibold text-lg">{story.location}</p>
                    </div>
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      ✓ Success
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {story.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {story.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          {story.savings}
                        </p>
                        <p className="text-xs text-gray-600">Saved</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-start text-sm">
                        <span className="text-red-500 mr-2 mt-1">📉</span>
                        <span className="text-gray-700 line-clamp-2">
                          <strong>Challenge:</strong> {story.situation}
                        </span>
                      </div>
                      <div className="flex items-start text-sm">
                        <span className="text-green-500 mr-2 mt-1">📈</span>
                        <span className="text-gray-700 line-clamp-2">
                          <strong>Solution:</strong> {story.outcome}
                        </span>
                      </div>
                    </div>

                    <blockquote className="border-l-4 border-blue-500 pl-4 py-2 italic text-gray-600 text-sm line-clamp-3 mb-4">
                      "{story.quote}"
                    </blockquote>

                    <button className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-100 transition-colors">
                      Read Full Story →
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Detail Modal */}
        {selectedStory && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedStory(null)}
          >
            <motion.div
              className="bg-white rounded-xl max-w-4xl w-full my-8 shadow-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="relative h-64 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-t-xl flex items-center justify-center">
                <div className="text-center text-white p-4">
                  <div className="text-7xl mb-4">🏠</div>
                  <h2 className="text-3xl font-bold mb-2">
                    {selectedStory.name}
                  </h2>
                  <p className="text-xl">{selectedStory.location}</p>
                </div>
                <button
                  onClick={() => setSelectedStory(null)}
                  className="absolute top-4 right-4 bg-white text-gray-700 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  ✕
                </button>
                <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-full font-bold">
                  Saved {selectedStory.savings}
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h4 className="font-bold text-red-600 mb-2 flex items-center">
                      <span className="mr-2">📉</span> The Challenge
                    </h4>
                    <p className="text-gray-700">{selectedStory.situation}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-green-600 mb-2 flex items-center">
                      <span className="mr-2">📈</span> The Solution
                    </h4>
                    <p className="text-gray-700">{selectedStory.outcome}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="font-bold text-gray-900 mb-3 text-lg">
                    Their Story
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedStory.details}
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <blockquote className="text-lg italic text-gray-800 text-center">
                    "{selectedStory.quote}"
                  </blockquote>
                  <p className="text-center font-semibold text-gray-700 mt-4">
                    - {selectedStory.name}
                  </p>
                </div>

                <div className="flex items-center justify-center space-x-8 text-center mb-8">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">
                      {selectedStory.timeline.split(" ")[0]}
                    </div>
                    <div className="text-sm text-gray-600">
                      Days to Resolution
                    </div>
                  </div>
                  <div className="w-px h-12 bg-gray-300"></div>
                  <div>
                    <div className="text-3xl font-bold text-green-600">
                      {selectedStory.savings}
                    </div>
                    <div className="text-sm text-gray-600">Total Savings</div>
                  </div>
                </div>

                <div className="border-t pt-6 text-center">
                  <p className="text-gray-600 mb-4">
                    Facing a similar situation? We can help you too.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      to="/foreclosure"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      onClick={() => setSelectedStory(null)}
                    >
                      🆘 Get Help Now
                    </Link>
                    <Link
                      to="/consultation"
                      className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      onClick={() => setSelectedStory(null)}
                    >
                      📞 Free Consultation
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Your Success Story Starts Here
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Join the hundreds of families who have saved their homes with our
              help
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/foreclosure"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
              >
                🆘 Get Started Today
              </Link>
              <Link
                to="/consultation"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
              >
                📞 Free Consultation
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default SuccessStoriesPage;
