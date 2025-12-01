// import { useState, useEffect } from 'react';
// import { analyticsAPI } from '../services/api';
// import { TrendingUp, TrendingDown, DollarSign, FileText, AlertCircle, Calendar } from 'lucide-react';

// export default function AnalyticsDashboardPage() {
//   const [loading, setLoading] = useState(true);
//   const [dashboardData, setDashboardData] = useState(null);
//   const [trends, setTrends] = useState([]);
//   const [topSpending, setTopSpending] = useState([]);
//   const [paymentDue, setPaymentDue] = useState([]);
//   const [vendorComparison, setVendorComparison] = useState([]);

//   useEffect(() => {
//     fetchAllData();
//   }, []);

//   const fetchAllData = async () => {
//     try {
//       setLoading(true);
//       const [dashboard, trendsData, topSpend, payments, vendors] = await Promise.all([
//         analyticsAPI.getDashboard(),
//         analyticsAPI.getMonthlyTrends(12),
//         analyticsAPI.getTopSpending(10),
//         analyticsAPI.getPaymentDue(7),
//         analyticsAPI.getVendorComparison(),
//       ]);

//       setDashboardData(dashboard);
//       setTrends(trendsData);
//       setTopSpending(topSpend);
//       setPaymentDue(payments);
//       setVendorComparison(vendors);
//     } catch (error) {
//       console.error('Error fetching analytics:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600 dark:text-gray-300">Loading analytics...</p>
//         </div>
//       </div>
//     );
//   }

//   const summary = dashboardData?.summary || {};

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//             Analytics Dashboard
//           </h1>
//           <p className="text-gray-600 dark:text-gray-300 mt-2">Comprehensive invoice analytics and insights</p>
//         </div>

//         {/* Summary Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <StatCard
//             icon={<FileText className="w-6 h-6" />}
//             title="Total Invoices"
//             value={summary.total_invoices || 0}
//             color="blue"
//           />
//           <StatCard
//             icon={<DollarSign className="w-6 h-6" />}
//             title="Total Amount"
//             value={`₹${(summary.total_amount || 0).toLocaleString()}`}
//             color="green"
//           />
//           <StatCard
//             icon={<TrendingUp className="w-6 h-6" />}
//             title="Avg Invoice"
//             value={`₹${(summary.avg_invoice_amount || 0).toLocaleString()}`}
//             color="purple"
//           />
//           <StatCard
//             icon={<AlertCircle className="text-amber-600 w-6 h-6" />}
//             title="Unique Circuits"
//             value={summary.unique_circuits || 0}
//             color="orange"
//           />
//         </div>

