import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, X, Check, Edit2, AlertCircle, Clock } from 'lucide-react';
import { correctionsAPI, uploadAPI } from '../services/api';

export default function CorrectionPage() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [corrections, setCorrections] = useState({});
  const [editMode, setEditMode] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBatchData();
  }, [batchId]);

  const loadBatchData = async () => {
    try {
      setLoading(true);
      const [batchResponse, correctionsResponse] = await Promise.all([
        uploadAPI.getBatchDetails(batchId),
        correctionsAPI.getBatchCorrections(batchId)
      ]);

      if (batchResponse.success) {
        setBatch(batchResponse.data.batch);

        // Get invoice data for this batch
        const invoiceData = batchResponse.data.pdfRecords
          .filter(pdf => pdf.status === 'completed')
          .map(pdf => ({
            id: pdf.id,
            filename: pdf.filename,
            ...pdf.extractedData
          }));

        setInvoices(invoiceData);

        // Set first invoice as selected
        if (invoiceData.length > 0) {
          setSelectedInvoice(invoiceData[0]);
        }
      }

      // Load existing corrections
      if (correctionsResponse && correctionsResponse.length > 0) {
        const correctionMap = {};
        correctionsResponse.forEach(corr => {
          if (!correctionMap[corr.pdf_record_id]) {
            correctionMap[corr.pdf_record_id] = {};
          }
          correctionMap[corr.pdf_record_id][corr.field_name] = corr.corrected_value;
        });
        setCorrections(correctionMap);
      }

    } catch (error) {
      console.error('Error loading batch data:', error);
      toast.error('Failed to load batch data');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldEdit = (fieldName) => {
    setEditMode({ ...editMode, [fieldName]: true });
  };

  const handleFieldChange = (fieldName, value) => {
    if (!selectedInvoice) return;

    const invoiceCorrections = corrections[selectedInvoice.id] || {};
    setCorrections({
      ...corrections,
      [selectedInvoice.id]: {
        ...invoiceCorrections,
        [fieldName]: value
      }
    });
  };

  const handleFieldSave = async (fieldName) => {
    if (!selectedInvoice) return;

    try {
      const correctionValue = corrections[selectedInvoice.id]?.[fieldName];

      await correctionsAPI.saveCorrection({
        pdf_record_id: selectedInvoice.id,
        batch_id: batchId,
        field_name: fieldName,
        original_value: selectedInvoice[fieldName],
        corrected_value: correctionValue,
        correction_type: 'manual',
        confidence_score: 100
      });

      setEditMode({ ...editMode, [fieldName]: false });
      toast.success(`${fieldName} saved`);
    } catch (error) {
      console.error('Error saving correction:', error);
      toast.error('Failed to save correction');
    }
  };

  const handleApplyAllCorrections = async () => {
    if (!selectedInvoice || !corrections[selectedInvoice.id]) {
      toast.error('No corrections to apply');
      return;
    }

    try {
      setSaving(true);
      await correctionsAPI.applyCorrections(
        selectedInvoice.id,
        corrections[selectedInvoice.id]
      );

      toast.success('All corrections applied successfully');
      loadBatchData(); // Reload to get updated data
    } catch (error) {
      console.error('Error applying corrections:', error);
      toast.error('Failed to apply corrections');
    } finally {
      setSaving(false);
    }
  };

  const getFieldValue = (fieldName) => {
    if (!selectedInvoice) return '';

    // Check if there's a correction
    const correctionValue = corrections[selectedInvoice.id]?.[fieldName];
    return correctionValue !== undefined ? correctionValue : selectedInvoice[fieldName] || '';
  };

  const hasCorrection = (fieldName) => {
    return corrections[selectedInvoice?.id]?.[fieldName] !== undefined;
  };

  // Define editable fields
  const editableFields = [
    { name: 'bill_number', label: 'Bill Number', type: 'text' },
    { name: 'bill_date', label: 'Bill Date', type: 'date' },
    { name: 'bill_period_from', label: 'Bill Period From', type: 'date' },
    { name: 'bill_period_to', label: 'Bill Period To', type: 'date' },
    { name: 'due_date', label: 'Due Date', type: 'date' },
    { name: 'total_amount', label: 'Total Amount', type: 'number' },
    { name: 'cgst', label: 'CGST', type: 'number' },
    { name: 'sgst', label: 'SGST', type: 'number' },
    { name: 'igst', label: 'IGST', type: 'number' },
    { name: 'gstin', label: 'GSTIN', type: 'text' },
    { name: 'customer_name', label: 'Customer Name', type: 'text' },
    { name: 'circuit_id', label: 'Circuit ID', type: 'text' },
    { name: 'bandwidth', label: 'Bandwidth', type: 'text' },
    { name: 'monthly_rental', label: 'Monthly Rental', type: 'number' },
    { name: 'installation_charges', label: 'Installation Charges', type: 'number' },
    { name: 'customer_id', label: 'Customer ID', type: 'text' },
    { name: 'relationship_number', label: 'Relationship Number', type: 'text' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!batch || invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 mb-4">No invoices available for correction</p>
        <button
          onClick={() => navigate(`/batches/${batchId}`)}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Back to Batch Details
        </button>
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
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Manual Data Correction</h2>
            <p className="mt-1 text-gray-600 dark:text-gray-300">Batch: {batch.batch_name}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleApplyAllCorrections}
            disabled={saving || !corrections[selectedInvoice?.id]}
            className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Clock className="h-5 w-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-5 w-5 mr-2" />
                Apply All Corrections
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">Total Invoices</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{invoices.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">Current Invoice</p>
          <p className="text-2xl font-bold text-primary-600">
            {selectedInvoice ? invoices.findIndex(inv => inv.id === selectedInvoice.id) + 1 : 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">Corrections Made</p>
          <p className="text-2xl font-bold text-orange-600">
            {Object.keys(corrections[selectedInvoice?.id] || {}).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">Total Corrections</p>
          <p className="text-2xl font-bold text-green-600">
            {Object.values(corrections).reduce((sum, inv) => sum + Object.keys(inv).length, 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Invoice List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <h3 className="font-semibold text-gray-900 dark:text-white">Invoices</h3>
            </div>
            <div className="overflow-y-auto max-h-[600px]">
              {invoices.map((invoice, index) => {
                const hasChanges = corrections[invoice.id] && Object.keys(corrections[invoice.id]).length > 0;
                return (
                  <button
                    key={invoice.id}
                    onClick={() => setSelectedInvoice(invoice)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      selectedInvoice?.id === invoice.id ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Invoice #{index + 1}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {invoice.filename}
                        </p>
                      </div>
                      {hasChanges && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {Object.keys(corrections[invoice.id]).length}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Correction Form */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Edit Invoice Data
                {selectedInvoice && (
                  <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-300">
                    ({selectedInvoice.filename})
                  </span>
                )}
              </h3>
            </div>

            <div className="p-6 overflow-y-auto max-h-[600px]">
              {selectedInvoice ? (
                <div className="space-y-4">
                  {editableFields.map(field => (
                    <div key={field.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary-300 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          {field.label}
                          {hasCorrection(field.name) && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                              Modified
                            </span>
                          )}
                        </label>
                        {!editMode[field.name] ? (
                          <button
                            onClick={() => handleFieldEdit(field.name)}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleFieldSave(field.name)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditMode({ ...editMode, [field.name]: false });
                                // Revert changes
                                if (corrections[selectedInvoice.id]) {
                                  const newCorrections = { ...corrections };
                                  delete newCorrections[selectedInvoice.id][field.name];
                                  setCorrections(newCorrections);
                                }
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {editMode[field.name] ? (
                        <input
                          type={field.type}
                          value={getFieldValue(field.name)}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          className="w-full px-3 py-2 border border-primary-300 rounded-md
                                   focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                                   dark:bg-gray-700 dark:text-white dark:border-gray-600"
                          autoFocus
                        />
                      ) : (
                        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white">
                          {getFieldValue(field.name) || <span className="text-gray-400 dark:text-gray-500">No data</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  Select an invoice to edit
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
