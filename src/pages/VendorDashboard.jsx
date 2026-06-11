import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Package, DollarSign, ShoppingBag, TrendingUp, PlusCircle, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const VendorDashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    averageOrderValue: 0,
    lowStockProducts: 0,
    recentOrders: [],
    salesData: []
  });
  const [loading, setLoading] = useState(true);
  const { token, user } = useSelector(state => state.auth);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/vendor/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { title: 'Total Revenue', value: `$${stats.totalSales.toFixed(2)}`, icon: DollarSign, color: 'bg-green-500' },
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-blue-500' },
    { title: 'Products', value: stats.totalProducts, icon: Package, color: 'bg-purple-500' },
    { title: 'Avg Order Value', value: `$${stats.averageOrderValue.toFixed(2)}`, icon: TrendingUp, color: 'bg-orange-500' },
  ];

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
        <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.name}! Here's your store performance.</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{card.title}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-full`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Add New Product</h3>
          <p className="mb-4">Expand your inventory by adding new products to your store.</p>
          <Link to="/vendor/products" className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-gray-100">
            <PlusCircle className="w-4 h-4" />
            Add Product
          </Link>
        </div>
        
        {stats.lowStockProducts > 0 && (
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg shadow p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Low Stock Alert</h3>
            <p className="mb-4">You have {stats.lowStockProducts} products with low inventory.</p>
            <Link to="/vendor/products" className="inline-flex items-center gap-2 bg-white text-orange-600 px-4 py-2 rounded-md hover:bg-gray-100">
              <AlertCircle className="w-4 h-4" />
              Review Inventory
            </Link>
          </div>
        )}
      </div>
      
      {/* Sales Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Sales Overview (Last 7 Days)</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={stats.salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} name="Revenue ($)" />
            <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} name="Orders" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold p-6 border-b">Recent Orders</h2>
        {stats.recentOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No orders yet. Start promoting your products!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.user?.name || 'Customer'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;