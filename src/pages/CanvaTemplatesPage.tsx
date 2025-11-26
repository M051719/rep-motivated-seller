import React, { useState } from 'react';
import { Palette, Download, Share2, Image as ImageIcon, FileText, Layout } from 'lucide-react';
import { BackButton } from '../components/ui/BackButton';
import { toast } from 'react-hot-toast';

interface CanvaTemplate {
  id: string;
  name: string;
  category: 'postcard' | 'flyer' | 'business-card' | 'social-media' | 'presentation';
  thumbnail: string;
  description: string;
  canvaTemplateId?: string;
}

const CanvaTemplatesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<CanvaTemplate | null>(null);

  const templates: CanvaTemplate[] = [
    {
      id: 'postcard-1',
      name: 'Property Offer Postcard',
      category: 'postcard',
      thumbnail: '📬',
      description: 'Professional postcard design for property offers',
      canvaTemplateId: 'DAF8nN9QX8o',
    },
    {
      id: 'postcard-2',
      name: 'We Buy Houses Postcard',
      category: 'postcard',
      thumbnail: '🏠',
      description: 'Eye-catching postcard for motivated sellers',
      canvaTemplateId: 'DAF8nN9QX8o',
    },
    {
      id: 'flyer-1',
      name: 'Investment Property Flyer',
      category: 'flyer',
      thumbnail: '📄',
      description: 'Detailed property investment flyer',
      canvaTemplateId: 'DAF8nN9QX8o',
    },
    {
      id: 'flyer-2',
      name: 'Foreclosure Help Flyer',
      category: 'flyer',
      thumbnail: '🆘',
      description: 'Informative flyer for homeowners facing foreclosure',
      canvaTemplateId: 'DAF8nN9QX8o',
    },
    {
      id: 'business-card-1',
      name: 'Real Estate Investor Card',
      category: 'business-card',
      thumbnail: '💼',
      description: 'Professional business card design',
      canvaTemplateId: 'DAF8nN9QX8o',
    },
    {
      id: 'social-1',
      name: 'Instagram Property Post',
      category: 'social-media',
      thumbnail: '📱',
      description: 'Social media post template for properties',
      canvaTemplateId: 'DAF8nN9QX8o',
    },
    {
      id: 'social-2',
      name: 'Facebook Success Story',
      category: 'social-media',
      thumbnail: '✨',
      description: 'Share your success stories on Facebook',
      canvaTemplateId: 'DAF8nN9QX8o',
    },
    {
      id: 'presentation-1',
      name: 'Deal Analysis Presentation',
      category: 'presentation',
      thumbnail: '📊',
      description: 'Professional presentation for deal analysis',
      canvaTemplateId: 'DAF8nN9QX8o',
    },
  ];

  const categories = [
    { value: 'all', label: 'All Templates', icon: <Layout className="w-5 h-5" /> },
    { value: 'postcard', label: 'Postcards', icon: <FileText className="w-5 h-5" /> },
    { value: 'flyer', label: 'Flyers', icon: <FileText className="w-5 h-5" /> },
    { value: 'business-card', label: 'Business Cards', icon: <ImageIcon className="w-5 h-5" /> },
    { value: 'social-media', label: 'Social Media', icon: <Share2 className="w-5 h-5" /> },
    { value: 'presentation', label: 'Presentations', icon: <ImageIcon className="w-5 h-5" /> },
  ];

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  const handleEditInCanva = (template: CanvaTemplate) => {
    const canvaApiKey = import.meta.env.VITE_CANVA_API_KEY;
    
    if (!canvaApiKey) {
      toast.error('Canva API key not configured. Please contact support.');
      console.error('VITE_CANVA_API_KEY not found in environment variables');
      return;
    }

    // Open Canva template editor
    // In production, this would use the Canva API to open the template
    const canvaUrl = `https://www.canva.com/design/${template.canvaTemplateId}/edit`;
    window.open(canvaUrl, '_blank');
    toast.success('Opening template in Canva...');
  };

  const handleDownloadTemplate = (template: CanvaTemplate) => {
    toast.success('Download functionality will be implemented with Canva API');
  };

  const handleShareTemplate = (template: CanvaTemplate) => {
    toast.success('Share functionality will be implemented with Canva API');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <BackButton />

        <div className="text-center mb-12 mt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Palette className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Canva Design Templates
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Professional marketing materials powered by Canva
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedCategory === category.value
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
                }`}
              >
                {category.icon}
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Canva Info Banner */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Palette className="w-8 h-8 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Powered by Canva
              </h3>
              <p className="text-gray-700 mb-3">
                All templates are professionally designed and fully customizable in Canva. 
                Edit text, images, colors, and more to match your brand.
              </p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  ✓ Professional Designs
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  ✓ Easy Customization
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  ✓ High-Quality Export
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              {/* Thumbnail */}
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 h-48 flex items-center justify-center text-8xl">
                {template.thumbnail}
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {template.category.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {template.description}
                </p>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleEditInCanva(template)}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Palette className="w-4 h-4" />
                    Edit in Canva
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadTemplate(template)}
                      className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm">Download</span>
                    </button>
                    <button
                      onClick={() => handleShareTemplate(template)}
                      className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No templates found in this category</p>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Need Help Getting Started?
          </h3>
          <div className="space-y-2 text-gray-700">
            <p>• Click "Edit in Canva" to customize any template</p>
            <p>• All templates open in your Canva account</p>
            <p>• Download high-resolution files for print or digital use</p>
            <p>• Share templates with team members for collaboration</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvaTemplatesPage;
