import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Search, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2,
  User,
  Mail,
  Calendar,
  ShoppingBag,
  DollarSign,
  Ban,
  CheckCircle,
  XCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    totalSpent: 0,
    totalOrders: 0
  });

  const { token } = useSelector(state => state.auth);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchTerm, filterStatus, customers]);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data.data);
      calculateStats(response.data.data);
    } catch (error) {
      toast.error('Failed to load customers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (customerList) => {
    const active = customerList.filter(c => c.isActive === true).length;
    const suspended = customerList.filter(c => c.isActive === false).length;
    const totalSpent = customerList.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const totalOrders = customerList.reduce((sum, c) => sum + (c.totalOrders || 0), 0);
    
    setStats({
      total: customerList.length,
      active,
      suspended,
      totalSpent,
      totalOrders
    });
  };

  const filterCustomers = () => {
    let filtered = [...customers];
    
    if (searchTerm) {
      filtered = filtered.filter(customer => 
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus === 'active') {
      filtered = filtered.filter(c => c.isActive === true);
    } else if (filterStatus === 'suspended') {
      filtered = filtered.filter(c => c.isActive === false);
    }
    
    setFilteredCustomers(filtered);
  };

  const suspendCustomer = async (customerId) => {
    if (window.confirm('Are you sure you want to suspend this customer? They will not be able to make purchases.')) {
      try {
        await axios.put(`${API_URL}/admin/customers/${customerId}/suspend`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Customer suspended');
        fetchCustomers();
      } catch (error) {
        toast.error('Failed to suspend customer');
      }
    }
  };

  const activateCustomer = async (customerId) => {
    try {
      await axios.put(`${API_URL}/admin/customers/${customerId}/activate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Customer activated');
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to activate customer');
    }
  };

  const deleteCustomer = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      try {
        await axios.delete(`${API_URL}/admin/customers/${customerId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Customer deleted');
        fetchCustomers();
      } catch (error) {
        toast.error('Failed to delete customer');
      }
    }
  };

  const updateCustomerInfo = async (customerId, data) => {
    try {
      await axios.put(`${API_URL}/admin/customers/${customerId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Customer information updated');
      fetchCustomers();
      setShowEditModal(false);
    } catch (error) {
      toast.error('Failed to update customer');
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
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
        <h1 className="text-3xl font-bold">Manage Customers</h1>
        <p className="text-gray-600 mt-1">View and manage all customer accounts on the platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Total Customers" value={stats.total} icon={User} color="bg-blue-500" />
        <StatCard title="Active" value={stats.active} icon={CheckCircle} color="bg-green-500" />
        <StatCard title="Suspended" value={stats.suspended} icon={Ban} color="bg-red-500" />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} color="bg-purple-500" />
        <StatCard title="Total Spent" value={`$${stats.totalSpent.toFixed(2)}`} icon={DollarSign} color="bg-orange-500" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
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
            <option value="all">All Customers</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
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
              {filteredCustomers.map((customer) => (
                <tr key={customer._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">ID: {customer._id.slice(-8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail className="w-4 h-4 mr-1" />
                      {customer.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(customer.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {customer.totalOrders || 0}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ${(customer.totalSpent || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    {customer.isActive ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                        Suspended
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
                            setSelectedCustomer(customer);
                            setShowDetailsModal(true);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowEditModal(true);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Info
                        </button>
                        {customer.isActive ? (
                          <button
                            onClick={() => suspendCustomer(customer._id)}
                            className="w-full text-left px-4 py-2 text-sm text-orange-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Ban className="w-4 h-4" />
                            Suspend Customer
                          </button>
                        ) : (
                          <button
                            onClick={() => activateCustomer(customer._id)}
                            className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Activate Customer
                          </button>
                        )}
                        <button
                          onClick={() => deleteCustomer(customer._id)}
                          className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Customer
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCustomers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No customers found
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {showDetailsModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Customer Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="border-b pb-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedCustomer.name}</h3>
                    <p className="text-gray-500">{selectedCustomer.email}</p>
                  </div>
                </div>
              </div>
              
              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{selectedCustomer.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              
              {/* Address */}
              {selectedCustomer.address && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
                  <div className="bg-gray-50 p-3 rounded">
                    <p>{selectedCustomer.address.street}</p>
                    <p>{selectedCustomer.address.city}, {selectedCustomer.address.state} {selectedCustomer.address.zipCode}</p>
                    <p>{selectedCustomer.address.country}</p>
                  </div>
                </div>
              )}
              
              {/* Purchase History */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Purchase History</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded text-center">
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <p className="text-2xl font-bold">{selectedCustomer.totalOrders || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded text-center">
                    <p className="text-sm text-gray-500">Total Spent</p>
                    <p className="text-2xl font-bold">${(selectedCustomer.totalSpent || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded text-center">
                    <p className="text-sm text-gray-500">Average Order</p>
                    <p className="text-2xl font-bold">
                      ${selectedCustomer.totalOrders > 0 
                        ? ((selectedCustomer.totalSpent || 0) / selectedCustomer.totalOrders).toFixed(2)
                        : '0.00'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Recent Orders */}
              {selectedCustomer.recentOrders && selectedCustomer.recentOrders.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Recent Orders</h3>
                  <div className="space-y-2">
                    {selectedCustomer.recentOrders.map((order, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="flex justify-between">
                          <span className="font-medium">Order #{order.orderNumber}</span>
                          <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="flex justify-between mt-2">
                          <span>Total: ${order.total.toFixed(2)}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Metadata */}
              <div className="text-sm text-gray-500 pt-4 border-t">
                <p>Customer since: {formatDate(selectedCustomer.createdAt)}</p>
                <p>Last updated: {formatDate(selectedCustomer.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Edit Customer</h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone')
              };
              updateCustomerInfo(selectedCustomer._id, data);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={selectedCustomer.name}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={selectedCustomer.email}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={selectedCustomer.phone || ''}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
                  Update Customer
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

export default AdminCustomers;