//         {/* Monthly Trends */}
//         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 mb-8">
//           <h2 className="text-xl font-bold mb-4">Monthly Trends (Last 12 Months)</h2>
//           <div className="overflow-x-auto">
//             <table className="min-w-full">
//               <thead>
//                 <tr className="border-b">
//                   <th className="text-left py-2 px-4">Month</th>
//                   <th className="text-right py-2 px-4">Invoices</th>
//                   <th className="text-right py-2 px-4">Total Amount</th>
//                   <th className="text-right py-2 px-4">Active Circuits</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {trends.map((trend, index) => (
//                   <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900">
//                     <td className="py-3 px-4">{trend.month}</td>
//                     <td className="text-right py-3 px-4">{trend.invoice_count}</td>
//                     <td className="text-right py-3 px-4">₹{parseFloat(trend.total_amount || 0).toLocaleString()}</td>
//                     <td className="text-right py-3 px-4">{trend.active_circuits}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Two Column Layout */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Top Spending Circuits */}
//           <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
//             <h2 className="text-xl font-bold mb-4">Top Spending Circuits</h2>
//             <div className="space-y-3">
//               {topSpending.map((circuit, index) => (
//                 <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
//                   <div className="flex-1">
//                     <p className="font-medium text-sm">{circuit.circuit_id}</p>
//                     <p className="text-xs text-gray-600 dark:text-gray-300">{circuit.company_name}</p>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">{circuit.city}, {circuit.state}</p>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-bold text-green-600">₹{parseFloat(circuit.total_spent || 0).toLocaleString()}</p>
//                     <p className="text-xs text-gray-600 dark:text-gray-300">{circuit.invoice_count} invoices</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Payment Due */}
//           <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
//             <h2 className="text-xl font-bold mb-4 flex items-center">
//               <Calendar className="w-5 h-5 mr-2 text-orange-500" />
//               Payment Due (Next 7 Days)
//             </h2>
//             <div className="space-y-3">
//               {paymentDue.length === 0 ? (
//                 <p className="text-gray-500 dark:text-gray-400 text-center py-4">No payments due in the next 7 days</p>
//               ) : (
//                 paymentDue.map((payment, index) => (
//                   <div key={index} className="p-3 border border-orange-200 bg-orange-50 rounded-lg">
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <p className="font-medium text-sm">{payment.bill_number}</p>
//                         <p className="text-xs text-gray-600 dark:text-gray-300">{payment.company_name}</p>
//                         <p className="text-xs text-gray-500 dark:text-gray-400">{payment.circuit_id}</p>
//                       </div>
//                       <div className="text-right">
//                         <p className="font-bold text-orange-600">₹{parseFloat(payment.total || 0).toLocaleString()}</p>
//                         <p className="text-xs text-orange-700 font-medium">
//                           {payment.days_until_due} days left
//                         </p>
//                       </div>
//                     </div>
//                     <p className="text-xs text-gray-500 mt-2">Due: {new Date(payment.due_date).toLocaleDateString()}</p>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Vendor Comparison */}
//         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 mt-8">
//           <h2 className="text-xl font-bold mb-4">Vendor Comparison</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {vendorComparison.map((vendor, index) => (
//               <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md dark:shadow-gray-900/50 transition-shadow">
//                 <h3 className="font-bold text-lg mb-2">{vendor.vendor_name}</h3>
//                 <div className="space-y-2 text-sm">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600 dark:text-gray-300 dark:text-gray-300">Circuits:</span>
//                     <span className="font-medium">{vendor.circuit_count}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600 dark:text-gray-300 dark:text-gray-300">Invoices:</span>
//                     <span className="font-medium">{vendor.invoice_count}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600 dark:text-gray-300 dark:text-gray-300">Total Amount:</span>
//                     <span className="font-medium text-green-600">
//                       ₹{parseFloat(vendor.total_amount || 0).toLocaleString()}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600 dark:text-gray-300 dark:text-gray-300">Avg Invoice:</span>
//                     <span className="font-medium">
//                       ₹{parseFloat(vendor.avg_invoice_amount || 0).toLocaleString()}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Stat Card Component
// function StatCard({ icon, title, value, color }) {
//   const colorClasses = {
//     blue: 'bg-blue-100 text-blue-600',
//     green: 'bg-green-100 text-green-600',
//     purple: 'bg-purple-100 text-purple-600',
//     orange: 'bg-orange-100 text-orange-600',
//   };

//   return (
//     <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-gray-600 dark:text-gray-300 text-sm">{title}</p>
//           <p className="text-2xl font-bold mt-2">{value}</p>
//         </div>
//         <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
//           {icon}
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { analyticsAPI } from "../services/api";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  AlertCircle,
  Calendar
} from "lucide-react";

