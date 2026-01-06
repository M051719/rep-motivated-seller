import React from "react";
import ForeclosureQuestionnaire from "../components/ForeclosureQuestionnaire";
import { BackButton } from "../components/ui/BackButton";

export const ForeclosurePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <BackButton />
      </div>
      <ForeclosureQuestionnaire />
    </div>
  );
};

export default ForeclosurePage;
