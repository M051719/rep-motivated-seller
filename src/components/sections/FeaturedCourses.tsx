import React from "react";

export default function FeaturedCourses() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Featured Resources
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">
              Foreclosure Prevention Guide
            </h3>
            <p className="text-gray-600">
              Learn strategies to avoid foreclosure and protect your home.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Financial Planning</h3>
            <p className="text-gray-600">
              Master budgeting and financial management fundamentals.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">
              Legal Rights and Options
            </h3>
            <p className="text-gray-600">
              Understand your rights when facing foreclosure.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
