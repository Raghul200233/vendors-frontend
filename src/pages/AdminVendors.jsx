import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Search, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Edit, 
  Trash2,
  Store,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
    totalRevenue: 0
  });

  const { token } = useSelector(state => state.auth);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    filterVendors();
  }, [searchTerm, filterStatus, vendors]);

  const fetchVendors = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/vendors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVendors(response.data.data);
      calculateStats(response.data.data);
    } catch (error) {
      toast.error('Failed to load vendors');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (vendorList) => {
    const active = vendorList.filter(v => v.isActive === true).length;
    const pending = vendorList.filter(v => v.isActive === false).length;
    const suspended = vendorList.filter(v => v.isActive === 'suspended').length;
    const totalRevenue = vendorList.reduce((sum, v) => sum + (v.totalRevenue || 0), 0);
    
    setStats({
      total: vendorList.length,
      active,
      pending,
      suspended,
      totalRevenue
    });
  };

  const filterVendors = () => {
    let filtered = [...vendors];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(vendor => 
        vendor.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (filterStatus === 'active') {
      filtered = filtered.filter(v => v.isActive === true);
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter(v => v.isActive === false);
    } else if (filterStatus === 'suspended') {
      filtered = filtered.filter(v => v.isActive === 'suspended');
    }
    
    setFilteredVendors(filtered);
  };

  const approveVendor = async (vendorId) => {
    try {
      await axios.put(`${API_URL}/admin/vendors/${vendorId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Vendor approved successfully');
      fetchVendors();
    } catch (error) {
      toast.error('Failed to approve vendor');
    }
  };

  const suspendVendor = async (vendorId) => {
    if (window.confirm('Are you sure you want to suspend this vendor?')) {
      try {
        await axios.put(`${API_URL}/admin/vendors/${vendorId}/suspend`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Vendor suspended');
        fetchVendors();
      } catch (error) {
        toast.error('Failed to suspend vendor');
      }
    }
  };

  const deleteVendor = async (vendorId) => {
    if (window.confirm('Are you sure you want to delete this vendor? This action cannot be undone.')) {
      try {
        await axios.delete(`${API_URL}/admin/vendors/${vendorId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Vendor deleted');
        fetchVendors();
      } catch (error) {
        toast.error('Failed to delete vendor');
      }
    }
  };

  const updateVendorCommission = async (vendorId, commission) => {
    try {
      await axios.put(`${API_URL}/admin/vendors/${vendorId}/commission`, 
        { commission },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Commission updated');
      fetchVendors();
      setShowEditModal(false);
    } catch (error) {
      toast.error('Failed to update commission');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-full`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Manage Vendors</h1>
        <p className="text-gray-600 mt-1">View and manage all vendor accounts on the platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Total Vendors" value={stats.total} icon={Store} color="bg-blue-500" />
        <StatCard title="Active" value={stats.active} icon={CheckCircle} color="bg-green-500" />
        <StatCard title="Pending" value={stats.pending} icon={AlertCircle} color="bg-yellow-500" />
        <StatCard title="Suspended" value={stats.suspended} icon={XCircle} color="bg-red-500" />
        <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} icon={DollarSign} color="bg-purple-500" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by store name, owner name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Vendors</option>
            <option value="active">Active</option>
            <option value="pending">Pending Approval</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Store Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVendors.map((vendor) => (
                <tr key={vendor._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {vendor.logo ? (
                          <img src={vendor.logo} alt={vendor.storeName} className="h-10 w-10 rounded-full" />
                        ) : (
                          <Store className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{vendor.storeName}</div>
                        <div className="text-sm text-gray-500">{vendor.storeSlug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{vendor.userId?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{vendor.userId?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    {vendor.contactEmail && (
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <Mail className="w-4 h-4 mr-1" />
                        {vendor.contactEmail}
                      </div>
                    )}
                    {vendor.contactPhone && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="w-4 h-4 mr-1" />
                        {vendor.contactPhone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(vendor.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    {vendor.isActive === true ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : vendor.isActive === 'suspended' ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                        Suspended
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative group">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-10">
                        <button
                          onClick={() => {
                            setSelectedVendor(vendor);
                            setShowDetailsModal(true);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            setSelectedVendor(vendor);
                            setShowEditModal(true);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Commission
                        </button>
                        {!vendor.isActive && (
                          <button
                            onClick={() => approveVendor(vendor._id)}
                            className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve Vendor
                          </button>
                        )}
                        {vendor.isActive === true && (
                          <button
                            onClick={() => suspendVendor(vendor._id)}
                            className="w-full text-left px-4 py-2 text-sm text-orange-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Suspend Vendor
                          </button>
                        )}
                        <button
                          onClick={() => deleteVendor(vendor._id)}
                          className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Vendor
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredVendors.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No vendors found
          </div>
        )}
      </div>

      {/* Vendor Details Modal */}
      {showDetailsModal && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Vendor Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Store Info */}
              <div className="border-b pb-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
                    {selectedVendor.logo ? (
                      <img src={selectedVendor.logo} alt={selectedVendor.storeName} className="h-16 w-16 rounded-full" />
                    ) : (
                      <Store className="w-8 h-8 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedVendor.storeName}</h3>
                    <p className="text-gray-500">{selectedVendor.storeSlug}</p>
                  </div>
                </div>
                <p className="text-gray-700">{selectedVendor.description || 'No description provided'}</p>
              </div>
              
              {/* Owner Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Owner Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{selectedVendor.userId?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedVendor.userId?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                <div className="space-y-2">
                  {selectedVendor.contactEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedVendor.contactEmail}</span>
                    </div>
                  )}
                  {selectedVendor.contactPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedVendor.contactPhone}</span>
                    </div>
                  )}
                  {selectedVendor.address && Object.values(selectedVendor.address).some(v => v) && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        {selectedVendor.address.street && <p>{selectedVendor.address.street}</p>}
                        <p>
                          {selectedVendor.address.city}, {selectedVendor.address.state} {selectedVendor.address.zipCode}
                        </p>
                        <p>{selectedVendor.address.country}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Stats */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Store Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">Total Products</p>
                    <p className="text-2xl font-bold">{selectedVendor.totalProducts || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">Total Sales</p>
                    <p className="text-2xl font-bold">{selectedVendor.totalSales || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">Revenue</p>
                    <p className="text-2xl font-bold">${(selectedVendor.totalRevenue || 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              {/* Commission */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Commission Rate</h3>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-2xl font-bold text-blue-600">{selectedVendor.commission || 10}%</p>
                  <p className="text-sm text-gray-600">Platform commission on each sale</p>
                </div>
              </div>
              
              {/* Metadata */}
              <div className="text-sm text-gray-500 pt-4 border-t">
                <p>Joined: {formatDate(selectedVendor.createdAt)}</p>
                <p>Last Updated: {formatDate(selectedVendor.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Commission Modal */}
      {showEditModal && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Edit Commission Rate</h2>
            <p className="text-gray-600 mb-4">
              Store: <strong>{selectedVendor.storeName}</strong>
            </p>
            <p className="text-gray-600 mb-4">
              Current Commission: <strong>{selectedVendor.commission || 10}%</strong>
            </p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const commission = parseInt(e.target.commission.value);
              updateVendorCommission(selectedVendor._id, commission);
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">New Commission Rate (%)</label>
                <input
                  type="number"
                  name="commission"
                  defaultValue={selectedVendor.commission || 10}
                  min="0"
                  max="100"
                  step="1"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
                  Update Commission
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVendors;