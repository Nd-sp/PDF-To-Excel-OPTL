import React, { useState } from 'react';
import { FileUp, FolderOpen, BarChart3, Search, GitCompare, CheckCircle, Edit3, Clock, Download, Zap, ArrowRight, ArrowDown, HelpCircle, BookOpen, Lightbulb, Mail } from 'lucide-react';

const HelpPage = () => {
  const [activeTab, setActiveTab] = useState('flow');
  const [selectedFeature, setSelectedFeature] = useState(null);

  // Feature details for the clickable flow diagram
  const features = {
    upload: {
      title: '1️⃣ Upload Page',
      icon: FileUp,
      color: 'blue',
      description: 'Start here! Upload 1-1000 PDF invoices for batch processing.',
      steps: [
        'Click "Browse Files" or drag & drop PDFs',
        'Enter a batch name (auto-generated if empty)',
        'Select vendor type (Vodafone, Tata, Airtel, etc.)',
        'Choose processing options (AI extraction, blank columns)',
        'Click "Start Processing" to begin',
      ],
      tips: [
        'You can upload up to 1000 PDFs at once',
        'Always select the correct vendor type for accurate extraction',
        'AI extraction is slower but more accurate',
      ],
    },
    batches: {
      title: '2️⃣ Batches Page',
      icon: FolderOpen,
      color: 'green',
      description: 'View and manage all your processing batches.',
      steps: [
        'See all batches with status (pending, processing, completed)',
        'Filter by vendor type or status',
        'Click "View Details" for individual batch',
        'Quick download Excel/CSV from batch cards',
        'Delete old batches when done',
      ],
      tips: [
        'Batches are sorted by date (newest first)',
        'Use filters to quickly find specific batches',
        'Failed files can be retried from batch details',
      ],
    },
    batchDetails: {
      title: '📋 Batch Details',
      icon: FolderOpen,
      color: 'blue',
      description: 'Deep dive into a single batch with all PDFs and extracted data.',
      steps: [
        'View summary cards (total files, processed, failed, total amount)',
        'Download batch in Excel, CSV, or JSON format',
        'See list of all PDF files with status',
        'Click "View Data" to see extracted invoice details',
        'Retry failed PDFs individually',
      ],
      tips: [
        'Click any PDF row to see full extracted data',
        'Use "Retry Failed" to reprocess errors',
        'Export buttons support multiple formats',
      ],
    },
    analytics: {
      title: '3️⃣ Analytics Dashboard',
      icon: BarChart3,
      color: 'purple',
      description: 'Business intelligence and insights from your invoice data.',
      steps: [
        'View key metrics (total invoices, cost, avg invoice, GST)',
        'Analyze monthly cost trends with charts',
        'See vendor breakdown (pie chart)',
        'Review tax summary (CGST, SGST, IGST)',
        'Export reports as PDF or Excel',
      ],
      tips: [
        'Filter by vendor type and date range',
        'Charts update in real-time based on filters',
        'Use this to identify cost spikes or trends',
      ],
    },
    search: {
      title: '4️⃣ Search Page',
      icon: Search,
      color: 'blue',
      description: 'Advanced search to find any invoice quickly.',
      steps: [
        'Enter search query (invoice number, vendor, etc.)',
        'Apply filters (vendor, date range, amount range)',
        'View search results in table',
        'Select multiple invoices for export',
        'Save search queries for reuse',
      ],
      tips: [
        'Use date range for monthly reports',
        'Amount range helps find high-value invoices',
        'Saved queries can be reused later',
      ],
    },
    compare: {
      title: '5️⃣ Comparison Page',
      icon: GitCompare,
      color: 'yellow',
      description: 'Compare 2-4 invoices side-by-side to spot differences.',
      steps: [
        'Search and select 2-4 invoices to compare',
        'Click "Compare Selected" to see side-by-side table',
        'Review highlighted differences (⚠ marks significant changes)',
        'View insights and alerts below comparison',
        'Export comparison report',
      ],
      tips: [
        'Great for comparing same circuit across months',
        'Detects cost changes and anomalies',
        'Use for duplicate invoice detection',
      ],
    },
    validation: {
      title: '6️⃣ Validation Page',
      icon: CheckCircle,
      color: 'red',
      description: 'Check data quality and find extraction errors.',
      steps: [
        'Select batch to validate',
        'Click "Run Validation" to check all rules',
        'View summary (total checks, errors, warnings)',
        'Review errors table with details',
        'Click "Fix" to correct errors inline',
      ],
      tips: [
        'Always validate before exporting important data',
        'Fix critical errors (red) before warnings (yellow)',
        'Re-run validation after corrections',
      ],
    },
    corrections: {
      title: '7️⃣ Corrections Page',
      icon: Edit3,
      color: 'orange',
      description: 'Manually correct any extraction errors.',
      steps: [
        'Search for invoice by number or vendor',
        'Edit any field in the form (invoice number, dates, amounts, etc.)',
        'Enter reason for correction',
        'Click "Save Corrections" to update',
        'View correction history below',
      ],
      tips: [
        'All changes are logged with timestamp and user',
        'Original values are preserved in history',
        'Use this for fixing AI extraction mistakes',
      ],
    },
    scheduler: {
      title: '8️⃣ Scheduler Page',
      icon: Clock,
      color: 'purple',
      description: 'Automate recurring processing tasks.',
      steps: [
        'Click "Create New Job" to start',
        'Enter job name and select job type',
        'Configure schedule (daily, weekly, monthly, or custom cron)',
        'Set parameters (folder, vendor, auto-export)',
        'Job runs automatically on schedule',
      ],
      tips: [
        'Use for daily/weekly invoice processing',
        'Custom cron allows any schedule (e.g., every 6 hours)',
        'Pause jobs temporarily without deleting',
      ],
    },
    templates: {
      title: '🛠️ Templates Page',
      icon: BookOpen,
      color: 'blue',
      description: 'Manage vendor-specific extraction templates.',
      steps: [
        'View all existing templates',
        'Click "Create New Template" for custom vendors',
        'Edit template with regex patterns (JSON format)',
        'Set as default template for automatic use',
        'Import/export templates for backup',
      ],
      tips: [
        'Each vendor needs a unique template',
        'Test templates with sample PDFs',
        'Export templates to share across systems',
      ],
    },
  };

  const FlowBox = ({ feature, children, className = "" }) => {
    const featureData = features[feature];
    const Icon = featureData?.icon || HelpCircle;
    const colorClasses = {
      blue: "bg-blue-100 dark:bg-blue-900/30 border-blue-500 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-gray-900 dark:text-blue-100",
      green:
        "bg-green-100 dark:bg-green-900/30 border-green-500 hover:bg-green-200 dark:hover:bg-green-900/50 text-gray-900 dark:text-green-100",
      purple:
        "bg-purple-100 dark:bg-purple-900/30 border-purple-500 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-gray-900 dark:text-purple-100",
      yellow:
        "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 text-gray-900 dark:text-yellow-100",
      red: "bg-red-100 dark:bg-red-900/30 border-red-500 hover:bg-red-200 dark:hover:bg-red-900/50 text-gray-900 dark:text-red-100",
      orange:
        "bg-orange-100 dark:bg-orange-900/30 border-orange-500 hover:bg-orange-200 dark:hover:bg-orange-900/50 text-gray-900 dark:text-orange-100",
    };

    return (
      <div
        onClick={() => setSelectedFeature(feature)}
        className={`
          relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
          transform hover:scale-105 hover:shadow-lg
          ${colorClasses[featureData?.color] || colorClasses.blue}
          ${className}
        `}
      >
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-5 h-5" />
          <span className="font-semibold text-sm">{children}</span>
        </div>
      </div>
    );
  };

  const Arrow = ({ direction = "down", className = "" }) => {
    const Icon = direction === "down" ? ArrowDown : ArrowRight;
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Icon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <HelpCircle className="w-10 h-10 text-blue-500 dark:text-blue-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Help & User Guide
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Learn how to use the PDF to Excel Converter app efficiently
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("flow")}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === "flow"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          🗺️ App Flow
        </button>
        <button
          onClick={() => setActiveTab("getting-started")}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === "getting-started"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          📖 Getting Started
        </button>
        <button
          onClick={() => setActiveTab("tips")}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === "tips"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          💡 Tips & Tricks
        </button>
        <button
          onClick={() => setActiveTab("faq")}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === "faq"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          ❓ FAQ
        </button>
      </div>

      {/* App Flow Tab */}
      {activeTab === "flow" && (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <span className="font-medium">
                Click any box below to see detailed instructions
              </span>
            </p>
          </div>

          {/* Interactive Flow Diagram */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Complete App Workflow
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Follow this flow to process invoices from start to finish
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 max-w-4xl mx-auto">
              {/* Row 1: Upload */}
              <FlowBox feature="upload">Upload PDFs</FlowBox>

              <Arrow direction="down" />

              {/* Row 2: Batches */}
              <FlowBox feature="batches">View Batches</FlowBox>

              <Arrow direction="down" />

              {/* Row 3: Batch Details */}
              <FlowBox feature="batchDetails">Batch Details & Export</FlowBox>

              <Arrow direction="down" />

              {/* Row 4: Three parallel options */}
              <div className="grid grid-cols-3 gap-4 w-full">
                <FlowBox feature="analytics">Analytics</FlowBox>
                <FlowBox feature="search">Search</FlowBox>
                <FlowBox feature="compare">Compare</FlowBox>
              </div>

              <Arrow direction="down" />

              {/* Row 5: Validation & Corrections */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                <FlowBox feature="validation">Validate Data</FlowBox>
                <FlowBox feature="corrections">Fix Errors</FlowBox>
              </div>

              <Arrow direction="down" />

              {/* Row 6: Advanced Features */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                <FlowBox feature="scheduler">Automate Jobs</FlowBox>
                <FlowBox feature="templates">Manage Templates</FlowBox>
              </div>

              {/* Final Export */}
              <Arrow direction="down" />
              <div className="bg-green-100 dark:bg-green-900/30 border-2 border-green-500 dark:border-green-600 rounded-lg p-6 w-full max-w-md text-center">
                <Download className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  Export & Done!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Download Excel, CSV, or JSON
                </p>
              </div>
            </div>
          </div>

          {/* Feature Details Panel */}
          {selectedFeature && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {React.createElement(features[selectedFeature].icon, {
                    className: "w-8 h-8 text-blue-500 dark:text-blue-400",
                  })}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {features[selectedFeature].title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {features[selectedFeature].description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFeature(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    📋 Steps:
                  </h4>
                  <ol className="space-y-2">
                    {features[selectedFeature].steps.map((step, idx) => (
                      <li
                        key={idx}
                        className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <span className="font-semibold text-blue-500 dark:text-blue-400">
                          {idx + 1}.
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    💡 Tips:
                  </h4>
                  <ul className="space-y-2">
                    {features[selectedFeature].tips.map((tip, idx) => (
                      <li
                        key={idx}
                        className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <Lightbulb className="w-4 h-4 text-yellow-500 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Getting Started Tab */}
      {activeTab === "getting-started" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Quick Start Guide
          </h2>

          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 dark:border-blue-400 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Step 1: Upload Your PDFs
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Navigate to the Upload page and select your invoice PDFs. You
                can upload 1-1000 files at once.
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>
                  Choose the correct vendor type (Vodafone, Tata, Airtel, etc.)
                </li>
                <li>Give your batch a meaningful name</li>
                <li>Click "Start Processing" and wait for completion</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 dark:border-green-400 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Step 2: Monitor Progress
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Go to the Batches page to see all your processing batches and
                their status.
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>Real-time progress tracking with percentage</li>
                <li>See completed, processing, and failed counts</li>
                <li>Click "View Details" for individual batch analysis</li>
              </ul>
            </div>

            <div className="border-l-4 border-purple-500 dark:border-purple-400 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Step 3: Validate & Correct (Optional)
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Before exporting, validate your data to ensure accuracy.
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>Run validation checks on the Validation page</li>
                <li>Fix any errors on the Corrections page</li>
                <li>Re-run validation to confirm fixes</li>
              </ul>
            </div>

            <div className="border-l-4 border-yellow-500 dark:border-yellow-400 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Step 4: Export Your Data
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Download your processed invoice data in your preferred format.
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>Excel (.xlsx) - Full formatting with all columns</li>
                <li>CSV - Simple comma-separated for easy import</li>
                <li>JSON - Machine-readable for integrations</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Zap className="w-6 h-6 text-blue-500 dark:text-blue-400 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Pro Tip: First Time Setup
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  If you're processing invoices from a new vendor, create a
                  custom template on the Templates page first. This ensures
                  accurate data extraction tailored to that vendor's invoice
                  format.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips & Tricks Tab */}
      {activeTab === "tips" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Tips & Best Practices
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Processing Tips
                </h3>
                <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
                  <li>
                    • Always select the correct vendor type before uploading
                  </li>
                  <li>
                    • Process PDFs in batches of 100-200 for optimal performance
                  </li>
                  <li>
                    • Use AI extraction for complex or non-standard invoices
                  </li>
                  <li>
                    • Regular extraction (regex) is faster for standard formats
                  </li>
                </ul>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Analytics Tips
                </h3>
                <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
                  <li>• Use date filters to compare monthly spending trends</li>
                  <li>
                    • Vendor breakdown helps identify major cost contributors
                  </li>
                  <li>• Export reports regularly for record-keeping</li>
                  <li>• Monitor GST totals for tax filing accuracy</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search Tips
                </h3>
                <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <li>
                    • Save frequently used search queries for quick access
                  </li>
                  <li>• Use amount range to find high-value invoices</li>
                  <li>• Circuit ID search helps track specific connections</li>
                  <li>
                    • Export search results directly from the results page
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Data Quality Tips
                </h3>
                <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
                  <li>• Always validate data before final export</li>
                  <li>• Fix critical errors (red) immediately</li>
                  <li>• Review warnings (yellow) for potential issues</li>
                  <li>• Document corrections with clear reasons</li>
                </ul>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Automation Tips
                </h3>
                <ul className="space-y-2 text-sm text-orange-800 dark:text-orange-200">
                  <li>• Schedule daily jobs for recurring vendor invoices</li>
                  <li>• Use custom cron expressions for specific schedules</li>
                  <li>
                    • Enable auto-export in job config for hands-free processing
                  </li>
                  <li>• Pause jobs temporarily instead of deleting</li>
                </ul>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                  <GitCompare className="w-5 h-5" />
                  Comparison Tips
                </h3>
                <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
                  <li>• Compare invoices from same circuit across months</li>
                  <li>
                    • Look for cost changes &gt;10% (automatically highlighted)
                  </li>
                  <li>• Use comparison to detect duplicate invoices</li>
                  <li>• Export comparison reports for audit trails</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Tab */}
      {activeTab === "faq" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <details className="group border border-gray-200 dark:border-gray-700 rounded-lg">
              <summary className="cursor-pointer p-4 font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                How many PDFs can I upload at once?
              </summary>
              <div className="p-4 pt-0 text-gray-700 dark:text-gray-300 text-sm">
                You can upload up to 1000 PDF files in a single batch. For
                optimal performance, we recommend batches of 100-200 files.
              </div>
            </details>

            <details className="group border border-gray-200 dark:border-gray-700 rounded-lg">
              <summary className="cursor-pointer p-4 font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                What happens if some PDFs fail to process?
              </summary>
              <div className="p-4 pt-0 text-gray-700 dark:text-gray-300 text-sm">
                Failed PDFs are marked in red on the Batch Details page. You can
                retry them individually by clicking the "Retry" button. Check
                the error message to understand why processing failed.
              </div>
            </details>

            <details className="group border border-gray-200 dark:border-gray-700 rounded-lg">
              <summary className="cursor-pointer p-4 font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                Should I use AI extraction or regular extraction?
              </summary>
              <div className="p-4 pt-0 text-gray-700 dark:text-gray-300 text-sm">
                <strong className="text-gray-900 dark:text-white">
                  Regular extraction
                </strong>{" "}
                (regex-based) is faster (1-2s per PDF) and works well for
                standard invoice formats.{" "}
                <strong className="text-gray-900 dark:text-white">
                  AI extraction
                </strong>{" "}
                (GPT-4) is slower (3-5s per PDF) but more accurate for complex
                or non-standard formats. For known vendors with templates, use
                regular extraction.
              </div>
            </details>

            <details className="group border border-gray-200 dark:border-gray-700 rounded-lg">
              <summary className="cursor-pointer p-4 font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                How do I create a template for a new vendor?
              </summary>
              <div className="p-4 pt-0 text-gray-700 dark:text-gray-300 text-sm">
                Go to Templates page → Click "Create New Template" → Enter
                vendor name → Define field mappings using regex patterns in JSON
                format → Test with sample PDF → Save. Refer to existing
                templates as examples.
              </div>
            </details>

            <details className="group border border-gray-200 dark:border-gray-700 rounded-lg">
              <summary className="cursor-pointer p-4 font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                Can I edit extracted data after processing?
              </summary>
              <div className="p-4 pt-0 text-gray-700 dark:text-gray-300 text-sm">
                Yes! Use the Corrections page to manually edit any field. All
                changes are logged with timestamp and reason. You can also fix
                errors directly from the Validation page.
              </div>
            </details>

            <details className="group border border-gray-200 dark:border-gray-700 rounded-lg">
              <summary className="cursor-pointer p-4 font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                What export formats are supported?
              </summary>
              <div className="p-4 pt-0 text-gray-700 dark:text-gray-300 text-sm">
                We support Excel (.xlsx), CSV, and JSON formats. Excel includes
                full formatting and all columns. CSV is best for importing into
                other systems. JSON is for API/integration use cases.
              </div>
            </details>

            <details className="group border border-gray-200 dark:border-gray-700 rounded-lg">
              <summary className="cursor-pointer p-4 font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                How do I schedule recurring processing jobs?
              </summary>
              <div className="p-4 pt-0 text-gray-700 dark:text-gray-300 text-sm">
                Go to Scheduler page → Click "Create New Job" → Select job type
                (Batch Processing) → Set schedule (daily, weekly, or custom
                cron) → Configure folder and vendor → Enable auto-export if
                needed → Save. The job runs automatically.
              </div>
            </details>

            <details className="group border border-gray-200 dark:border-gray-700 rounded-lg">
              <summary className="cursor-pointer p-4 font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                What are the supported vendors?
              </summary>
              <div className="p-4 pt-0 text-gray-700 dark:text-gray-300 text-sm">
                Currently supported: Vodafone Idea, Tata Teleservices, Bharti
                Airtel, Indus Towers, Ascend Telecom, Sify Technologies, and
                BSNL. You can also create custom templates for other vendors.
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpPage;
