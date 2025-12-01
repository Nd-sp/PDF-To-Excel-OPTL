import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { TrendingUp, TrendingDown, Minus, ArrowRight, Search } from 'lucide-react';
import { comparisonAPI, searchAPI } from '../services/api';

export default function ComparisonPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [circuitHistory, setCircuitHistory] = useState([]);
  const [significantChanges, setSignificantChanges] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSignificantChanges();
  }, []);

  const loadSignificantChanges = async () => {
    try {
      const changes = await comparisonAPI.getSignificantChanges(15); // 15% threshold
      setSignificantChanges(changes || []);
    } catch (error) {
      console.error('Error loading significant changes:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    try {
      setLoading(true);
      const results = await searchAPI.fullTextSearch(searchQuery, 50);
      setSearchResults(results || []);

      if (results.length === 0) {
        toast('No invoices found', { icon: 'ℹ️' });
      }
    } catch (error) {
      console.error('Error searching:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectInvoice = async (invoice) => {
    setSelectedInvoice(invoice);

    try {
      setLoading(true);

      // Load comparison data for this invoice
      const comparison = await comparisonAPI.compareInvoice(invoice.id);

      // The API returns { current, previous, history, changes, trend }
      setComparisonData({
        current_invoice: comparison.current,
        previous_invoice: comparison.previous,
        changes: comparison.changes,
        trend: comparison.trend
      });

      // Use the history from comparison response
      setCircuitHistory(comparison.history || []);
    } catch (error) {
      console.error('Error loading comparison:', error);
      toast.error('Failed to load comparison data');
      setComparisonData(null);
      setCircuitHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  const renderChangeIndicator = (change) => {
    if (!change) return <Minus className="w-5 h-5 text-gray-400" />;

    if (change > 0) {
      return (
        <div className="flex items-center text-red-600">
          <TrendingUp className="w-5 h-5 mr-1" />
          <span className="font-medium">+{change.toFixed(2)}%</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center text-green-600">
          <TrendingDown className="w-5 h-5 mr-1" />
          <span className="font-medium">{change.toFixed(2)}%</span>
        </div>
      );
    }

    return (
      <div className="flex items-center text-gray-600 dark:text-gray-300">
        <Minus className="w-5 h-5 mr-1" />
        <span>No change</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Invoice Comparison</h2>
        <p className="mt-1 text-gray-600 dark:text-gray-300">Compare invoices month-over-month and track price changes</p>
      </div>

      {/* Search Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Search Invoice</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by circuit ID, bill number, or customer name..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                     dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg
                     hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            <Search className="w-5 h-5 mr-2" />
            Search
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg max-h-60 overflow-y-auto">
            {searchResults.map((invoice) => (
              <button
                key={invoice.id}
                onClick={() => handleSelectInvoice(invoice)}
                className={`w-full text-left px-4 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  selectedInvoice?.id === invoice.id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{invoice.bill_number || 'N/A'}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {invoice.circuit_id || 'No Circuit ID'} • {invoice.bill_date || 'No Date'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ₹{invoice.total_amount?.toLocaleString() || '0'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{invoice.customer_name || 'Unknown'}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Empty State */}
      {!selectedInvoice && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Start Comparing Invoices
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Search for an invoice above to compare it with its previous month's invoice for the same circuit.
            </p>
            <div className="text-left bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium mb-2">How it works:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Search by circuit ID, bill number, or customer name</li>
                <li>Select an invoice from the search results</li>
                <li>View month-over-month comparison and change analysis</li>
                <li>See historical trends for the circuit</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Results */}
      {selectedInvoice && comparisonData && (
        <div className="space-y-6">
          {/* Current vs Previous */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Month-over-Month Comparison
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Invoice */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Invoice</p>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {selectedInvoice.bill_number}
                </h4>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Date:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {comparisonData.current_invoice?.bill_date ? new Date(comparisonData.current_invoice.bill_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Amount:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ₹{parseFloat(comparisonData.current_invoice?.total || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Circuit:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{comparisonData.current_invoice?.circuit_id || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Sub Total:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ₹{parseFloat(comparisonData.current_invoice?.sub_total || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Previous Invoice */}
              {comparisonData.previous_invoice ? (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Previous Invoice</p>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {comparisonData.previous_invoice.bill_number}
                  </h4>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Date:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {comparisonData.previous_invoice.bill_date ? new Date(comparisonData.previous_invoice.bill_date).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Amount:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ₹{parseFloat(comparisonData.previous_invoice.total || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Circuit:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{comparisonData.previous_invoice.circuit_id || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Sub Total:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ₹{parseFloat(comparisonData.previous_invoice.sub_total || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  No previous invoice found for comparison
                </div>
              )}
            </div>

            {/* Changes Summary */}
            {comparisonData.previous_invoice && comparisonData.changes && (
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Change Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {comparisonData.changes.total && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Amount Change</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-lg font-bold ${comparisonData.changes.total.increased ? 'text-red-600' : 'text-green-600'}`}>
                          {comparisonData.changes.total.increased ? '+' : ''}{comparisonData.changes.total.percentChange}%
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ₹{comparisonData.changes.total.change}
                        </span>
                      </div>
                    </div>
                  )}

                  {comparisonData.changes.recurring_charges && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Recurring Charges Change</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-lg font-bold ${comparisonData.changes.recurring_charges.increased ? 'text-red-600' : 'text-green-600'}`}>
                          {comparisonData.changes.recurring_charges.increased ? '+' : ''}{comparisonData.changes.recurring_charges.percentChange}%
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ₹{comparisonData.changes.recurring_charges.change}
                        </span>
                      </div>
                    </div>
                  )}

                  {comparisonData.changes.tax_amount && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tax Amount Change</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-lg font-bold ${comparisonData.changes.tax_amount.increased ? 'text-red-600' : 'text-green-600'}`}>
                          {comparisonData.changes.tax_amount.increased ? '+' : ''}{comparisonData.changes.tax_amount.percentChange}%
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ₹{comparisonData.changes.tax_amount.change}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Changes */}
                {Object.keys(comparisonData.changes).length > 3 && (
                  <div className="mt-4">
                    <details className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        View All Changes ({Object.keys(comparisonData.changes).length} fields)
                      </summary>
                      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(comparisonData.changes).map(([field, change]) => (
                          <div key={field} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {field.replace(/_/g, ' ')}:
                            </span>
                            <span className={`text-sm font-semibold ${change.increased ? 'text-red-600' : 'text-green-600'}`}>
                              {change.increased ? '+' : ''}{change.percentChange}%
                              {change.significant && <span className="ml-1 text-xs text-orange-500">⚠</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Circuit History */}
          {circuitHistory.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Circuit History ({selectedInvoice.circuit_id})
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Bill Number
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Total Amount
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Monthly Rental
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Change
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {circuitHistory.map((item, index) => {
                      const previousItem = circuitHistory[index + 1];
                      const change = previousItem ? calculateChange(item.total_amount, previousItem.total_amount) : null;

                      return (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.bill_date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.bill_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                            ₹{item.total_amount?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                            ₹{item.monthly_rental?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            {renderChangeIndicator(change)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Significant Changes */}
      {significantChanges.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Significant Price Changes (&gt;15%)
          </h3>

          <div className="space-y-3">
            {significantChanges.map((change, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{change.circuit_id}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{change.customer_name}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-300">From</p>
                      <p className="font-medium text-gray-900 dark:text-white">₹{change.previous_amount?.toLocaleString()}</p>
                    </div>

                    <ArrowRight className="w-5 h-5 text-gray-400" />

                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-300">To</p>
                      <p className="font-medium text-gray-900 dark:text-white">₹{change.current_amount?.toLocaleString()}</p>
                    </div>

                    <div className="ml-4">
                      {renderChangeIndicator(change.change_percentage)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
