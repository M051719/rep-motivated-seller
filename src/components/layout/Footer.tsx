import React from "react";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  MessageCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🏠</span>
              <span className="font-bold text-xl">RepMotivatedSeller</span>
            </div>
            <p className="text-gray-300 mb-4">
              Helping homeowners avoid foreclosure through education, resources,
              and direct assistance.
            </p>
            <div className="space-y-2 text-sm text-gray-300">
              <p>
                📞{" "}
                <a
                  href={`tel:${import.meta.env.VITE_BUSINESS_PHONE || "+18778064677"}`}
                  className="hover:text-white transition-colors"
                >
                  {import.meta.env.VITE_BUSINESS_PHONE || "(877) 806-4677"}
                </a>
              </p>
              <p>
                📧 General:{" "}
                <a
                  href="mailto:admin@repmotivatedseller.shoprealestatespace.org"
                  className="hover:text-white transition-colors"
                >
                  admin@repmotivatedseller.shoprealestatespace.org
                </a>
              </p>
              <p>
                🚨 Urgent:{" "}
                <a
                  href="mailto:urgent@repmotivatedseller.shoprealestatespace.org"
                  className="hover:text-white transition-colors text-red-400"
                >
                  urgent@repmotivatedseller.shoprealestatespace.org
                </a>
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Contact Us
            </Link>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link
                to="/"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                to="/foreclosure"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Get Help
              </Link>
              <Link
                to="/success-stories"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Success Stories
              </Link>
              <Link
                to="/blog"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Blog
              </Link>
              <Link
                to="/resources"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Resources
              </Link>
              <Link
                to="/subscription"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Membership
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <div className="space-y-2">
              <Link
                to="/compliance/glba"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                GLBA Compliance
              </Link>
              <Link
                to="/compliance/pci-dss"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                PCI DSS Compliance
              </Link>
              <Link
                to="/privacy-policy"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-of-service"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/refund-policy"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Refund Policy
              </Link>
              <Link
                to="/disclaimer"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Disclaimer
              </Link>
              <Link
                to="/unsubscribe"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Unsubscribe
              </Link>
              <Link
                to="/sitemap"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}

        {/* Social Media */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex justify-center space-x-6">
            <a
              href="https://www.facebook.com/profile.php?id=61571003534655"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-6 h-6" />
            </a>
            <a
              href="https://www.instagram.com/repmotivatedseller/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a
              href="https://x.com/RepMotivated"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
              aria-label="X (Twitter)"
            >
              <Twitter className="w-6 h-6" />
            </a>
            <a
              href="https://www.pinterest.com/repmotivatedseller/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
              aria-label="Pinterest"
            >
              <svg
                className="w-6 h-6 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 0a12 12 0 0 0-4.37 23.17c-.05-1.18 0-2.6.38-3.88l2.67-11.34s-.66-1.33-.66-3.3c0-3.1 1.8-5.42 4.04-5.42 1.9 0 2.82 1.43 2.82 3.15 0 1.92-1.22 4.78-1.85 7.43-.52 2.22 1.11 4.03 3.3 4.03 3.96 0 6.62-5.08 6.62-11.1 0-4.57-3.08-7.99-8.67-7.99-6.3 0-10.15 4.72-10.15 9.98 0 1.82.54 3.1 1.38 4.09.38.45.44.63.3 1.15-.1.37-.32 1.28-.41 1.64-.14.5-.55.68-1.02.5-2.83-1.15-4.15-4.23-4.15-7.69 0-5.71 4.82-12.57 14.37-12.57 7.66 0 12.72 5.54 12.72 11.54 0 7.9-4.4 13.86-10.88 13.86-2.18 0-4.23-1.17-4.93-2.5l-1.34 5.29c-.48 1.84-1.42 3.69-2.32 5.18A12 12 0 1 0 12 0z" />
              </svg>
            </a>
            <a
              href="https://join.slack.com/t/repmotivatedseller/shared_invite/zt-2y7rxz7xg-B_8fOFjcHYZkZLqR0RqA0A"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
              aria-label="Slack Community"
            >
              <MessageCircle className="w-6 h-6" />
            </a>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © {new Date().getFullYear()} RepMotivatedSeller. All rights
              reserved.
            </p>
            <div className="text-center mt-4 md:mt-0">
              <p className="text-gray-400 text-xs">
                📧 To opt out of marketing:{" "}
                <a
                  href="mailto:optout@repmotivatedseller.shoprealestatespace.org"
                  className="text-blue-300 hover:text-blue-200"
                >
                  optout@repmotivatedseller.shoprealestatespace.org
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
