import React from "react";
import AdminDashboard from "../components/AdminDashboard";
import { BackButton } from "../components/ui/BackButton";

export const AdminPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <BackButton />
      </div>
      <AdminDashboard />
    </div>
  );
};

export default AdminPage;
