import React from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InvoiceDetailsModal = ({ invoice, isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen || !invoice) return null;

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-';
    return `₹${parseFloat(amount).toLocaleString()}`;
  };

  const sections = [
    {
      title: 'Invoice Information',
      fields: [
        { label: 'Bill Number', value: invoice.bill_number },
        { label: 'Bill Date', value: formatDate(invoice.bill_date) },
        { label: 'Due Date', value: formatDate(invoice.due_date) },
        { label: 'Bill ID', value: invoice.bill_id },
        { label: 'Purchase Order', value: invoice.purchase_order },
      ]
    },
    {
      title: 'Vendor Information',
      fields: [
        { label: 'Vendor Name', value: invoice.vendor_name },
        { label: 'Vendor Circuit ID', value: invoice.vendor_circuit_id },
        { label: 'Payment Terms', value: invoice.payment_terms_label },
      ]
    },
    {
      title: 'Company Information',
      fields: [
        { label: 'Company Name', value: invoice.company_name },
        { label: 'Contact Person', value: invoice.contact_person },
        { label: 'Contact Number', value: invoice.contact_number },
        { label: 'City', value: invoice.city },
        { label: 'State', value: invoice.state },
        { label: 'PIN', value: invoice.pin },
      ]
    },
    {
      title: 'Circuit Information',
      fields: [
        { label: 'Circuit ID', value: invoice.circuit_id },
        { label: 'Relationship Number', value: invoice.relationship_number },
        { label: 'Control Number', value: invoice.control_number },
        { label: 'Port Bandwidth', value: invoice.port_bandwidth },
        { label: 'CIR Bandwidth', value: invoice.cir_bandwidth },
        { label: 'Bandwidth (Mbps)', value: invoice.bandwidth_mbps },
      ]
    },
    {
      title: 'Financial Details',
      fields: [
        { label: 'Sub Total', value: formatCurrency(invoice.sub_total) },
        { label: 'Tax Amount', value: formatCurrency(invoice.tax_amount) },
        { label: 'CGST', value: formatCurrency(invoice.cgst) },
        { label: 'SGST', value: formatCurrency(invoice.sgst) },
        { label: 'IGST', value: formatCurrency(invoice.igst) },
        { label: 'Total', value: formatCurrency(invoice.total), highlight: true },
      ]
    },
    {
      title: 'Tax Details',
      fields: [
        { label: 'CGST Rate', value: invoice.cgst_rate ? `${(invoice.cgst_rate * 100).toFixed(2)}%` : '-' },
        { label: 'SGST Rate', value: invoice.sgst_rate ? `${(invoice.sgst_rate * 100).toFixed(2)}%` : '-' },
        { label: 'IGST Rate', value: invoice.igst_rate ? `${(invoice.igst_rate * 100).toFixed(2)}%` : '-' },
        { label: 'GSTIN', value: invoice.gstin },
        { label: 'HSN/SAC', value: invoice.hsn_sac },
      ]
    },
    {
      title: 'Addresses',
      fields: [
        { label: 'Bill To Address', value: invoice.bill_to_address, fullWidth: true },
        { label: 'Ship To Address', value: invoice.ship_to_address, fullWidth: true },
        { label: 'Installation Address', value: invoice.installation_address, fullWidth: true },
      ]
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice Details</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {invoice.bill_number || 'N/A'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {sections.map((section, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {section.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.fields.map((field, fieldIdx) => (
                    <div
                      key={fieldIdx}
                      className={`${field.fullWidth ? 'md:col-span-2' : ''} ${
                        field.highlight ? 'bg-green-50 dark:bg-green-900/20 p-3 rounded-lg' : ''
                      }`}
                    >
                      <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {field.label}
                      </dt>
                      <dd
                        className={`mt-1 text-sm ${
                          field.highlight
                            ? 'text-green-700 dark:text-green-400 font-bold text-lg'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {field.value || '-'}
                      </dd>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Batch Information */}
            {invoice.batch_name && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Batch Information
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Batch Name:</span> {invoice.batch_name}
                </p>
                {invoice.filename && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    <span className="font-medium">File Name:</span> {invoice.filename}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
          {invoice.batch_id && (
            <button
              onClick={() => {
                onClose();
                navigate(`/batches/${invoice.batch_id}`);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Batch
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailsModal;
