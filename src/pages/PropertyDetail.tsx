import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { BackButton } from '../components/ui/BackButton';
import ImageUploader from '../components/ImageUploader';
import {
  Home,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Maximize,
  Calendar,
  TrendingUp,
  Edit2,
  Trash2,
  Save,
  X,
  Upload,
  FileText,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';

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
  mortgage_balance: number | null;
  monthly_payment: number | null;
  monthly_rent: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  lot_size: number | null;
  year_built: number | null;
  status: string;
  acquisition_date: string | null;
  sale_date: string | null;
  total_invested: number | null;
  repair_costs: number | null;
  holding_costs: number | null;
  profit: number | null;
  roi: number | null;
  description: string | null;
  notes: string | null;
  featured_image_url: string | null;
  listing_url: string | null;
  mls_number: string | null;
  owner_id: string;
}

interface PropertyImage {
  id: string;
  created_at: string;
  property_id: string;
  image_url: string;
  caption: string | null;
  display_order: number;
  is_featured: boolean;
}

interface PropertyDocument {
  id: string;
  created_at: string;
  property_id: string;
  document_type: string;
  document_url: string;
  file_name: string;
  file_size: number | null;
  notes: string | null;
}

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [documents, setDocuments] = useState<PropertyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProperty, setEditedProperty] = useState<Partial<Property>>({});

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (id) {
      fetchPropertyDetails();
    }
  }, [id, user, navigate]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);

      // Fetch property
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .eq('owner_id', user?.id)
        .single();

      if (propertyError) throw propertyError;
      setProperty(propertyData);
      setEditedProperty(propertyData);

      // Fetch images
      const { data: imagesData, error: imagesError } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', id)
        .order('display_order', { ascending: true });

      if (imagesError) throw imagesError;
      setImages(imagesData || []);

      // Fetch documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('property_documents')
        .select('*')
        .eq('property_id', id)
        .order('created_at', { ascending: false });

      if (documentsError) throw documentsError;
      setDocuments(documentsData || []);
    } catch (error: any) {
      console.error('Error fetching property details:', error);
      if (error.code === 'PGRST116') {
        toast.error('Property not found');
        navigate('/property-inventory');
      } else {
        toast.error('Failed to load property details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!property) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('properties')
        .update(editedProperty)
        .eq('id', property.id)
        .eq('owner_id', user?.id);

      if (error) throw error;

      toast.success('Property updated successfully!');
      setProperty({ ...property, ...editedProperty });
      setIsEditing(false);
      fetchPropertyDetails();
    } catch (error: any) {
      console.error('Error updating property:', error);
      toast.error('Failed to update property');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!property) return;

    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', property.id)
        .eq('owner_id', user?.id);

      if (error) throw error;

      toast.success('Property deleted successfully');
      navigate('/property-inventory');
    } catch (error: any) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    }
  };

  const handleImageUpload = async (url: string) => {
    if (!property) return;

    try {
      const { error } = await supabase.from('property_images').insert([
        {
          property_id: property.id,
          image_url: url,
          display_order: images.length,
        },
      ]);

      if (error) throw error;

      toast.success('Image added successfully!');
      fetchPropertyDetails();
    } catch (error: any) {
      console.error('Error adding image:', error);
      toast.error('Failed to add image');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'under-contract':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'purchased':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sold':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'refinanced':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading property details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BackButton />
          <div className="text-center py-12">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Property not found</h3>
            <p className="text-gray-600">The property you're looking for doesn't exist or you don't have access to it.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton />

        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(property.status)}`}
                >
                  {property.status.replace('-', ' ').toUpperCase()}
                </span>
                {property.mls_number && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    MLS: {property.mls_number}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.address}</h1>
              <p className="text-lg text-gray-600 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                {property.city}, {property.state} {property.zip_code}
              </p>
            </div>

            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedProperty(property);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>Delete</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Featured Image */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative h-96 bg-gradient-to-br from-blue-100 to-purple-100">
                {property.featured_image_url ? (
                  <img
                    src={property.featured_image_url}
                    alt={property.address}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Home className="w-32 h-32 text-gray-300" />
                  </div>
                )}
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.bedrooms && (
                  <div className="flex items-center space-x-2">
                    <Bed className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{property.bedrooms}</p>
                      <p className="text-sm text-gray-600">Bedrooms</p>
                    </div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center space-x-2">
                    <Bath className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{property.bathrooms}</p>
                      <p className="text-sm text-gray-600">Bathrooms</p>
                    </div>
                  </div>
                )}
                {property.square_feet && (
                  <div className="flex items-center space-x-2">
                    <Maximize className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{property.square_feet.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Sq Ft</p>
                    </div>
                  </div>
                )}
                {property.year_built && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{property.year_built}</p>
                      <p className="text-sm text-gray-600">Year Built</p>
                    </div>
                  </div>
                )}
              </div>

              {property.description && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
                </div>
              )}

              {property.notes && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-900 mb-2">Internal Notes</h3>
                  <p className="text-gray-700 whitespace-pre-line">{property.notes}</p>
                </div>
              )}
            </div>

            {/* Additional Images */}
            {images.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Photo Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((img) => (
                    <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden">
                      <img
                        src={img.image_url}
                        alt={img.caption || 'Property image'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents */}
            {documents.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Documents</h2>
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <div>
                          <p className="font-semibold text-gray-900">{doc.file_name}</p>
                          <p className="text-sm text-gray-600">
                            {doc.document_type.replace('-', ' ').toUpperCase()}
                            {doc.file_size && ` • ${(doc.file_size / 1024).toFixed(0)} KB`}
                          </p>
                        </div>
                      </div>
                      <a
                        href={doc.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Financial Overview */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Financial Overview</h2>
              <div className="space-y-4">
                {property.purchase_price && (
                  <div>
                    <p className="text-sm text-gray-600">Purchase Price</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${property.purchase_price.toLocaleString()}
                    </p>
                  </div>
                )}
                {property.current_value && (
                  <div>
                    <p className="text-sm text-gray-600">Current Value</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${property.current_value.toLocaleString()}
                    </p>
                  </div>
                )}
                {property.monthly_rent && (
                  <div>
                    <p className="text-sm text-gray-600">Monthly Rent</p>
                    <p className="text-xl font-bold text-purple-600">
                      ${property.monthly_rent.toLocaleString()}/mo
                    </p>
                  </div>
                )}
                {property.roi !== null && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">ROI</p>
                        <p className="text-3xl font-bold text-green-600">
                          {property.roi.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {property.profit !== null && (
                  <div>
                    <p className="text-sm text-gray-600">Total Profit</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${property.profit.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Investment Breakdown */}
            {(property.total_invested || property.repair_costs || property.holding_costs) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Investment Breakdown</h2>
                <div className="space-y-3 text-sm">
                  {property.total_invested && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Invested:</span>
                      <span className="font-semibold">${property.total_invested.toLocaleString()}</span>
                    </div>
                  )}
                  {property.repair_costs && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Repair Costs:</span>
                      <span className="font-semibold">${property.repair_costs.toLocaleString()}</span>
                    </div>
                  )}
                  {property.holding_costs && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Holding Costs:</span>
                      <span className="font-semibold">${property.holding_costs.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Add Images</p>
                  <ImageUploader
                    bucket="property-images"
                    folder={`properties/${property.id}`}
                    onUpload={handleImageUpload}
                    maxSizeMB={10}
                  />
                </div>
                {property.listing_url && (
                  <a
                    href={property.listing_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>View Listing</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
