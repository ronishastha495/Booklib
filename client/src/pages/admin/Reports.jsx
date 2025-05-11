import React, { useState, useEffect } from 'react';
import { BarChart2 } from 'lucide-react';
import { toast } from 'sonner';
// import ReportService from '../../services/ReportService';

const Reports = () => {
  const [salesReport, setSalesReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [memberReport, setMemberReport] = useState(null);
  const [period, setPeriod] = useState('Last 30 Days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const salesData = await ReportService.getSalesReport(period);
        const inventoryData = await ReportService.getInventoryReport();
        const memberData = await ReportService.getMemberReport();
        setSalesReport(salesData);
        setInventoryReport(inventoryData);
        setMemberReport(memberData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load reports');
        setLoading(false);
      }
    };
    fetchReports();
  }, [period]);

  if (loading) return <p className="text-center text-stone-500 mt-10">Loading reports...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-stone-800">Reports</h3>
          <select
            className="p-2 rounded border border-stone-300 bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
          </select>
        </div>

        {/* Sales Report */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-stone-800 mb-4">Sales Report</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-stone-50 p-4 rounded-lg">
              <p className="text-stone-500">Total Sales</p>
              <p className="text-2xl font-bold text-stone-800">${salesReport?.totalSales.toLocaleString()}</p>
            </div>
            <div className="bg-stone-50 p-4 rounded-lg">
              <p className="text-stone-500">Orders</p>
              <p className="text-2xl font-bold text-stone-800">{salesReport?.orders}</p>
            </div>
            <div className="bg-stone-50 p-4 rounded-lg">
              <p className="text-stone-500">Average Order Value</p>
              <p className="text-2xl font-bold text-stone-800">${salesReport?.averageOrderValue.toFixed(2)}</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-stone-50 rounded-lg mt-4">
            <BarChart2 className="h-20 w-20 text-stone-300" />
            <p className="ml-4 text-stone-500">Sales chart would appear here</p>
          </div>
        </div>

        {/* Inventory Report */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-stone-800 mb-4">Inventory Report</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-stone-50 p-4 rounded-lg">
              <p className="text-stone-500">Total Books</p>
              <p className="text-2xl font-bold text-stone-800">{inventoryReport?.totalBooks}</p>
            </div>
            <div className="bg-stone-50 p-4 rounded-lg">
              <p className="text-stone-500">Low Stock</p>
              <p className="text-2xl font-bold text-stone-800">{inventoryReport?.lowStock}</p>
            </div>
            <div className="bg-stone-50 p-4 rounded-lg">
              <p className="text-stone-500">Out of Stock</p>
              <p className="text-2xl font-bold text-stone-800">{inventoryReport?.outOfStock}</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-stone-50 rounded-lg mt-4">
            <BarChart2 className="h-20 w-20 text-stone-300" />
            <p className="ml-4 text-stone-500">Inventory chart would appear here</p>
          </div>
        </div>

        {/* Member Report */}
        <div>
          <h4 className="text-md font-semibold text-stone-800 mb-4">Member Report</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-stone-50 p-4 rounded-lg">
              <p className="text-stone-500">Total Members</p>
              <p className="text-2xl font-bold text-stone-800">{memberReport?.totalMembers}</p>
            </div>
            <div className="bg-stone-50 p-4 rounded-lg">
              <p className="text-stone-500">New Members</p>
              <p className="text-2xl font-bold text-stone-800">{memberReport?.newMembers}</p>
            </div>
            <div className="bg-stone-50 p-4 rounded-lg">
              <p className="text-stone-500">Active Members</p>
              <p className="text-2xl font-bold text-stone-800">{memberReport?.activeMembers}</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-stone-50 rounded-lg mt-4">
            <BarChart2 className="h-20 w-20 text-stone-300" />
            <p className="ml-4 text-stone-500">Member activity chart would appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;