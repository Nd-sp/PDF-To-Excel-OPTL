/**
 * Indus Towers Excel Format Template
 * Based on INDUS TOWERS LIMITED ZOHO FORMAT.xlsx
 * Total: 110 columns (same as Airtel/ZOHO format)
 */

module.exports = {
  vendor: 'Indus',
  sheetName: 'Invoice Data',
  totalColumns: 110,

  columns: [
    // Column 1-30: Basic Invoice Information
    { index: 1, name: 'Base', type: 'string', dbField: 'base' },
    { index: 2, name: 'Bill Date', type: 'date', dbField: 'bill_date' },
    { index: 3, name: 'Due Date', type: 'date', dbField: 'due_date' },
    { index: 4, name: 'Bill ID', type: 'string', dbField: 'bill_id' },
    { index: 5, name: 'Vendor Name', type: 'string', dbField: 'vendor_name' },
    { index: 6, name: 'Entity Discount Percent', type: 'float', dbField: 'entity_discount_percent' },
    { index: 7, name: 'Payment Terms', type: 'int', dbField: 'payment_terms' },
    { index: 8, name: 'Payment Terms Label', type: 'string', dbField: 'payment_terms_label' },
    { index: 9, name: 'Bill Number', type: 'string', dbField: 'bill_number' },
    { index: 10, name: 'PurchaseOrder', type: 'string', dbField: 'purchase_order' },
    { index: 11, name: 'Currency Code', type: 'string', dbField: 'currency_code' },
    { index: 12, name: 'Exchange Rate', type: 'float', dbField: 'exchange_rate' },
    { index: 13, name: 'SubTotal', type: 'float', dbField: 'subtotal' },
    { index: 14, name: 'Total', type: 'float', dbField: 'total' },
    { index: 15, name: 'Balance', type: 'float', dbField: 'balance' },
    { index: 16, name: 'TCS Amount', type: 'float', dbField: 'tcs_amount' },
    { index: 17, name: 'Vendor Notes', type: 'string', dbField: 'vendor_notes' },
    { index: 18, name: 'Terms & Conditions', type: 'string', dbField: 'terms_conditions' },
    { index: 19, name: 'Adjustment', type: 'float', dbField: 'adjustment' },
    { index: 20, name: 'Adjustment Description', type: 'string', dbField: 'adjustment_description' },
    { index: 21, name: 'Branch ID', type: 'string', dbField: 'branch_id' },
    { index: 22, name: 'Branch Name', type: 'string', dbField: 'branch_name' },
    { index: 23, name: 'Location Name', type: 'string', dbField: 'location_name' },
    { index: 24, name: 'Is Inclusive Tax', type: 'boolean', dbField: 'is_inclusive_tax' },
    { index: 25, name: 'Submitted By', type: 'string', dbField: 'submitted_by' },
    { index: 26, name: 'Approved By', type: 'string', dbField: 'approved_by' },
    { index: 27, name: 'Submitted Date', type: 'date', dbField: 'submitted_date' },
    { index: 28, name: 'Approved Date', type: 'date', dbField: 'approved_date' },
    { index: 29, name: 'Bill Status', type: 'string', dbField: 'bill_status' },
    { index: 30, name: 'Created By', type: 'string', dbField: 'created_by' },

    // Column 31-63: Line Item Details
    { index: 31, name: 'Product ID', type: 'string', dbField: 'product_id' },
    { index: 32, name: 'Item Name', type: 'string', dbField: 'item_name' },
    { index: 33, name: 'Account', type: 'string', dbField: 'account' },
    { index: 34, name: 'Account Code', type: 'string', dbField: 'account_code' },
    { index: 35, name: 'Description', type: 'string', dbField: 'description' },
    { index: 36, name: 'Quantity', type: 'float', dbField: 'quantity' },
    { index: 37, name: 'Usage unit', type: 'string', dbField: 'usage_unit' },
    { index: 38, name: 'Tax Amount', type: 'float', dbField: 'tax_amount' },
    { index: 39, name: 'Item Total', type: 'float', dbField: 'item_total' },
    { index: 40, name: 'Is Billable', type: 'boolean', dbField: 'is_billable' },
    { index: 41, name: 'Reference Invoice Type', type: 'string', dbField: 'reference_invoice_type' },
    { index: 42, name: 'Source of Supply', type: 'string', dbField: 'source_of_supply' },
    { index: 43, name: 'Destination of Supply', type: 'string', dbField: 'destination_of_supply' },
    { index: 44, name: 'GST Treatment', type: 'string', dbField: 'gst_treatment' },
    { index: 45, name: 'GST Identification Number (GSTIN)', type: 'string', dbField: 'gstin' },
    { index: 46, name: 'TDS Calculation Type', type: 'string', dbField: 'tds_calculation_type' },
    { index: 47, name: 'TDS TaxID', type: 'string', dbField: 'tds_tax_id' },
    { index: 48, name: 'TDS Name', type: 'string', dbField: 'tds_name' },
    { index: 49, name: 'TDS Percentage', type: 'float', dbField: 'tds_percentage' },
    { index: 50, name: 'TDS Section Code', type: 'string', dbField: 'tds_section_code' },
    { index: 51, name: 'TDS Section', type: 'string', dbField: 'tds_section' },
    { index: 52, name: 'TDS Amount', type: 'float', dbField: 'tds_amount' },
    { index: 53, name: 'TCS Tax Name', type: 'string', dbField: 'tcs_tax_name' },
    { index: 54, name: 'TCS Percentage', type: 'float', dbField: 'tcs_percentage' },
    { index: 55, name: 'Nature Of Collection', type: 'string', dbField: 'nature_of_collection' },
    { index: 56, name: 'SKU', type: 'string', dbField: 'sku' },
    { index: 57, name: 'Line Item Location Name', type: 'string', dbField: 'line_item_location_name' },
    { index: 58, name: 'Rate', type: 'float', dbField: 'rate' },
    { index: 59, name: 'Discount Type', type: 'string', dbField: 'discount_type' },
    { index: 60, name: 'Is Discount Before Tax', type: 'boolean', dbField: 'is_discount_before_tax' },
    { index: 61, name: 'Discount', type: 'float', dbField: 'discount' },
    { index: 62, name: 'Discount Amount', type: 'float', dbField: 'discount_amount' },
    { index: 63, name: 'HSN/SAC', type: 'string', dbField: 'hsn_sac' },

    // Column 64-98: Tax and Additional Details
    { index: 64, name: 'Purchase Order Number', type: 'string', dbField: 'po_number' },
    { index: 65, name: 'Tax ID', type: 'string', dbField: 'tax_id' },
    { index: 66, name: 'Tax Name', type: 'string', dbField: 'tax_name' },
    { index: 67, name: 'Tax Percentage', type: 'float', dbField: 'tax_percentage' },
    { index: 68, name: 'Tax Type', type: 'string', dbField: 'tax_type' },
    { index: 69, name: 'Item TDS Name', type: 'string', dbField: 'item_tds_name' },
    { index: 70, name: 'Item TDS Percentage', type: 'float', dbField: 'item_tds_percentage' },
    { index: 71, name: 'Item TDS Amount', type: 'float', dbField: 'item_tds_amount' },
    { index: 72, name: 'Item TDS Section Code', type: 'string', dbField: 'item_tds_section_code' },
    { index: 73, name: 'Item TDS Section', type: 'string', dbField: 'item_tds_section' },
    { index: 74, name: 'Item Exemption Code', type: 'string', dbField: 'item_exemption_code' },
    { index: 75, name: 'Item Type', type: 'string', dbField: 'item_type' },
    { index: 76, name: 'Reverse Charge Tax Name', type: 'string', dbField: 'reverse_charge_tax_name' },
    { index: 77, name: 'Reverse Charge Tax Rate', type: 'float', dbField: 'reverse_charge_tax_rate' },
    { index: 78, name: 'Reverse Charge Tax Type', type: 'string', dbField: 'reverse_charge_tax_type' },
    { index: 79, name: 'Supply Type', type: 'string', dbField: 'supply_type' },
    { index: 80, name: 'ITC Eligibility', type: 'string', dbField: 'itc_eligibility' },
    { index: 81, name: 'Entity Discount Amount', type: 'float', dbField: 'entity_discount_amount' },
    { index: 82, name: 'Discount Account', type: 'string', dbField: 'discount_account' },
    { index: 83, name: 'Discount Account Code', type: 'string', dbField: 'discount_account_code' },
    { index: 84, name: 'Is Landed Cost', type: 'boolean', dbField: 'is_landed_cost' },
    { index: 85, name: 'Customer Name', type: 'string', dbField: 'customer_name' },
    { index: 86, name: 'Project Name', type: 'string', dbField: 'project_name' },
    { index: 87, name: 'CGST Rate %', type: 'float', dbField: 'cgst_rate' },
    { index: 88, name: 'SGST Rate %', type: 'float', dbField: 'sgst_rate' },
    { index: 89, name: 'IGST Rate %', type: 'float', dbField: 'igst_rate' },
    { index: 90, name: 'CESS Rate %', type: 'float', dbField: 'cess_rate' },
    { index: 91, name: 'CGST(FCY)', type: 'float', dbField: 'cgst_fcy' },
    { index: 92, name: 'SGST(FCY)', type: 'float', dbField: 'sgst_fcy' },
    { index: 93, name: 'IGST(FCY)', type: 'float', dbField: 'igst_fcy' },
    { index: 94, name: 'CESS(FCY)', type: 'float', dbField: 'cess_fcy' },
    { index: 95, name: 'CGST', type: 'float', dbField: 'cgst' },
    { index: 96, name: 'SGST', type: 'float', dbField: 'sgst' },
    { index: 97, name: 'IGST', type: 'float', dbField: 'igst' },
    { index: 98, name: 'CESS', type: 'float', dbField: 'cess' },

    // Column 99-110: Custom Fields
    { index: 99, name: 'CF.Round Off', type: 'float', dbField: 'cf_round_off' },
    { index: 100, name: 'CF.VENDOR CIRCUIT ID -', type: 'string', dbField: 'cf_vendor_circuit_id' },
    { index: 101, name: 'CF.ACCOUNT / RELATIONSHIP NO - ', type: 'string', dbField: 'cf_account_relationship_no' },
    { index: 102, name: 'CF.PO ARC VALUE - Rs', type: 'float', dbField: 'cf_po_arc_value' },
    { index: 103, name: 'CF.Link Acceptance Date -', type: 'date', dbField: 'cf_link_acceptance_date' },
    { index: 104, name: 'CF.Bill Period From Date -', type: 'date', dbField: 'cf_bill_period_from' },
    { index: 105, name: 'CF.Bill Period To Date -', type: 'date', dbField: 'cf_bill_period_to' },
    { index: 106, name: 'CF.WAREHOUSE -', type: 'string', dbField: 'cf_warehouse' },
    { index: 107, name: 'CF.H8 Inward Number -', type: 'string', dbField: 'cf_h8_inward_number' },
    { index: 108, name: 'CF.Entry Date', type: 'date', dbField: 'cf_entry_date' },
    { index: 109, name: 'CF.Bandwidth (Mbps)', type: 'float', dbField: 'cf_bandwidth' },
    { index: 110, name: 'Customer GSTIN', type: 'string', dbField: 'customer_gstin' }
  ],

  // Field extraction patterns for Indus PDFs
  // NOTE: pdf-parse removes ALL spaces, data is compressed!
  // Format: "Invoice No. Invoice Date >CircleState\nAPAPRIN0857529/10/2025Andhra PradeshAndhra Pradesh"
  extractionPatterns: {
    vendor_name: /INDUS\s*TOWERS\s*LIMITED/i,
    // Invoice Number - letters and digits before the date (stops at first digit of date)
    invoice_number: />CircleState\n([A-Z0-9]+?)(?=\d{2}\/)/,
    // Invoice Date - DD/MM/YYYY format
    invoice_date: />CircleState\n[A-Z0-9]+?(\d{2}\/\d{2}\/\d{4})/,
    // Circle - text between date and duplicate text (takes first occurrence)
    circle: />CircleState\n[A-Z0-9]+?\d{2}\/\d{2}\/\d{4}([A-Za-z\s]+?)(?=\1|\n)/,
    // State - same as circle (duplicated in PDF)
    state: />CircleState\n[A-Z0-9]+?\d{2}\/\d{2}\/\d{4}([A-Za-z\s]+?)(?=\1|\n)/,
    // Description - from line items section
    description: /Description\s*\([^)]+\)\s*Amount[^\n]*\n\s*([^\n]+)/i,
    // Amount subtotal
    amount: /Charges\s*as\s*above\s*([0-9,]+)/i,
    // Total payable
    total: /Total\s*Payable\s*\(INR\)\s*([0-9,]+)/i,
    // HSN Code from description line
    hsn_code: /HSN\s*Code\s*-\s*(\d+)/i,
    // Customer GSTIN - uppercase "NO" at top
    customer_gstin_label: /GSTIN\s*NO\s*-\s*([0-9A-Z]{15})/,
    // Vendor GSTIN - lowercase "No" at bottom
    vendor_gstin: /GSTIN\s*No\s*-\s*([0-9A-Z]{15})/,
    // PAN Number
    pan: /Permanent\s*Account\s*No\.?\s*([A-Z0-9]{10})/i,
    // CIN Number
    cin: /CIN\s*No\.?\s*([A-Z0-9]+)/i,
    // Account Number
    account_number: /Account\s*No\.?\s*([0-9]+)/i,
    // IFSC Code
    ifsc: /IFSC\s*Code[^-\s]*[-\s]*([A-Z0-9]{11})/i,
    // CGST Amount
    cgst: /Add:\s*CGST\s*\(\d+%\)\s*([0-9,]+)/i,
    // SGST Amount
    sgst: /Add:\s*SGST\s*\(\d+%\)\s*([0-9,]+)/i,
    // IGST Amount
    igst: /Add:\s*IGST\s*\(\d+%\)\s*([0-9,]+)/i,
    // CGST Rate
    cgst_rate: /CGST\s*\((\d+)%\)/i,
    // SGST Rate
    sgst_rate: /SGST\s*\((\d+)%\)/i,
    // IGST Rate
    igst_rate: /IGST\s*\((\d+)%\)/i,
  },

  // Default values
  defaults: {
    currency_code: 'INR',
    exchange_rate: 1,
    payment_terms: 15,
    payment_terms_label: 'Net 15',
    vendor_name: 'INDUS TOWERS LIMITED'
  }
};
