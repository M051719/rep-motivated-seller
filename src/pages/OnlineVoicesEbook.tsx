import React, { useState } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { BackButton } from "../components/ui/BackButton";

const OnlineVoicesEbook: React.FC = () => {
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);

  const ebookData = {
    title:
      "Online Voices: Finding Support Through Social Media During Foreclosure",
    subtitle: "navigating tough times",
    description:
      "Discover how digital communities can provide essential guidance and emotional support for homeowners facing distress. By engaging in online forums and social media groups, individuals can connect with others navigating similar challenges, access valuable resources, and learn effective strategies to regain financial stability.",
    coverImage: "🏠💬",
    chapters: [
      {
        number: 1,
        title: "Understanding Foreclosure",
        sections: [
          "The Basics of Foreclosure",
          "Common Causes of Foreclosure",
          "The Impact of Foreclosure on Families",
        ],
        summary:
          "Learn the fundamentals of foreclosure, including the legal process, common triggers like job loss and medical emergencies, and the profound emotional and financial impact on families.",
      },
      {
        number: 2,
        title: "Community Support Groups for Foreclosure Prevention",
        sections: [
          "Finding Local Support Groups",
          "Online Community Resources",
          "Sharing Experiences and Strategies",
        ],
        summary:
          "Discover local and online support groups that offer practical advice, emotional support, and a sense of community for those facing foreclosure.",
      },
      {
        number: 3,
        title: "Legal Aid and Resources for Pre-Foreclosure Issues",
        sections: [
          "Understanding Your Rights",
          "Finding Legal Assistance",
          "Resources for Free or Low-Cost Legal Help",
        ],
        summary:
          "Navigate the legal complexities of foreclosure with guidance on your rights, finding legal assistance, and accessing free or affordable legal resources.",
      },
      {
        number: 4,
        title: "Online Forums and Social Media Support for Affected Families",
        sections: [
          "Navigating Social Media Platforms",
          "Participating in Online Forums",
          "Building a Support Network Online",
        ],
        summary:
          "Learn how to effectively use social media and online forums to connect with peers, share experiences, and build a supportive network during challenging times.",
      },
      {
        number: 5,
        title: "Workshops on Budgeting and Financial Management",
        sections: [
          "Importance of Financial Literacy",
          "Finding Local Workshops",
          "Online Resources for Financial Education",
        ],
        summary:
          "Develop essential budgeting and financial management skills through workshops and online resources to regain control over your finances.",
      },
      {
        number: 6,
        title: "Emotional Support and Mental Health Resources for Victims",
        sections: [
          "Recognizing Emotional Strain",
          "Accessing Mental Health Services",
          "Building Resilience Through Support",
        ],
        summary:
          "Address the emotional toll of foreclosure by recognizing signs of strain, accessing mental health services, and building resilience through community support.",
      },
      {
        number: 7,
        title: "Local Government Programs for Homeowner Assistance",
        sections: [
          "Overview of Available Programs",
          "Eligibility Criteria and Application Processes",
          "Success Stories from Local Initiatives",
        ],
        summary:
          "Explore local government assistance programs, understand eligibility requirements, and learn from success stories of homeowners who received help.",
      },
      {
        number: 8,
        title:
          "Networking Events for Real Estate Professionals Helping Homeowners",
        sections: [
          "Importance of Networking",
          "Finding Networking Opportunities",
          "Collaborating for Community Solutions",
        ],
        summary:
          "Connect with real estate professionals and community advocates through networking events to access expert guidance and collaborative solutions.",
      },
      {
        number: 9,
        title: "Peer Mentorship Programs for Individuals Facing Foreclosure",
        sections: [
          "The Role of Peer Mentorship",
          "Connecting with Mentors",
          "Sharing Successful Strategies",
        ],
        summary:
          "Benefit from peer mentorship programs that connect you with individuals who have successfully navigated foreclosure, offering guidance and hope.",
      },
      {
        number: 10,
        title: "Moving Forward: Building a New Future",
        sections: [
          "Lessons Learned from the Experience",
          "Setting New Goals and Priorities",
          "Embracing Change and Growth",
        ],
        summary:
          "Reflect on lessons learned, set new financial and personal goals, and embrace the opportunity for growth and positive change after facing foreclosure.",
      },
    ],
  };

  const toggleChapter = (chapterNumber: number) => {
    setExpandedChapter(
      expandedChapter === chapterNumber ? null : chapterNumber,
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>{ebookData.title} | RepMotivatedSeller</title>
        <meta name="description" content={ebookData.description} />
        <meta
          name="keywords"
          content="foreclosure support, social media help, online forums, community support, financial distress, homeowner assistance"
        />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <BackButton />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-4">{ebookData.coverImage}</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {ebookData.title}
          </h1>
          <p className="text-xl text-purple-600 font-medium mb-6">
            {ebookData.subtitle}
          </p>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            {ebookData.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <motion.a
              href="https://app.designrr.io/projectHtml/2544947?token=caa3212fa32d0128c85ea7fd4922ba6d&mode=nice_preview"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              📖 Read Full E-Book Online
            </motion.a>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-purple-600 border-2 border-purple-600 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              📥 Download PDF
            </motion.button>
          </div>
        </motion.div>

        {/* Table of Contents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            📚 Table of Contents
          </h2>

          <div className="space-y-4">
            {ebookData.chapters.map((chapter) => (
              <motion.div
                key={chapter.number}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: chapter.number * 0.05 }}
                className="border border-gray-200 rounded-lg overflow-hidden hover:border-purple-400 transition-colors"
              >
                <button
                  onClick={() => toggleChapter(chapter.number)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white hover:from-purple-50 hover:to-pink-50 transition-all"
                >
                  <div className="flex items-center space-x-4 text-left flex-1">
                    <span className="text-2xl font-bold text-purple-600">
                      {chapter.number}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {chapter.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {chapter.summary}
                      </p>
                    </div>
                  </div>
                  <motion.span
                    animate={{
                      rotate: expandedChapter === chapter.number ? 180 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="text-2xl text-purple-600"
                  >
                    ▼
                  </motion.span>
                </button>

                {expandedChapter === chapter.number && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 py-4 bg-purple-50 border-t border-purple-200"
                  >
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Sections:
                    </h4>
                    <ul className="space-y-2">
                      {chapter.sections.map((section, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-purple-600 mt-1">•</span>
                          <span className="text-gray-700">{section}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Key Topics Covered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            🎯 Key Topics Covered
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <span className="text-3xl">🤝</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Community Support
                </h3>
                <p className="text-gray-600 text-sm">
                  Connect with others facing similar challenges through support
                  groups and online communities
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-3xl">⚖️</span>
              <div>
                <h3 className="font-semibold text-gray-900">Legal Resources</h3>
                <p className="text-gray-600 text-sm">
                  Understand your rights and access free or low-cost legal
                  assistance
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-3xl">💰</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Financial Management
                </h3>
                <p className="text-gray-600 text-sm">
                  Learn budgeting skills and financial literacy to regain
                  control
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-3xl">🧠</span>
              <div>
                <h3 className="font-semibold text-gray-900">Mental Health</h3>
                <p className="text-gray-600 text-sm">
                  Access emotional support and mental health resources during
                  difficult times
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-3xl">🏛️</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Government Programs
                </h3>
                <p className="text-gray-600 text-sm">
                  Discover local assistance programs and eligibility
                  requirements
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-3xl">🌱</span>
              <div>
                <h3 className="font-semibold text-gray-900">Moving Forward</h3>
                <p className="text-gray-600 text-sm">
                  Set new goals and embrace growth after facing foreclosure
                  challenges
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-center text-white"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Find Support and Solutions?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            This comprehensive guide will help you navigate foreclosure with
            confidence and community support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="https://app.designrr.io/projectHtml/2544947?token=caa3212fa32d0128c85ea7fd4922ba6d&mode=nice_preview"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              📖 Start Reading Now
            </motion.a>
            <motion.a
              href="/foreclosure-help"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-purple-700 text-white border-2 border-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              🆘 Get Immediate Help
            </motion.a>
          </div>
        </motion.div>

        {/* Additional Resources */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-gray-600"
        >
          <p className="mb-4">Looking for more resources?</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/resources"
              className="text-purple-600 hover:text-purple-800 font-medium underline"
            >
              📚 Browse All Resources
            </a>
            <a
              href="/education"
              className="text-purple-600 hover:text-purple-800 font-medium underline"
            >
              🎓 Education Center
            </a>
            <a
              href="/foreclosure-questionnaire"
              className="text-purple-600 hover:text-purple-800 font-medium underline"
            >
              📝 Take Our Assessment
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OnlineVoicesEbook;
