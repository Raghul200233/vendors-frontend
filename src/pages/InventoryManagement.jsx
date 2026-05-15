import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Search, AlertTriangle, Package, DollarSign, TrendingUp, Download, Edit } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({ quantity: 0, type: 'adjustment', reason: '' });
  
  const { token } = useSelector(state => state.auth);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchInventory();
    fetchStats();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get(`${API_URL}/inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(response.data.data);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/inventory/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const handleUpdateInventory = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/inventory/update`, {
        productId: selectedProduct._id,
        quantity: parseInt(updateData.quantity),
        type: updateData.type,
        reason: updateData.reason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Inventory updated successfully');
      setShowUpdateModal(false);
      fetchInventory();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const exportReport = async () => {
    try {
      const response = await axios.get(`${API_URL}/inventory/export`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Create and download JSON file
      const dataStr = JSON.stringify(response.data.data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `inventory-report-${new Date().toISOString()}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const filteredInventory = inventory.filter(product => {
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filter === 'low' && product.inventory > product.lowStockThreshold) return false;
    if (filter === 'out' && product.inventory > 0) return false;
    return true;
  });

  const statsCards = stats ? [
    { title: 'Total Products', value: stats.totalProducts, icon: Package, color: 'bg-blue-500' },
    { title: 'Total Stock', value: stats.totalStock, icon: Package, color: 'bg-green-500' },
    { title: 'Low Stock Items', value: stats.lowStockProducts, icon: AlertTriangle, color: 'bg-yellow-500' },
    { title: 'Out of Stock', value: stats.outOfStockProducts, icon: AlertTriangle, color: 'bg-red-500' },
    { title: 'Inventory Value', value: `$${stats.totalValue.toFixed(2)}`, icon: DollarSign, color: 'bg-purple-500' },
  ] : [];

  if (loading) {
    return <div className="text-center py-12">Loading inventory...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <button onClick={exportReport} className="btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Products</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInventory.map(product => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={product.images[0]?.url || 'https://via.placeholder.com/40'} 
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{product.sku || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm font-medium">${product.basePrice}</td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${
                      product.inventory === 0 ? 'text-red-600' :
                      product.inventory <= product.lowStockThreshold ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {product.inventory}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {product.inventory === 0 ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Out of Stock</span>
                    ) : product.inventory <= product.lowStockThreshold ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Low Stock</span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">In Stock</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">{product.totalSales || 0}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowUpdateModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredInventory.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No products found
          </div>
        )}
      </div>

      {/* Update Inventory Modal */}
      {showUpdateModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Update Inventory</h2>
            <p className="text-gray-600 mb-4">Product: <strong>{selectedProduct.name}</strong></p>
            <p className="text-gray-600 mb-4">Current Stock: <strong>{selectedProduct.inventory}</strong></p>
            
            <form onSubmit={handleUpdateInventory}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Transaction Type</label>
                  <select
                    value={updateData.type}
                    onChange={(e) => setUpdateData({ ...updateData, type: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  >
                    <option value="adjustment">Stock Adjustment</option>
                    <option value="restock">Restock</option>
                    <option value="purchase">Purchase</option>
                    <option value="return">Customer Return</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    value={updateData.quantity}
                    onChange={(e) => setUpdateData({ ...updateData, quantity: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Enter quantity"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Reason</label>
                  <textarea
                    value={updateData.reason}
                    onChange={(e) => setUpdateData({ ...updateData, reason: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    rows="3"
                    placeholder="Reason for inventory change"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
                  Update Inventory
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
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

export default InventoryManagement;