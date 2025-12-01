/**
 * Airtel Excel Format Template
 * Based on AIRTEL EXCEL (ZOHO) FORMET.xlsx
 * Total: 110 columns
 */

module.exports = {
  vendor: 'Airtel',
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

  // Field extraction patterns for Airtel PDFs
  // NOTE: pdf-parse removes spaces, so use \s* (zero or more) instead of \s+ (one or more)
  extractionPatterns: {
    // Basic Information
    vendor_name: /BHARTI\s+AIRTEL\s+LTD?/i,
    bill_number: /(?:Bill\s*no|Invoice\s*No|Bill\s*Number)\s*:?\s*([A-Z0-9]+)/i,
    bill_date: /(?:Bill\s*date|Invoice\s*Date)\s*:?\s*(\d{1,2}[-\/][A-Z]{3}[-\/]\d{4}|\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/i,
    due_date: /(?:Pay\s*By\s*date|Due\s*Date)\s*:?\s*(\d{1,2}[-\/][A-Z]{3}[-\/]\d{4}|\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/i,

    // Financial Information (NO SPACES in Airtel PDFs!)
    subtotal: /Sub[-\s]*Total\s*:?\s*(?:INR|Rs\.?)?\s*([0-9,]+\.?\d*)/i,
    total: /Total\s*\(INR\)\s*([0-9,]+\.?\d*)/i,
    recurring_charges: /Recurring\s*charges\s*([0-9,]+\.\d{2})/i,
    one_time_charges: /One\s*time\s*charges\s*([0-9,]+\.\d{2})/i,
    discount_amount: /Discount\s*([0-9,]+\.\d{2})/i,
    amount_in_words: /Amount\s*in\s*Words?\s*:?\s*(?:INR\s*)?([A-Za-z\s]+(?:Only|Paise))/i,

    // GST Information (NO SPACES between label and amount in Airtel PDFs!)
    cgst: /CGST\s*([0-9,]+\.\d{2})/i,
    sgst: /(?:SGST|UTGST|SGST\/UTGST)\s*([0-9,]+\.\d{2})/i,
    igst: /IGST\s*([0-9,]+\.\d{2})/i,

    // Tax rates - Airtel PDFs have summary table with percentages
    cgst_rate: /CGST\s*@?\s*(\d+(?:\.\d+)?)%|CGST.*?(\d+)%/i,
    sgst_rate: /(?:SGST|UTGST)\s*@?\s*(\d+(?:\.\d+)?)%|SGST.*?(\d+)%/i,
    igst_rate: /IGST\s*@?\s*(\d+(?:\.\d+)?)%|IGST.*?(\d+)%/i,
    tax_percentage: /GST\s*@?\s*(\d+)%|Tax\s*@?\s*(\d+)%/i,
    total_taxes: /Total\s*Taxes\s*([0-9,]+\.\d{2})/i,

    // GSTIN & Tax Information
    customer_gstin: /(?:Customer\s*GSTIN|Your\s*GSTIN)\s*\.?\s*:\s*([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})/i,
    vendor_gstin: /(?:GST\s*(?:Registration\s*)?No|GSTIN)\s*\.?\s*:\s*([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})/i,
    customer_pan: /Customer\s*PAN\s*No\.\s*:\s*([A-Z]{5}\d{4}[A-Z])/i,
    irn_code: /IRN\s*Code\s*:\s*([a-f0-9]{64})/i,

    // Location & Supply (Clean up newlines and extra text)
    place_of_supply: /Place\s*of\s*Supply\s*:\s*([A-Z\s]+?)(?:\n|State|$)/i,
    state: /STATE:\s*([A-Za-z\s]+?)(?:,|STATE|$)/i,
    branch: /(?:Branch|Office)\s*:\s*([A-Za-z\s]+)/i,

    // Service Details
    hsn_sac: /(?:HSN|SAC)\s*(?:CODE|No)?\s*:?\s*(\d+)/i,
    service_description: /(?:Description|Service|Product)\s*:?\s*([A-Za-z0-9\s\-\/]+(?:Bandwidth|Leased|MPLS|Internet|Broadband)[A-Za-z0-9\s\-\/]*)/i,
    item_name: /(?:Item|Service\s*Name)\s*:?\s*([A-Za-z0-9\s\-\/]+)/i,

    // Account & Circuit Information
    account_number: /(?:Account\s*no|Account\s*Number|A\/C\s*No)\s*:?\s*([\d\-]+)/i,
    circuit_id: /(?:Circuit\s*ID|Service\s*ID|Link\s*ID)\s*:?\s*([A-Z0-9\-\/]{5,})/i,
    service_id: /Service\s*ID\s*:?\s*([A-Z0-9\-]{5,})/i,

    // Bandwidth & Technical
    bandwidth: /(?:Bandwidth|BW)\s*:?\s*(\d+(?:\.\d+)?)\s*(?:Mbps|MBPS|mbps|MB)/i,

    // Dates & Periods
    internal_id: /Internal\s*id\s*([-\d]+)/i,
    bill_period_from: /(?:Bill\s*Period|Service\s*Period)\s*:?\s*(?:From)?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/i,
    bill_period_to: /(?:Bill\s*Period|Service\s*Period)\s*:?.*?(?:To|-)?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})\s*$/im,

    // Rate & Charges
    monthly_rate: /(?:Monthly\s*Rent|Rental|Recurring\s*Charge|Rate)\s*:?\s*(?:INR|Rs\.?)?\s*([0-9,]+\.?\d*)/i,

    // Additional Information
    vendor_notes: /(?:Note|Remarks)\s*:?\s*([A-Za-z0-9\s,\.;:\-]{10,200})(?:\n|$)/i,
    terms_conditions: /(?:Terms\s*and\s*Conditions|Terms\s*&\s*Conditions)\s*:?\s*([A-Za-z0-9\s,\.;:\-]{10,200})(?:\n|$)/i
  },

  // Default values
  defaults: {
    currency_code: 'INR',
    exchange_rate: 1,
    payment_terms: 45,
    payment_terms_label: 'Net 45',
    vendor_name: 'BHARTI AIRTEL LIMITED'
  }
};
