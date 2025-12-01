import { useState, useEffect } from "react";
import { searchAPI } from "../services/api";
import { Search, Filter, X, Download, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import InvoiceDetailsModal from "../components/InvoiceDetailsModal";

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    vendor: "",
    vendorType: "",
    circuitId: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
    city: "",
    state: ""
  });

  useEffect(() => {
    fetchFilterOptions();
    fetchRecentInvoices();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const options = await searchAPI.getFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const fetchRecentInvoices = async () => {
    try {
      setLoading(true);
      const recent = await searchAPI.getRecentInvoices(500);
      setResults(recent);
      setTotalResults(recent.length);
    } catch (error) {
      console.error("Error fetching recent invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setCurrentPage(1); // Reset to first page on new search

      if (searchTerm.trim()) {
        // Full-text search - increased limit to show more results
        const searchResults = await searchAPI.fullTextSearch(searchTerm, 500);
        setResults(searchResults);
        setTotalResults(searchResults.length);
      } else {
        // Advanced search with filters
        const searchData = await searchAPI.search(filters, { page: 1, limit: 500 });
        setResults(searchData.data || []);
        setTotalResults(searchData.pagination?.total || searchData.data?.length || 0);
      }
    } catch (error) {
      console.error("Error searching:", error);
      toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      vendor: "",
      vendorType: "",
      circuitId: "",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
      city: "",
      state: ""
    });
    setSearchTerm("");
  };

  const viewInvoiceDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const closeInvoiceModal = () => {
    setShowInvoiceModal(false);
    setSelectedInvoice(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Search Invoices
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Search and filter through all processed invoices
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by invoice number, circuit ID, company name..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Search
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 rounded-lg transition-colors font-medium flex items-center gap-2 ${
                showFilters
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Vendor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vendor
                  </label>
                  <select
                    value={filters.vendor}
                    onChange={(e) =>
                      handleFilterChange("vendor", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option key="all-vendors" value="">
                      All Vendors
                    </option>
                    {filterOptions?.vendors.map((vendor, index) => (
                      <option key={index} value={vendor}>
                        {vendor}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vendor Type/Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category (Vendor Type)
                  </label>
                  <select
                    value={filters.vendorType}
                    onChange={(e) =>
                      handleFilterChange("vendorType", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City
                  </label>
                  <select
                    value={filters.city}
                    onChange={(e) => handleFilterChange("city", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All Cities</option>
                    {filterOptions?.cities.map((city, index) => (
                      <option key={index} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State
                  </label>
                  <select
                    value={filters.state}
                    onChange={(e) =>
                      handleFilterChange("state", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All States</option>
                    {filterOptions?.states.map((state, index) => (
                      <option key={index} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Circuit ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Circuit ID
                  </label>
                  <input
                    type="text"
                    value={filters.circuitId}
                    onChange={(e) =>
                      handleFilterChange("circuitId", e.target.value)
                    }
                    placeholder="Enter circuit ID"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  />
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) =>
                      handleFilterChange("startDate", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) =>
                      handleFilterChange("endDate", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Amount Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Min Amount
                  </label>
                  <input
                    type="number"
                    value={filters.minAmount}
                    onChange={(e) =>
                      handleFilterChange("minAmount", e.target.value)
                    }
                    placeholder="Min ₹"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Amount
                  </label>
                  <input
                    type="number"
                    value={filters.maxAmount}
                    onChange={(e) =>
                      handleFilterChange("maxAmount", e.target.value)
                    }
                    placeholder="Max ₹"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          {/* Results Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Search Results ({totalResults})
              </h2>
              {totalResults >= 500 && (
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  Showing first 500 results. Use filters for more specific search.
                </p>
              )}
            </div>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  Searching...
                </p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                <p>No invoices found</p>
              </div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Invoice No
                    </th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date
                    </th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Company
                    </th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Circuit ID
                    </th>
                    <th className="text-right py-3 px-6 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Amount
                    </th>
                    <th className="text-center py-3 px-6 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {results
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((invoice, index) => (
                    <tr
                      key={invoice.id || index}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="py-4 px-6 text-sm text-gray-900 dark:text-gray-100">
                        {invoice.bill_number || invoice.bill_id || "-"}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900 dark:text-gray-100">
                        {invoice.bill_date
                          ? new Date(invoice.bill_date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900 dark:text-gray-100">
                        {invoice.company_name || invoice.vendor_name || "-"}
                      </td>
                      <td className="py-4 px-6 text-sm font-mono text-xs text-gray-900 dark:text-gray-100">
                        {invoice.circuit_id || invoice.vendor_circuit_id || "-"}
                      </td>
                      <td className="py-4 px-6 text-sm text-right font-medium text-green-600 dark:text-green-400">
                        ₹{parseFloat(invoice.total || invoice.total_amount || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => viewInvoiceDetails(invoice)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                          <span className="text-sm font-medium">View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && results.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalResults)} to {Math.min(currentPage * itemsPerPage, totalResults)} of {totalResults} results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    Page {currentPage} of {Math.ceil(totalResults / itemsPerPage)}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalResults / itemsPerPage), p + 1))}
                    disabled={currentPage >= Math.ceil(totalResults / itemsPerPage)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Details Modal */}
      <InvoiceDetailsModal
        invoice={selectedInvoice}
        isOpen={showInvoiceModal}
        onClose={closeInvoiceModal}
      />
    </div>
  );
}
