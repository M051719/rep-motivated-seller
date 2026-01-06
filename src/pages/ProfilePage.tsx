import React from "react";
import UserProfile from "../components/UserProfile";

export const ProfilePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <UserProfile />
    </div>
  );
};

export default ProfilePage;
