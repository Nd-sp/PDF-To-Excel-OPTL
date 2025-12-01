import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, AlertCircle, AlertTriangle, Info, CheckCircle, Filter, Download } from 'lucide-react';
import { validationAPI, uploadAPI } from '../services/api';

export default function ValidationPage() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [validation, setValidation] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filter, setFilter] = useState('all'); // all, error, warning, passed
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadValidationData();
  }, [batchId]);

  const loadValidationData = async () => {
    try {
      setLoading(true);
      const [batchResponse, validationResponse, summaryResponse] = await Promise.all([
        uploadAPI.getBatchDetails(batchId),
        validationAPI.getBatchValidation(batchId),
        validationAPI.getValidationSummary(batchId)
      ]);

      if (batchResponse.success) {
        setBatch(batchResponse.data.batch);
      }

      setValidation(validationResponse || []);
      setSummary(summaryResponse || {});
    } catch (error) {
      console.error('Error loading validation data:', error);
      toast.error('Failed to load validation data');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'warning':
        return 'border-l-4 border-orange-500 bg-orange-50';
      case 'info':
        return 'border-l-4 border-blue-500 bg-blue-50';
      default:
        return 'border-l-4 border-green-500 bg-green-50';
    }
  };

  const getValidationTypeLabel = (type) => {
    const labels = {
      required_field: 'Required Field',
      gst_format: 'GST Format',
      amount_range: 'Amount Range',
      date_format: 'Date Format',
      duplicate: 'Duplicate',
      circuit_id: 'Circuit ID',
      email_format: 'Email Format',
      phone_format: 'Phone Format',
    };
    return labels[type] || type;
  };

  const filteredValidation = filter === 'all'
    ? validation
    : validation.filter(v => v.severity === filter || (filter === 'passed' && v.is_passed));

  const groupedValidation = filteredValidation.reduce((acc, item) => {
    const filename = item.filename || 'Unknown';
    if (!acc[filename]) {
      acc[filename] = [];
    }
    acc[filename].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate(`/batches/${batchId}`)}
            className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Validation Results</h2>
            <p className="mt-1 text-gray-600 dark:text-gray-300">
              {batch ? `Batch: ${batch.batch_name}` : 'Loading...'}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Validations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.total_validations || 0}
                </p>
              </div>
              <Info className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Errors</p>
                <p className="text-2xl font-bold text-red-600">
                  {summary.error_count || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Warnings</p>
                <p className="text-2xl font-bold text-orange-600">
                  {summary.warning_count || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Passed</p>
                <p className="text-2xl font-bold text-green-600">
                  {summary.passed_count || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-4">
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All', count: validation.length },
              { value: 'error', label: 'Errors', count: summary?.error_count || 0 },
              { value: 'warning', label: 'Warnings', count: summary?.warning_count || 0 },
              { value: 'passed', label: 'Passed', count: summary?.passed_count || 0 },
            ].map(({ value, label, count }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Validation Results */}
      <div className="space-y-4">
        {Object.keys(groupedValidation).length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">All Validations Passed!</p>
            <p className="text-gray-600 dark:text-gray-300 dark:text-gray-300">No validation errors or warnings found.</p>
          </div>
        ) : (
          Object.entries(groupedValidation).map(([filename, items]) => (
            <div key={filename} className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <h3 className="font-semibold text-gray-900 dark:text-white">{filename}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {items.length} validation {items.length === 1 ? 'issue' : 'issues'}
                </p>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700 dark:divide-gray-700">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className={`p-4 ${getSeverityColor(item.severity)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getSeverityIcon(item.severity)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-white rounded">
                            {getValidationTypeLabel(item.validation_type)}
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-300">
                            Field: {item.field_name}
                          </span>
                        </div>

                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {item.error_message}
                        </p>

                        {item.expected_value && (
                          <div className="text-xs text-gray-600 mt-2">
                            <span className="font-medium">Expected:</span> {item.expected_value}
                          </div>
                        )}

                        {item.actual_value && (
                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Actual:</span> {item.actual_value}
                          </div>
                        )}

                        {item.suggestion && (
                          <div className="mt-2 p-2 bg-white rounded text-xs text-gray-700 dark:text-gray-200">
                            <span className="font-medium">Suggestion:</span> {item.suggestion}
                          </div>
                        )}
                      </div>

                      {!item.is_passed && (
                        <button
                          onClick={() => navigate(`/batches/${batchId}/corrections`)}
                          className="flex-shrink-0 px-3 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                        >
                          Fix
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action Buttons */}
      {validation.length > 0 && (
        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              // Export validation report
              const csvContent = [
                ['Filename', 'Field', 'Severity', 'Type', 'Message', 'Expected', 'Actual'],
                ...validation.map(v => [
                  v.filename,
                  v.field_name,
                  v.severity,
                  v.validation_type,
                  v.error_message,
                  v.expected_value || '',
                  v.actual_value || ''
                ])
              ].map(row => row.join(',')).join('\n');

              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `validation-report-batch-${batchId}.csv`;
              a.click();

              toast.success('Validation report downloaded');
            }}
            className="flex items-center px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Report
          </button>

          <button
            onClick={() => navigate(`/batches/${batchId}/corrections`)}
            className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go to Corrections
          </button>
        </div>
      )}
    </div>
  );
}
