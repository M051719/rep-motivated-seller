import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { BackButton } from "../components/ui/BackButton";
import ImageUploader from "../components/ImageUploader";
import {
  Home,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Maximize,
  Image as ImageIcon,
  Upload,
  Phone,
  User,
  Calendar,
  Zap,
  Droplet,
  Wind,
  Sun,
  Car,
  Building,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface FSBOListing {
  id: string;
  created_at: string;
  owner_name: string;
  owner_phone: string;
  address: string;
  city: string;
  zip_code: string;
  asking_price: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  lot_size: number;
  year_built: number;
  property_tax: number | null;
  property_condition: string;
  year_remodeled: number | null;

  // Structure details
  home_style: string;
  garage_spaces: number;
  garage_attached: boolean;
  has_den: boolean;
  has_dining_room: boolean;
  has_recreation_room: boolean;
  has_office: boolean;
  has_loft: boolean;
  has_sun_room: boolean;
  has_shed: boolean;
  has_barn: boolean;
  has_dog_pen: boolean;

  // Utilities & Systems
  water_type: string;
  electricity_type: string;
  has_solar: boolean;
  ac_type: string;
  heating_type: string;
  hot_water_type: string;
  has_basement: boolean;
  basement_type: string | null;
  basement_sqft: number | null;
  has_adu: boolean;

  // Financing
  is_free_and_clear: boolean;
  existing_loans: string | null;

  // Images
  featured_image_url: string | null;
  images: string[];

  // Status
  status: string;
  user_id: string | null;
}

const FSBOListing: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [listings, setListings] = useState<FSBOListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterCity, setFilterCity] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [bedroomFilter, setBedroomFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    owner_name: "",
    owner_phone: "",
    address: "",
    city: "Los Angeles",
    zip_code: "",
    asking_price: "",
    bedrooms: "",
    bathrooms: "",
    square_feet: "",
    lot_size: "",
    year_built: "",
    property_tax: "",
    property_condition: "good",
    year_remodeled: "",
    home_style: "single-family",
    garage_spaces: "2",
    garage_attached: true,
    has_den: false,
    has_dining_room: false,
    has_recreation_room: false,
    has_office: false,
    has_loft: false,
    has_sun_room: false,
    has_shed: false,
    has_barn: false,
    has_dog_pen: false,
    water_type: "city",
    electricity_type: "standard",
    has_solar: false,
    ac_type: "central",
    heating_type: "central",
    hot_water_type: "tank",
    has_basement: false,
    basement_type: "",
    basement_sqft: "",
    has_adu: false,
    is_free_and_clear: false,
    existing_loans: "",
    featured_image_url: "",
    images: [] as string[],
  });

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("fsbo_listings")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error: any) {
      console.error("Error fetching FSBO listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const listingData = {
        owner_name: formData.owner_name,
        owner_phone: formData.owner_phone,
        address: formData.address,
        city: formData.city,
        zip_code: formData.zip_code,
        asking_price: parseFloat(formData.asking_price),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseFloat(formData.bathrooms),
        square_feet: parseInt(formData.square_feet),
        lot_size: parseFloat(formData.lot_size),
        year_built: parseInt(formData.year_built),
        property_tax: formData.property_tax
          ? parseFloat(formData.property_tax)
          : null,
        property_condition: formData.property_condition,
        year_remodeled: formData.year_remodeled
          ? parseInt(formData.year_remodeled)
          : null,
        home_style: formData.home_style,
        garage_spaces: parseInt(formData.garage_spaces),
        garage_attached: formData.garage_attached,
        has_den: formData.has_den,
        has_dining_room: formData.has_dining_room,
        has_recreation_room: formData.has_recreation_room,
        has_office: formData.has_office,
        has_loft: formData.has_loft,
        has_sun_room: formData.has_sun_room,
        has_shed: formData.has_shed,
        has_barn: formData.has_barn,
        has_dog_pen: formData.has_dog_pen,
        water_type: formData.water_type,
        electricity_type: formData.electricity_type,
        has_solar: formData.has_solar,
        ac_type: formData.ac_type,
        heating_type: formData.heating_type,
        hot_water_type: formData.hot_water_type,
        has_basement: formData.has_basement,
        basement_type: formData.basement_type || null,
        basement_sqft: formData.basement_sqft
          ? parseInt(formData.basement_sqft)
          : null,
        has_adu: formData.has_adu,
        is_free_and_clear: formData.is_free_and_clear,
        existing_loans: formData.existing_loans || null,
        featured_image_url: formData.featured_image_url || null,
        images: formData.images,
        status: "active",
        user_id: user?.id || null,
      };

      const { error } = await supabase
        .from("fsbo_listings")
        .insert([listingData]);

      if (error) throw error;

      toast.success("🏠 Your listing has been posted! It will appear shortly.");
      setShowForm(false);
      fetchListings();

      // Reset form
      setFormData({
        owner_name: "",
        owner_phone: "",
        address: "",
        city: "Los Angeles",
        zip_code: "",
        asking_price: "",
        bedrooms: "",
        bathrooms: "",
        square_feet: "",
        lot_size: "",
        year_built: "",
        property_tax: "",
        property_condition: "good",
        year_remodeled: "",
        home_style: "single-family",
        garage_spaces: "2",
        garage_attached: true,
        has_den: false,
        has_dining_room: false,
        has_recreation_room: false,
        has_office: false,
        has_loft: false,
        has_sun_room: false,
        has_shed: false,
        has_barn: false,
        has_dog_pen: false,
        water_type: "city",
        electricity_type: "standard",
        has_solar: false,
        ac_type: "central",
        heating_type: "central",
        hot_water_type: "tank",
        has_basement: false,
        basement_type: "",
        basement_sqft: "",
        has_adu: false,
        is_free_and_clear: false,
        existing_loans: "",
        featured_image_url: "",
        images: [],
      });
    } catch (error: any) {
      console.error("Error creating listing:", error);
      toast.error("Failed to create listing. Please try again.");
    }
  };

  const filteredListings = listings.filter((listing) => {
    const matchesCity = filterCity === "all" || listing.city === filterCity;
    const matchesBedrooms =
      bedroomFilter === "all" || listing.bedrooms.toString() === bedroomFilter;

    let matchesPrice = true;
    if (priceRange === "0-300k") matchesPrice = listing.asking_price < 300000;
    else if (priceRange === "300k-500k")
      matchesPrice =
        listing.asking_price >= 300000 && listing.asking_price < 500000;
    else if (priceRange === "500k-750k")
      matchesPrice =
        listing.asking_price >= 500000 && listing.asking_price < 750000;
    else if (priceRange === "750k+")
      matchesPrice = listing.asking_price >= 750000;

    return matchesCity && matchesBedrooms && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />

        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-6 shadow-lg"
          >
            <Home className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            100% Free FSBO Listings
          </h1>
          <p className="text-2xl text-gray-600 mb-2">Los Angeles County</p>
          <p className="text-lg text-gray-500 max-w-3xl mx-auto">
            List your home for free! Perfect for For Sale By Owner (FSBO) and
            pre-foreclosure properties. No fees, no commissions—connect directly
            with buyers.
          </p>
        </div>

        {/* CTA Button */}
        <div className="text-center mb-12">
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-lg font-bold rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            <Upload className="w-6 h-6" />
            <span>
              {showForm ? "Hide Listing Form" : "List Your Home FREE"}
            </span>
          </button>
        </div>

        {/* Listing Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-white rounded-2xl shadow-2xl p-8 mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Create Your Free Listing
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Owner Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Owner Contact Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        required
                        value={formData.owner_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            owner_name: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        required
                        value={formData.owner_phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            owner_phone: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Location */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Property Location
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        required
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.zip_code}
                      onChange={(e) =>
                        setFormData({ ...formData, zip_code: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Basic Property Info */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Property Details
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Asking Price *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        required
                        value={formData.asking_price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            asking_price: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bedrooms *
                    </label>
                    <div className="relative">
                      <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        required
                        value={formData.bedrooms}
                        onChange={(e) =>
                          setFormData({ ...formData, bedrooms: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bathrooms *
                    </label>
                    <div className="relative">
                      <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        step="0.5"
                        required
                        value={formData.bathrooms}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bathrooms: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Square Feet *
                    </label>
                    <div className="relative">
                      <Maximize className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        required
                        value={formData.square_feet}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            square_feet: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lot Size (acres) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.lot_size}
                      onChange={(e) =>
                        setFormData({ ...formData, lot_size: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year Built *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        required
                        value={formData.year_built}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            year_built: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Features - Checkboxes */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Additional Rooms & Features
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { key: "has_den", label: "Den" },
                    { key: "has_dining_room", label: "Dining Room" },
                    { key: "has_recreation_room", label: "Recreation Room" },
                    { key: "has_office", label: "Office" },
                    { key: "has_loft", label: "Loft" },
                    { key: "has_sun_room", label: "Sun Room" },
                    { key: "has_shed", label: "Shed" },
                    { key: "has_barn", label: "Barn" },
                    { key: "has_dog_pen", label: "Dog Pen" },
                    { key: "has_adu", label: "ADU (Accessory Dwelling Unit)" },
                    { key: "has_solar", label: "Solar Panels" },
                    { key: "has_basement", label: "Basement" },
                  ].map((feature) => (
                    <label
                      key={feature.key}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={
                          formData[
                            feature.key as keyof typeof formData
                          ] as boolean
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [feature.key]: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-gray-700">{feature.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Garage */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Garage</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Garage Spaces
                    </label>
                    <select
                      value={formData.garage_spaces}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          garage_spaces: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="0">No Garage</option>
                      <option value="1">1 Car</option>
                      <option value="2">2 Cars</option>
                      <option value="3">3 Cars</option>
                      <option value="4">4+ Cars</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2 cursor-pointer mt-8">
                      <input
                        type="checkbox"
                        checked={formData.garage_attached}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            garage_attached: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-gray-700">Garage is Attached</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Utilities & Systems */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Utilities & Systems
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Air Conditioning
                    </label>
                    <select
                      value={formData.ac_type}
                      onChange={(e) =>
                        setFormData({ ...formData, ac_type: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="central">Central A/C</option>
                      <option value="window">Window Units</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heating
                    </label>
                    <select
                      value={formData.heating_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          heating_type: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="central">Central Heat</option>
                      <option value="forced-air">Forced Air</option>
                      <option value="radiator">Radiator</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Water
                    </label>
                    <select
                      value={formData.water_type}
                      onChange={(e) =>
                        setFormData({ ...formData, water_type: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="city">City Water</option>
                      <option value="well">Well Water</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Financing */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Financing Information
                </h3>
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      checked={formData.is_free_and_clear}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_free_and_clear: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-gray-700 font-medium">
                      Property is Free and Clear (No Loans)
                    </span>
                  </label>

                  {!formData.is_free_and_clear && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Existing Loans (describe)
                      </label>
                      <textarea
                        value={formData.existing_loans}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            existing_loans: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        placeholder="e.g., First mortgage $300,000, HELOC $50,000"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Property Images */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Property Photos
                </h3>
                <ImageUploader
                  bucket="fsbo-listings"
                  folder="properties"
                  onImageUploaded={(url) =>
                    setFormData({
                      ...formData,
                      featured_image_url: url,
                      images: [...formData.images, url],
                    })
                  }
                  onImageRemoved={() => {}}
                  currentImage={formData.featured_image_url}
                  maxSizeMB={10}
                />
                <p className="text-sm text-gray-600 mt-2">
                  Upload photos of your property. First image will be the
                  featured image.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Publish Listing FREE</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Filter Listings
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Prices</option>
                <option value="0-300k">Under $300k</option>
                <option value="300k-500k">$300k - $500k</option>
                <option value="500k-750k">$500k - $750k</option>
                <option value="750k+">$750k+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bedrooms
              </label>
              <select
                value={bedroomFilter}
                onChange={(e) => setBedroomFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Cities</option>
                <option value="Los Angeles">Los Angeles</option>
                <option value="Long Beach">Long Beach</option>
                <option value="Glendale">Glendale</option>
                <option value="Pasadena">Pasadena</option>
                <option value="Torrance">Torrance</option>
              </select>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Showing {filteredListings.length} of {listings.length} listings
          </p>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading listings...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No listings found
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to list your property in this area!
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Upload className="w-5 h-5" />
              <span>List Your Home</span>
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow border-2 border-green-100"
              >
                {/* Property Image */}
                <div className="relative h-56 bg-gradient-to-br from-green-100 to-blue-100">
                  {listing.featured_image_url ? (
                    <img
                      src={listing.featured_image_url}
                      alt={listing.address}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Home className="w-24 h-24 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-green-600 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                    ${(listing.asking_price / 1000).toFixed(0)}k
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {listing.address}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {listing.city}, CA {listing.zip_code}
                  </p>

                  <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Bed className="w-4 h-4 text-green-600" />
                      <span className="font-semibold">
                        {listing.bedrooms} bd
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Bath className="w-4 h-4 text-green-600" />
                      <span className="font-semibold">
                        {listing.bathrooms} ba
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Maximize className="w-4 h-4 text-green-600" />
                      <span className="font-semibold">
                        {listing.square_feet.toLocaleString()} sqft
                      </span>
                    </div>
                  </div>

                  {listing.has_solar && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Sun className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-700">
                        Solar Panels
                      </span>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Contact Owner:</p>
                    <p className="font-semibold text-gray-900">
                      {listing.owner_name}
                    </p>
                    <p className="text-green-600 font-semibold">
                      {listing.owner_phone}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FSBOListing;
