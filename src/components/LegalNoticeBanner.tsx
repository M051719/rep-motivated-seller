import React from 'react';
import { Shield, AlertTriangle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface LegalNoticeBannerProps {
  onDismiss?: () => void;
}

export default function LegalNoticeBanner({ onDismiss }: LegalNoticeBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 text-white"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center space-x-4 flex-wrap">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span className="font-bold text-sm md:text-base">
              IMPORTANT NOTICE:
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm md:text-base">
            <AlertTriangle className="w-4 h-4" />
            <span>
              All loans must be processed through RepMotivatedSeller
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-sm">
            <FileText className="w-4 h-4" />
            <span>
              Platform data protected by law
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
