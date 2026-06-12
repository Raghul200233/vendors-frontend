import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Store, MapPin, Phone, Mail, Facebook, Instagram, Twitter, 
  Clock, Upload, X, Plus, Trash2, Star, Globe, 
  AlertCircle, CheckCircle, Edit2, Save, Map, Camera, IndianRupee
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const VendorProfile = () => {
  const { token } = useSelector(state => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    storeName: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      landmark: ''
    },
    location: {
      googleMapLink: '',
      latitude: null,
      longitude: null
    },
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      whatsapp: ''
    },
    businessHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true }
    }
  });

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/vendor/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Profile data:', response.data.data);
      setProfile(response.data.data);
      setFormData(response.data.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  const handleSocialChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    }));
  };

  const handleBusinessHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: { ...prev.businessHours[day], [field]: value }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${API_URL}/vendor/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data.data);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update profile');
    }
  };

  // Upload logo
  const handleLogoUpload = async (file) => {
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await axios.post(`${API_URL}/vendor/upload-logo`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Logo upload response:', response.data);
      
      // Update profile with new logo URL
      setProfile(prev => ({ 
        ...prev, 
        logo: response.data.data 
      }));
      
      toast.success('Logo uploaded successfully');
      
      // Refresh profile to get latest data
      await fetchProfile();
      
    } catch (error) {
      console.error('Logo upload error:', error);
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Upload banner
  const handleBannerUpload = async (file) => {
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await axios.post(`${API_URL}/vendor/upload-banner`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Banner upload response:', response.data);
      
      // Update profile with new banner URL
      setProfile(prev => ({ 
        ...prev, 
        banner: response.data.data 
      }));
      
      toast.success('Banner uploaded successfully');
      
      // Refresh profile to get latest data
      await fetchProfile();
      
    } catch (error) {
      console.error('Banner upload error:', error);
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Upload shop images
  const handleShopImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });
    
    try {
      const response = await axios.post(`${API_URL}/vendor/upload-shop-images`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setProfile(prev => ({ ...prev, shopImages: response.data.data }));
      toast.success('Shop images uploaded successfully');
      await fetchProfile();
    } catch (error) {
      console.error('Shop images upload error:', error);
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const deleteShopImage = async (imageId) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        const response = await axios.delete(`${API_URL}/vendor/shop-images/${imageId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(prev => ({ ...prev, shopImages: response.data.data }));
        toast.success('Image deleted');
        await fetchProfile();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Delete failed');
      }
    }
  };

  const extractGoogleMapEmbed = (link) => {
    if (!link) return null;
    return link;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Shop Profile</h1>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 text-sm sm:text-base"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Banner Section */}
      <div className="relative h-40 sm:h-48 md:h-64 rounded-xl overflow-hidden mb-16 bg-gradient-to-r from-blue-600 to-purple-600">
        {profile?.banner ? (
          <img 
            src={profile.banner} 
            alt="Banner" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.style.background = 'linear-gradient(to right, #3b82f6, #9333ea)';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Store className="w-16 h-16 sm:w-20 sm:h-20 text-white opacity-30" />
          </div>
        )}
        {editing && (
          <label className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg cursor-pointer hover:bg-opacity-70 text-xs sm:text-sm">
            <Upload className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
            Change Banner
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleBannerUpload(e.target.files[0])}
              disabled={uploading}
            />
          </label>
        )}
        
        {/* Logo Section */}
        <div className="absolute -bottom-8 left-4 sm:-bottom-12 sm:left-8">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white rounded-full shadow-lg flex items-center justify-center overflow-hidden border-4 border-white">
              {profile?.logo && profile.logo !== '' ? (
                <img 
                  src={profile.logo} 
                  alt={profile.storeName} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<svg class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>';
                  }}
                />
              ) : (
                <Store className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-blue-600" />
              )}
            </div>
            {editing && (
              <label className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700">
                <Upload className="w-3 h-3" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleLogoUpload(e.target.files[0])}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {uploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Uploading...</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
              <Store className="w-5 h-5" />
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Store Name</label>
                {editing ? (
                  <input
                    type="text"
                    name="storeName"
                    value={formData.storeName || ''}
                    onChange={handleInputChange}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profile?.storeName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Email</label>
                {editing ? (
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail || ''}
                    onChange={handleInputChange}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile?.contactEmail || 'Not set'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Phone</label>
                {editing ? (
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone || ''}
                    onChange={handleInputChange}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile?.contactPhone || 'Not set'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Store Description</label>
                {editing ? (
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-600">{profile?.description || 'No description provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Address Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Street Address</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.address?.street || ''}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{profile?.address?.street || 'Not set'}</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.address?.city || ''}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.address?.city || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.address?.state || ''}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.address?.state || 'Not set'}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.address?.country || ''}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.address?.country || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ZIP Code</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.address?.zipCode || ''}
                      onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.address?.zipCode || 'Not set'}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Landmark (Optional)</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.address?.landmark || ''}
                    onChange={(e) => handleAddressChange('landmark', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Near any famous landmark"
                  />
                ) : (
                  <p className="text-gray-600">{profile?.address?.landmark || 'Not set'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Shop Images Gallery */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Shop Images
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
              {profile?.shopImages?.map((img) => (
                <div key={img._id} className="relative group">
                  <img 
                    src={img.url} 
                    alt="Shop" 
                    className="w-full h-24 sm:h-28 md:h-32 object-cover rounded-lg"
                  />
                  {editing && (
                    <button
                      type="button"
                      onClick={() => deleteShopImage(img._id)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                  {img.isPrimary && (
                    <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                </div>
              ))}
              {editing && (
                <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center h-24 sm:h-28 md:h-32 cursor-pointer hover:border-blue-500">
                  <Plus className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">Add Images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleShopImageUpload(e.target.files)}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Social Media Links */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Social Media Links
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                  <Facebook className="w-4 h-4 text-blue-600" />
                  Facebook
                </label>
                {editing ? (
                  <input
                    type="url"
                    value={formData.socialLinks?.facebook || ''}
                    onChange={(e) => handleSocialChange('facebook', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://facebook.com/yourpage"
                  />
                ) : (
                  profile?.socialLinks?.facebook ? (
                    <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                      {profile.socialLinks.facebook}
                    </a>
                  ) : <p className="text-gray-500">Not added</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-600" />
                  Instagram
                </label>
                {editing ? (
                  <input
                    type="url"
                    value={formData.socialLinks?.instagram || ''}
                    onChange={(e) => handleSocialChange('instagram', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://instagram.com/yourpage"
                  />
                ) : (
                  profile?.socialLinks?.instagram ? (
                    <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                      {profile.socialLinks.instagram}
                    </a>
                  ) : <p className="text-gray-500">Not added</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {editing && (
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormData(profile);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default VendorProfile;