export default function AnalyticsDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [trends, setTrends] = useState([]);
  const [topSpending, setTopSpending] = useState([]);
  const [paymentDue, setPaymentDue] = useState([]);
  const [vendorComparison, setVendorComparison] = useState([]);
  const [vendorType, setVendorType] = useState("");

  useEffect(() => {
    fetchAllData();
  }, [vendorType]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [dashboard, trendsData, topSpend, payments, vendors] =
        await Promise.all([
          analyticsAPI.getDashboard(vendorType),
          analyticsAPI.getMonthlyTrends(12, vendorType),
          analyticsAPI.getTopSpending(10, vendorType),
          analyticsAPI.getPaymentDue(7, vendorType),
          analyticsAPI.getVendorComparison(vendorType)
        ]);

      setDashboardData(dashboard);
      setTrends(trendsData);
      setTopSpending(topSpend);
      setPaymentDue(payments);
      setVendorComparison(vendors);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  const summary = dashboardData?.summary || {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Comprehensive invoice analytics and insights
          </p>
        </div>

        {/* Category Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Category (Vendor Type):
            </label>
            <select
              value={vendorType}
              onChange={(e) => setVendorType(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white min-w-[200px]"
            >
              <option value="">All Categories</option>
              <option value="vodafone">Vodafone Idea</option>
              <option value="tata">Tata Teleservices</option>
              <option value="airtel">Bharti Airtel Limited</option>
              <option value="indus">Indus Towers Limited</option>
              <option value="ascend">Ascend Telecom Infrastructure</option>
              <option value="sify">Sify Technologies Limited</option>
              <option value="bsnl">BSNL (Bharat Sanchar Nigam)</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<FileText className="w-6 h-6" />}
            title="Total Invoices"
            value={summary.total_invoices || 0}
            color="blue"
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6" />}
            title="Total Amount"
            value={`₹${(summary.total_amount || 0).toLocaleString()}`}
            color="green"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Avg Invoice"
            value={`₹${(summary.avg_invoice_amount || 0).toLocaleString()}`}
            color="purple"
          />
          <StatCard
            icon={<AlertCircle className="w-6 h-6" />}
            title="Unique Circuits"
            value={summary.unique_circuits || 0}
            color="orange"
          />
        </div>

        {/* Monthly Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Monthly Trends (Last 12 Months)
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-4 text-gray-700 dark:text-gray-300">
                    Month
                  </th>
                  <th className="text-right py-2 px-4 text-gray-700 dark:text-gray-300">
                    Invoices
                  </th>
                  <th className="text-right py-2 px-4 text-gray-700 dark:text-gray-300">
                    Total Amount
                  </th>
                  <th className="text-right py-2 px-4 text-gray-700 dark:text-gray-300">
                    Active Circuits
                  </th>
                </tr>
              </thead>
              <tbody>
                {trends.map((trend, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                      {trend.month}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-900 dark:text-gray-100">
                      {trend.invoice_count}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-900 dark:text-gray-100">
                      ₹{parseFloat(trend.total_amount || 0).toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-900 dark:text-gray-100">
                      {trend.active_circuits}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Spending Circuits */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Top Spending Circuits
            </h2>
            <div className="space-y-3">
              {topSpending.map((circuit, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {circuit.circuit_id}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {circuit.company_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {circuit.city}, {circuit.state}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 dark:text-green-400">
                      ₹{parseFloat(circuit.total_spent || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {circuit.invoice_count} invoices
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Due */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
              <Calendar className="w-5 h-5 mr-2 text-orange-500" />
              Payment Due (Next 7 Days)
            </h2>
            <div className="space-y-3">
              {paymentDue.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No payments due in the next 7 days
                </p>
              ) : (
                paymentDue.map((payment, index) => (
                  <div
                    key={index}
                    className="p-3 border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          {payment.bill_number}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {payment.company_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {payment.circuit_id}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-600 dark:text-orange-400">
                          ₹{parseFloat(payment.total || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-orange-700 dark:text-orange-300 font-medium">
                          {payment.days_until_due} days left
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Due: {new Date(payment.due_date).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Vendor Comparison */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Vendor Comparison
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendorComparison.map((vendor, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
              >
                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
                  {vendor.vendor_name}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Circuits:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {vendor.circuit_count}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Invoices:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {vendor.invoice_count}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Total Amount:
                    </span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      ₹{parseFloat(vendor.total_amount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Avg Invoice:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      ₹
                      {parseFloat(
                        vendor.avg_invoice_amount || 0
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, title, value, color }) {
  const colorClasses = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    green:
      "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    purple:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    orange:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
}
