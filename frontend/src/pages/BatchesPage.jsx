import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, Download, Trash2, RefreshCw, Clock, CheckCircle, XCircle, Loader, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { uploadAPI } from '../services/api';
import { format } from 'date-fns';
import ConfirmDialog from '../components/ConfirmDialog';

const BatchesPage = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, limit: 20, offset: 0, hasMore: false });
  const itemsPerPage = 20;
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const loadBatches = useCallback(async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * itemsPerPage;
      const response = await uploadAPI.getBatches({
        limit: itemsPerPage,
        offset,
        search: searchTerm,
        status: statusFilter
      });

      if (response && response.success) {
        setBatches(Array.isArray(response.data) ? response.data : []);
        setPagination(response.pagination || { total: 0, limit: 20, offset: 0, hasMore: false });
      } else if (response && response.data) {
        // Handle case where response doesn't have success flag
        setBatches(Array.isArray(response.data) ? response.data : []);
      } else {
        setBatches([]);
      }
    } catch (error) {
      console.error('Error loading batches:', error);
      toast.error('Failed to load batches');
      setBatches([]);
      setPagination({ total: 0, limit: 20, offset: 0, hasMore: false });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, itemsPerPage]);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBatches();
    setRefreshing(false);
    toast.success('Batches refreshed');
  };

  const handleDelete = (batchId, batchName) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Batch',
      message: `Are you sure you want to delete "${batchName}"? This will delete all associated files and data. This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await uploadAPI.deleteBatch(batchId);
          toast.success('Batch deleted successfully');
          setSelectedBatches(prev => prev.filter(id => id !== batchId));
          loadBatches();
        } catch (error) {
          toast.error('Failed to delete batch');
        }
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedBatches.length === 0) {
      toast.error('No batches selected');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Delete Multiple Batches',
      message: `Are you sure you want to delete ${selectedBatches.length} batch(es)? This will delete all associated files and data. This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await uploadAPI.bulkDeleteBatches(selectedBatches);
          toast.success(`${selectedBatches.length} batch(es) deleted successfully`);
          setSelectedBatches([]);
          loadBatches();
        } catch (error) {
          toast.error('Failed to delete batches');
        }
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedBatches(batches.map(b => b.id));
    } else {
      setSelectedBatches([]);
    }
  };

  const handleSelectBatch = (batchId) => {
    setSelectedBatches(prev => {
      if (prev.includes(batchId)) {
        return prev.filter(id => id !== batchId);
      } else {
        return [...prev, batchId];
      }
    });
  };

  const handleDownload = (batchId) => {
    try {
      uploadAPI.downloadExcel(batchId);
      toast.success('Download started');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: Clock, text: 'Pending', className: 'bg-warning-100 text-warning-800' },
      processing: { icon: Loader, text: 'Processing', className: 'bg-info-100 text-info-800' },
      completed: { icon: CheckCircle, text: 'Completed', className: 'bg-success-100 text-success-800' },
      failed: { icon: XCircle, text: 'Failed', className: 'bg-error-100 text-error-800' },
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.className}`}>
        <Icon className="h-4 w-4 mr-1" />
        {badge.text}
      </span>
    );
  };

  const getProgressPercentage = (batch) => {
    if (!batch || batch.total_files === 0) return 0;
    const total = parseInt(batch.total_files) || 0;
    const processed = parseInt(batch.processed_files) || 0;
    const failed = parseInt(batch.failed_files) || 0;
    return Math.round(((processed + failed) / total) * 100);
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return format(date, 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  const totalPages = Math.ceil((pagination?.total || 0) / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Processing Batches</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            View and manage your PDF processing batches ({pagination?.total || 0} total)
            {selectedBatches.length > 0 && (
              <span className="ml-2 text-blue-600 dark:text-blue-400">
                • {selectedBatches.length} selected
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          {selectedBatches.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg
                       hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-5 w-5 mr-2" />
              Delete Selected ({selectedBatches.length})
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg
                     hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 text-gray-700 dark:text-gray-200"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by batch name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option key="all" value="">All Status</option>
              <option key="pending" value="pending">Pending</option>
              <option key="processing" value="processing">Processing</option>
              <option key="completed" value="completed">Completed</option>
              <option key="failed" value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Batches List */}
      {!batches || batches.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No batches found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Upload PDFs to create your first batch
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg
                     hover:bg-primary-700 transition-colors"
          >
            Upload PDFs
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedBatches.length === batches.length && batches.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Batch Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Files
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {batches.map((batch) => {
                if (!batch || !batch.id) return null;

                return (
                  <tr key={batch.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedBatches.includes(batch.id)}
                        onChange={() => handleSelectBatch(batch.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {batch.batch_name || 'Unnamed Batch'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {batch.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(batch.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        Total: {batch.total_files || 0}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ✓ {batch.processed_files || 0} | ✗ {batch.failed_files || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all"
                            style={{ width: `${getProgressPercentage(batch)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          {getProgressPercentage(batch)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(batch.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/batches/${batch.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        {batch.excel_file_path && (
                          <button
                            onClick={() => handleDownload(batch.id)}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Download Excel"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(batch.id, batch.batch_name)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete Batch"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-4 flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-200">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination?.total || 0)} of {pagination?.total || 0} batches
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="px-4 py-2 text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />
    </div>
  );
};

export default BatchesPage;
