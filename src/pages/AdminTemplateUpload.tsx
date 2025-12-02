import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, FileText, Trash2, Edit2, Eye, Download, FolderUp, X } from 'lucide-react';
import { BackButton } from '../components/ui/BackButton';
import FileUploader from '../components/FileUploader';
import BulkFileUploader from '../components/BulkFileUploader';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface TemplateForm {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  thumbnail_url?: string;
  canva_template_id?: string;
  is_featured: boolean;
  is_active: boolean;
  download_count: number;
  created_at: string;
}

const AdminTemplateUpload: React.FC = () => {
  const [templates, setTemplates] = useState<TemplateForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [bulkUploadCategory, setBulkUploadCategory] = useState('contract');
  const [bulkUploadSubcategory, setBulkUploadSubcategory] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'contract',
    subcategory: '',
    file_url: '',
    file_name: '',
    file_type: '',
    file_size: 0,
    thumbnail_url: '',
    canva_template_id: '',
    is_featured: false,
    is_active: true
  });

  const categories = [
    { value: 'contract', label: 'Contract' },
    { value: 'template', label: 'Template' },
    { value: 'form', label: 'Form' },
    { value: 'canva-template', label: 'Canva Template' }
  ];

  const subcategories: { [key: string]: string[] } = {
    contract: ['Legal', 'Wholesale', 'Options', 'Financing', 'Marketing', 'Education'],
    template: ['Postcard', 'Flyer', 'Business Card', 'Social Media', 'Presentation'],
    form: ['Application', 'Agreement', 'Checklist', 'Worksheet'],
    'canva-template': ['Postcard', 'Flyer', 'Business Card', 'Social Media', 'Presentation']
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('templates_forms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUploaded = (url: string, fileName: string, fileSize: number) => {
    const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
    setFormData(prev => ({
      ...prev,
      file_url: url,
      file_name: fileName,
      file_type: fileExt,
      file_size: fileSize
    }));
  };

  const handleFileRemoved = () => {
    setFormData(prev => ({
      ...prev,
      file_url: '',
      file_name: '',
      file_type: '',
      file_size: 0
    }));
  };

  const handleBulkFilesUploaded = async (files: Array<{ url: string; fileName: string; fileSize: number }>) => {
    try {
      const bulkInserts = files.map(file => {
        const fileExt = file.fileName.split('.').pop()?.toLowerCase() || '';
        return {
          name: file.fileName.replace(/\.[^/.]+$/, ''), // Remove extension
          description: '',
          category: bulkUploadCategory,
          subcategory: bulkUploadSubcategory,
          file_url: file.url,
          file_name: file.fileName,
          file_type: fileExt,
          file_size: file.fileSize,
          is_active: true,
          is_featured: false
        };
      });

      const { error } = await supabase
        .from('templates_forms')
        .insert(bulkInserts);

      if (error) throw error;

      toast.success(`Successfully uploaded ${files.length} templates!`);
      fetchTemplates();
      setShowBulkUpload(false);
    } catch (error: any) {
      console.error('Error saving bulk upload:', error);
      toast.error('Failed to save some uploads');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.file_url) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      if (editingId) {
        // Update existing template
        const { error } = await supabase
          .from('templates_forms')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Template updated successfully!');
      } else {
        // Insert new template
        const { error } = await supabase
          .from('templates_forms')
          .insert([formData]);

        if (error) throw error;
        toast.success('Template uploaded successfully!');
      }

      // Reset form and refresh list
      resetForm();
      fetchTemplates();
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast.error(error.message || 'Failed to save template');
    }
  };

  const handleEdit = (template: TemplateForm) => {
    setEditingId(template.id);
    setFormData({
      name: template.name,
      description: template.description || '',
      category: template.category,
      subcategory: template.subcategory || '',
      file_url: template.file_url,
      file_name: template.file_name,
      file_type: template.file_type,
      file_size: template.file_size,
      thumbnail_url: template.thumbnail_url || '',
      canva_template_id: template.canva_template_id || '',
      is_featured: template.is_featured,
      is_active: template.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string, fileUrl: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      // Delete from database
      const { error } = await supabase
        .from('templates_forms')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Delete file from storage
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/');
      const bucket = 'templates-forms';
      const filePath = pathParts.slice(pathParts.indexOf(bucket) + 1).join('/');

      await supabase.storage
        .from(bucket)
        .remove([filePath]);

      toast.success('Template deleted successfully!');
      fetchTemplates();
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('templates_forms')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Template ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchTemplates();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'contract',
      subcategory: '',
      file_url: '',
      file_name: '',
      file_type: '',
      file_size: 0,
      thumbnail_url: '',
      canva_template_id: '',
      is_featured: false,
      is_active: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <BackButton fallbackPath="/admin" />

        {/* Header */}
        <div className="text-center mb-12 mt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Upload className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Template & Form Manager
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Upload and manage templates, forms, and contracts
          </p>
        </div>

        {/* Upload Buttons */}
        <div className="mb-8 flex justify-center gap-4">
          <button
            onClick={() => { setShowForm(!showForm); setShowBulkUpload(false); }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg"
          >
            <Upload className="w-5 h-5" />
            {showForm ? 'Cancel' : 'Upload Single Template'}
          </button>
          <button
            onClick={() => { setShowBulkUpload(!showBulkUpload); setShowForm(false); }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-lg"
          >
            <FolderUp className="w-5 h-5" />
            {showBulkUpload ? 'Cancel' : 'Bulk Upload'}
          </button>
        </div>

        {/* Bulk Upload Modal */}
        {showBulkUpload && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Bulk Upload Templates
            </h2>

            <div className="space-y-6">
              {/* Category Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={bulkUploadCategory}
                    onChange={(e) => { setBulkUploadCategory(e.target.value); setBulkUploadSubcategory(''); }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory
                  </label>
                  <select
                    value={bulkUploadSubcategory}
                    onChange={(e) => setBulkUploadSubcategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select subcategory</option>
                    {subcategories[bulkUploadCategory]?.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bulk File Uploader */}
              <BulkFileUploader
                onFileUploaded={() => {}}
                onFileRemoved={() => {}}
                onBulkFilesUploaded={handleBulkFilesUploaded}
                bucket="templates-forms"
                folder="uploads"
                maxSizeMB={10}
                label="Upload Multiple Files"
                allowMultiple={true}
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> All uploaded files will be automatically named based on their filenames. 
                  You can edit individual templates after upload to add descriptions and customize settings.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Upload Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingId ? 'Edit Template' : 'Upload New Template'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload */}
              <FileUploader
                currentFile={formData.file_url}
                onFileUploaded={handleFileUploaded}
                onFileRemoved={handleFileRemoved}
                bucket="templates-forms"
                folder="uploads"
                maxSizeMB={10}
                label="Template File *"
              />

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Assignment Agreement Template"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Brief description of the template..."
                />
              </div>

              {/* Category and Subcategory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory
                  </label>
                  <select
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select subcategory</option>
                    {subcategories[formData.category]?.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Canva Template ID (for Canva templates) */}
              {formData.category === 'canva-template' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Canva Template ID
                  </label>
                  <input
                    type="text"
                    value={formData.canva_template_id}
                    onChange={(e) => setFormData({ ...formData, canva_template_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="DAF8nN9QX8o"
                  />
                </div>
              )}

              {/* Checkboxes */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={!formData.file_url || !formData.name}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  {editingId ? 'Update Template' : 'Upload Template'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Templates List */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Uploaded Templates ({templates.length})
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">No templates uploaded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Downloads
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {templates.map((template) => (
                    <tr key={template.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{template.name}</p>
                            {template.is_featured && (
                              <span className="inline-block px-2 py-0.5 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <div>
                          <p className="font-medium">{template.category}</p>
                          {template.subcategory && (
                            <p className="text-xs text-gray-500">{template.subcategory}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 uppercase">
                        {template.file_type}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {formatFileSize(template.file_size)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {template.download_count}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => toggleActive(template.id, template.is_active)}
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            template.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {template.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => window.open(template.file_url, '_blank')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View file"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(template)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(template.id, template.file_url)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTemplateUpload;
