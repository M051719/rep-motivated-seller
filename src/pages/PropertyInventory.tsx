import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BackButton } from "../components/ui/BackButton";
import AddPropertyModal from "../components/AddPropertyModal";
import {
  Plus,
  Edit2,
  Trash2,
  Home,
  DollarSign,
  MapPin,
  Calendar,
  TrendingUp,
  Image as ImageIcon,
  FileText,
  Filter,
  Search,
  Eye,
} from "lucide-react";

interface Property {
  id: string;
  created_at: string;
  updated_at: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  property_type: string;
  purchase_price: number | null;
  current_value: number | null;
  sale_price: number | null;
  monthly_rent: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  status:
    | "available"
    | "under-contract"
    | "purchased"
    | "sold"
    | "refinanced"
    | "archived";
  acquisition_date: string | null;
  sale_date: string | null;
  total_invested: number | null;
  profit: number | null;
  roi: number | null;
  description: string | null;
  featured_image_url: string | null;
  owner_id: string;
}

const PropertyInventory: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchProperties();
  }, [user, navigate]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error: any) {
      console.error("Error fetching properties:", error);
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.state.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || property.status === statusFilter;
    const matchesType =
      typeFilter === "all" || property.property_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "under-contract":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "purchased":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "sold":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "refinanced":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "archived":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const stats = {
    total: properties.length,
    available: properties.filter((p) => p.status === "available").length,
    purchased: properties.filter((p) => p.status === "purchased").length,
    sold: properties.filter((p) => p.status === "sold").length,
    totalInvested: properties.reduce(
      (sum, p) => sum + (p.total_invested || 0),
      0,
    ),
    totalProfit: properties.reduce((sum, p) => sum + (p.profit || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <Home className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Property Inventory
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Track and manage your real estate portfolio
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-6 border-2 border-blue-100"
          >
            <div className="text-blue-600 text-sm font-medium mb-1">
              Total Properties
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.total}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-md p-6 border-2 border-green-100"
          >
            <div className="text-green-600 text-sm font-medium mb-1">
              Available
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.available}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-6 border-2 border-purple-100"
          >
            <div className="text-purple-600 text-sm font-medium mb-1">Sold</div>
            <div className="text-3xl font-bold text-gray-900">{stats.sold}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-6 border-2 border-indigo-100"
          >
            <div className="text-indigo-600 text-sm font-medium mb-1">
              Total Profit
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ${stats.totalProfit.toLocaleString()}
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Properties
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Address, city, or state..."
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="under-contract">Under Contract</option>
                <option value="purchased">Purchased</option>
                <option value="sold">Sold</option>
                <option value="refinanced">Refinanced</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="single-family">Single Family</option>
                <option value="multi-family">Multi-Family</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="land">Land</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredProperties.length} of {properties.length}{" "}
              properties
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Add Property</span>
            </button>
          </div>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No properties found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your filters"
                : "Start building your portfolio by adding your first property"}
            </p>
            {!searchTerm && statusFilter === "all" && typeFilter === "all" && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Add Your First Property</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border-2 border-gray-100"
              >
                {/* Property Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100">
                  {property.featured_image_url ? (
                    <img
                      src={property.featured_image_url}
                      alt={property.address}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Home className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(
                        property.status,
                      )}`}
                    >
                      {property.status.replace("-", " ").toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {property.address}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {property.city}, {property.state} {property.zip_code}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    {property.bedrooms && (
                      <div>
                        <span className="text-gray-600">Beds:</span>
                        <span className="ml-1 font-semibold">
                          {property.bedrooms}
                        </span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div>
                        <span className="text-gray-600">Baths:</span>
                        <span className="ml-1 font-semibold">
                          {property.bathrooms}
                        </span>
                      </div>
                    )}
                    {property.square_feet && (
                      <div>
                        <span className="text-gray-600">Sq Ft:</span>
                        <span className="ml-1 font-semibold">
                          {property.square_feet.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {property.monthly_rent && (
                      <div>
                        <span className="text-gray-600">Rent:</span>
                        <span className="ml-1 font-semibold">
                          ${property.monthly_rent.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {property.purchase_price && (
                    <div className="mb-3">
                      <p className="text-2xl font-bold text-blue-600">
                        ${property.purchase_price.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">Purchase Price</p>
                    </div>
                  )}

                  {property.roi !== null && (
                    <div className="flex items-center space-x-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-600">
                        {property.roi.toFixed(2)}% ROI
                      </span>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        navigate(`/property-inventory/${property.id}`)
                      }
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Property Modal */}
        <AddPropertyModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchProperties}
        />
      </div>
    </div>
  );
};

export default PropertyInventory;
