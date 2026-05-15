import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Users, Store, Package, DollarSign } from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalProducts: 0,
    totalRevenue: 0
  });
  const { token } = useSelector(state => state.auth);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

  const cards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
    { title: 'Total Vendors', value: stats.totalVendors, icon: Store, color: 'bg-purple-500' },
    { title: 'Total Products', value: stats.totalProducts, icon: Package, color: 'bg-green-500' },
    { title: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'bg-orange-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
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
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Platform Overview</h2>
        <p className="text-gray-600">Welcome to the admin dashboard. Here you can manage vendors, customers, and monitor platform activity.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;