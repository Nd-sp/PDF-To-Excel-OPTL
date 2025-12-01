const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs').promises;

class ExcelGenerator {
  constructor() {
    this.workbook = null;
    this.worksheet = null;
  }

  /**
   * Initialize workbook and worksheet
   */
  initializeWorkbook() {
    this.workbook = new ExcelJS.Workbook();
    this.worksheet = this.workbook.addWorksheet('Invoice Data');

    // Set worksheet properties
    this.worksheet.properties.defaultRowHeight = 15;
  }

  /**
   * Get Tata-specific column definitions
   */
  getTataColumns() {
    return [
      { header: 'Filename', key: 'filename', width: 25 },
      { header: 'Base', key: 'base', width: 15 },
      { header: 'Bill Date', key: 'billDate', width: 15 },
      { header: 'Due Date', key: 'dueDate', width: 15 },
      { header: 'Bill ID', key: 'billId', width: 20 },
      { header: 'Vendor Name', key: 'vendorName', width: 30 },
      { header: 'Entity Discount Percent', key: 'entityDiscountPercent', width: 20 },
      { header: 'Payment Terms', key: 'paymentTerms', width: 15 },
      { header: 'Payment Terms Label', key: 'paymentTermsLabel', width: 20 },
      { header: 'Bill Number', key: 'billNumber', width: 25 },
      { header: 'PurchaseOrder', key: 'purchaseOrder', width: 40 },
      { header: 'Currency Code', key: 'currencyCode', width: 15 },
      { header: 'Exchange Rate', key: 'exchangeRate', width: 15 },
      { header: 'SubTotal', key: 'subTotal', width: 15 },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Balance', key: 'balance', width: 15 },
      { header: 'TCS Amount', key: 'tcsAmount', width: 15 },
      { header: 'Vendor Notes', key: 'vendorNotes', width: 50 },
      { header: 'Terms & Conditions', key: 'termsConditions', width: 30 },
      { header: 'Adjustment', key: 'adjustment', width: 15 },
      { header: 'Adjustment Description', key: 'adjustmentDescription', width: 30 },
      { header: 'Branch ID', key: 'branchId', width: 15 },
      { header: 'Branch Name', key: 'branchName', width: 25 },
      { header: 'Location Name', key: 'locationName', width: 25 },
      { header: 'Is Inclusive Tax', key: 'isInclusiveTax', width: 15 },
      { header: 'Submitted By', key: 'submittedBy', width: 20 },
      { header: 'Approved By', key: 'approvedBy', width: 20 },
      { header: 'Submitted Date', key: 'submittedDate', width: 15 },
      { header: 'Approved Date', key: 'approvedDate', width: 15 },
      { header: 'Bill Status', key: 'billStatus', width: 15 },
      { header: 'Created By', key: 'createdBy', width: 20 },
      { header: 'Product ID', key: 'productId', width: 15 },
      { header: 'Item Name', key: 'itemName', width: 40 },
      { header: 'Account', key: 'account', width: 20 },
      { header: 'Account Code', key: 'accountCode', width: 15 },
      { header: 'Description', key: 'description', width: 50 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Usage unit', key: 'usageUnit', width: 15 },
      { header: 'Tax Amount', key: 'taxAmount', width: 15 },
      { header: 'Item Total', key: 'itemTotal', width: 15 },
      { header: 'Is Billable', key: 'isBillable', width: 12 },
      { header: 'Reference Invoice Type', key: 'referenceInvoiceType', width: 25 },
      { header: 'Source of Supply', key: 'sourceOfSupply', width: 20 },
      { header: 'Destination of Supply', key: 'destinationOfSupply', width: 20 },
      { header: 'GST Treatment', key: 'gstTreatment', width: 20 },
      { header: 'GST Identification Number (GSTIN)', key: 'gstin', width: 25 },
      { header: 'TDS Calculation Type', key: 'tdsCalculationType', width: 20 },
      { header: 'TDS TaxID', key: 'tdsTaxId', width: 15 },
      { header: 'TDS Name', key: 'tdsName', width: 20 },
      { header: 'TDS Percentage', key: 'tdsPercentage', width: 15 },
      { header: 'TDS Section Code', key: 'tdsSectionCode', width: 15 },
      { header: 'TDS Section', key: 'tdsSection', width: 20 },
      { header: 'TDS Amount', key: 'tdsAmount', width: 15 },
      { header: 'TCS Tax Name', key: 'tcsTaxName', width: 20 },
      { header: 'TCS Percentage', key: 'tcsPercentage', width: 15 },
      { header: 'Nature Of Collection', key: 'natureOfCollection', width: 25 },
      { header: 'SKU', key: 'sku', width: 20 },
      { header: 'Line Item Location Name', key: 'lineItemLocationName', width: 25 },
      { header: 'Rate', key: 'rate', width: 15 },
      { header: 'Discount Type', key: 'discountType', width: 15 },
      { header: 'Is Discount Before Tax', key: 'isDiscountBeforeTax', width: 20 },
      { header: 'Discount', key: 'discount', width: 15 },
      { header: 'Discount Amount', key: 'discountAmount', width: 15 },
      { header: 'HSN/SAC', key: 'hsnSac', width: 15 },
      { header: 'Purchase Order Number', key: 'purchaseOrderNumber', width: 25 },
      { header: 'Tax ID', key: 'taxId', width: 15 },
      { header: 'Tax Name', key: 'taxName', width: 20 },
      { header: 'Tax Percentage', key: 'taxPercentage', width: 15 },
      { header: 'Tax Type', key: 'taxType', width: 15 },
      { header: 'Item TDS Name', key: 'itemTdsName', width: 20 },
      { header: 'Item TDS Percentage', key: 'itemTdsPercentage', width: 18 },
      { header: 'Item TDS Amount', key: 'itemTdsAmount', width: 15 },
      { header: 'Item TDS Section Code', key: 'itemTdsSectionCode', width: 20 },
      { header: 'Item TDS Section', key: 'itemTdsSection', width: 20 },
      { header: 'Item Exemption Code', key: 'itemExemptionCode', width: 20 },
      { header: 'Item Type', key: 'itemType', width: 15 },
      { header: 'Reverse Charge Tax Name', key: 'reverseChargeTaxName', width: 25 },
      { header: 'Reverse Charge Tax Rate', key: 'reverseChargeTaxRate', width: 20 },
      { header: 'Reverse Charge Tax Type', key: 'reverseChargeTaxType', width: 20 },
      { header: 'Supply Type', key: 'supplyType', width: 15 },
      { header: 'ITC Eligibility', key: 'itcEligibility', width: 18 },
      { header: 'Entity Discount Amount', key: 'entityDiscountAmount', width: 20 },
      { header: 'Discount Account', key: 'discountAccount', width: 20 },
      { header: 'Discount Account Code', key: 'discountAccountCode', width: 20 },
      { header: 'Is Landed Cost', key: 'isLandedCost', width: 15 },
      { header: 'Customer Name', key: 'customerName', width: 30 },
      { header: 'Project Name', key: 'projectName', width: 25 },
      { header: 'CGST Rate %', key: 'cgstRate', width: 12 },
      { header: 'SGST Rate %', key: 'sgstRate', width: 12 },
      { header: 'IGST Rate %', key: 'igstRate', width: 12 },
      { header: 'CESS Rate %', key: 'cessRate', width: 12 },
      { header: 'CGST(FCY)', key: 'cgstFcy', width: 15 },
      { header: 'SGST(FCY)', key: 'sgstFcy', width: 15 },
      { header: 'IGST(FCY)', key: 'igstFcy', width: 15 },
      { header: 'CESS(FCY)', key: 'cessFcy', width: 15 },
      { header: 'CGST', key: 'cgst', width: 15 },
      { header: 'SGST', key: 'sgst', width: 15 },
      { header: 'IGST', key: 'igst', width: 15 },
      { header: 'CESS', key: 'cess', width: 15 },
      { header: 'CF.Round Off', key: 'roundOff', width: 12 },
      { header: 'CF.VENDOR CIRCUIT ID -', key: 'vendorCircuitId', width: 25 },
      { header: 'CF.ACCOUNT / RELATIONSHIP NO - ', key: 'accountRelationshipNo', width: 30 },
      { header: 'CF.PO ARC VALUE - Rs', key: 'poArcValue', width: 18 },
      { header: 'CF.Link Acceptance Date -', key: 'linkAcceptanceDate', width: 20 },
      { header: 'CF.Bill Period From Date -', key: 'billPeriodFromDate', width: 20 },
      { header: 'CF.Bill Period To Date -', key: 'billPeriodToDate', width: 20 },
      { header: 'CF.WAREHOUSE -', key: 'warehouse', width: 20 },
      { header: 'CF.H8 Inward Number -', key: 'h8InwardNumber', width: 20 },
      { header: 'CF.Entry Date', key: 'entryDate', width: 15 },
      { header: 'CF.Bandwidth (Mbps)', key: 'bandwidthMbps', width: 18 }
    ];
  }

  /**
   * Get Vodafone-specific column definitions
   */
  getVodafoneColumns() {
    return [
      { header: 'Filename', key: 'filename', width: 25 },
      { header: 'Bill Date', key: 'billDate', width: 15 },
      { header: 'Due Date', key: 'dueDate', width: 15 },
      { header: 'Bill ID', key: 'billId', width: 20 },
      { header: 'Vendor Name', key: 'vendorName', width: 25 },
      { header: 'Payment Terms Label', key: 'paymentTermsLabel', width: 20 },
      { header: 'CF.VENDOR CIRCUIT ID', key: 'vendorCircuitId', width: 25 },
      { header: 'Bill Number', key: 'billNumber', width: 25 },
      { header: 'Purchase Order', key: 'purchaseOrder', width: 25 },
      { header: 'Currency Code', key: 'currencyCode', width: 15 },
      { header: 'Sub Total', key: 'subTotal', width: 15 },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Branch ID', key: 'branchId', width: 15 },
      { header: 'Branch Name', key: 'branchName', width: 25 },
      { header: 'Item Name', key: 'itemName', width: 25 },
      { header: 'Account', key: 'account', width: 20 },
      { header: 'Description', key: 'description', width: 35 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Usage Unit', key: 'usageUnit', width: 15 },
      { header: 'Tax Amount', key: 'taxAmount', width: 15 },
      { header: 'Source of Supply', key: 'sourceOfSupply', width: 20 },
      { header: 'Destination of Supply', key: 'destinationOfSupply', width: 20 },
      { header: 'GST Identification Number (GSTIN)', key: 'gstin', width: 25 },
      { header: 'Line Item Location Name', key: 'lineItemLocationName', width: 25 },
      { header: 'GSTIN_ISD/UIN No', key: 'gstinIsdUin', width: 25 },
      { header: 'HSN/SAC', key: 'hsnSac', width: 15 },
      { header: 'Purchase Order Number', key: 'purchaseOrderNumber', width: 25 },
      { header: 'Tax Name', key: 'taxName', width: 15 },
      { header: 'Tax Percentage', key: 'taxPercentage', width: 15 },
      { header: 'Item Type', key: 'itemType', width: 15 },
      { header: 'CGST Rate %', key: 'cgstRate', width: 12 },
      { header: 'SGST Rate %', key: 'sgstRate', width: 12 },
      { header: 'IGST Rate %', key: 'igstRate', width: 12 },
      { header: 'CGST (FCY)', key: 'cgstFcy', width: 15 },
      { header: 'SGST (FCY)', key: 'sgstFcy', width: 15 },
      { header: 'IGST (FCY)', key: 'igstFcy', width: 15 },
      { header: 'CGST', key: 'cgst', width: 15 },
      { header: 'SGST', key: 'sgst', width: 15 },
      { header: 'IGST', key: 'igst', width: 15 },
      { header: 'CF.Round Off', key: 'roundOff', width: 12 },
      { header: 'CF.PO ARC VALUE - Rs', key: 'poArcValue', width: 18 },
      { header: 'Charges of the Periods', key: 'chargesOfPeriods', width: 25 },
      { header: 'CF.Bandwidth (Mbps)', key: 'bandwidthMbps', width: 18 },
      { header: 'Relationship Number', key: 'relationshipNumber', width: 20 },
      { header: 'Control Number', key: 'controlNumber', width: 18 },
      { header: 'Circuit ID', key: 'circuitId', width: 25 },
      { header: 'Company Name', key: 'companyName', width: 30 },
      { header: 'City', key: 'city', width: 20 },
      { header: 'State', key: 'state', width: 20 },
      { header: 'PIN', key: 'pin', width: 12 },
      { header: 'Contact Person', key: 'contactPerson', width: 25 },
      { header: 'Contact Number', key: 'contactNumber', width: 18 },
      { header: 'Installation Address', key: 'installationAddress', width: 40 }
    ];
  }

  /**
   * Get Airtel-specific column definitions (110 columns matching ZOHO format)
   */
  getAirtelColumns() {
    const airtelTemplate = require('../config/airtelTemplate');
    return airtelTemplate.columns.map(col => ({
      header: col.name,
      key: col.dbField,
      width: 20
    }));
  }

  /**
   * Get Indus-specific column definitions (110 columns matching ZOHO format)
   */
  getIndusColumns() {
    const indusTemplate = require('../config/indusTemplate');
    return indusTemplate.columns.map(col => ({
      header: col.name,
      key: col.dbField,
      width: 20
    }));
  }

  /**
   * Get Ascend-specific column definitions (109 columns matching ZOHO format)
   */
  getAscendColumns() {
    const ascendTemplate = require('../config/ascendTemplate');
    return ascendTemplate.columns.map(col => ({
      header: col.name,
      key: col.dbField,
      width: 20
    }));
  }

  /**
   * Get Sify-specific column definitions (109 columns matching ZOHO format)
   */
  getSifyColumns() {
    const sifyTemplate = require('../config/sifyTemplate');
    return sifyTemplate.columns.map(col => ({
      header: col.name,
      key: col.dbField,
      width: 20
    }));
  }

  /**
   * Get BSNL-specific column definitions (109 columns matching ZOHO format)
   */
  getBsnlColumns() {
    const bsnlTemplate = require('../config/bsnlTemplate');
    return bsnlTemplate.columns.map(col => ({
      header: col.name,
      key: col.dbField,
      width: 20
    }));
  }

  /**
   * Define column headers based on the template and vendor type
   */
  defineColumns(customFields = null, vendorType = 'vodafone') {
    let columns;

    if (customFields) {
      columns = customFields;
    } else if (vendorType === 'tata') {
      columns = this.getTataColumns();
    } else if (vendorType === 'airtel') {
      columns = this.getAirtelColumns();
    } else if (vendorType === 'indus') {
      columns = this.getIndusColumns();
    } else if (vendorType === 'ascend') {
      columns = this.getAscendColumns();
    } else if (vendorType === 'sify') {
      columns = this.getSifyColumns();
    } else if (vendorType === 'bsnl') {
      columns = this.getBsnlColumns();
    } else {
      columns = this.getVodafoneColumns();
    }

    this.worksheet.columns = columns;

    // Style header row
    this.styleHeaderRow();
  }

  /**
   * Style the header row
   */
  styleHeaderRow() {
    const headerRow = this.worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 20;
  }

  /**
   * Map extracted data to Excel row format for Tata
   */
  mapDataToRowTata(extractedData, filename) {
    // Build vendor notes
    const vendorNotes = [
      extractedData.accountNumber ? `A/C - ${extractedData.accountNumber}` : '',
      extractedData.circuitId ? `CIRCUIT ID - ${extractedData.circuitId}` : '',
      extractedData.poNumber ? `P.O.NO. - ${extractedData.poNumber}` : '',
      extractedData.linkCommissioningDate ? `LINK COMMISSIONING DATE - ${extractedData.linkCommissioningDate}` : '',
      extractedData.annualCharges ? `ARC - RS. ${extractedData.annualCharges}` : ''
    ].filter(Boolean).join('\n');

    return {
      filename: filename || extractedData.filename,
      base: null,
      billDate: this.formatDate(extractedData.billDate),
      dueDate: this.formatDate(extractedData.dueDate),
      billId: extractedData.invoiceNumber || extractedData.billId,
      vendorName: extractedData.vendorName || 'TATA TELESERVICES LTD',
      entityDiscountPercent: null,
      paymentTerms: '15',
      paymentTermsLabel: 'Net 15',
      billNumber: extractedData.billNumber || extractedData.invoiceNumber,
      purchaseOrder: extractedData.poNumber || extractedData.purchaseOrder,
      currencyCode: 'INR',
      exchangeRate: null,
      subTotal: extractedData.subTotal || extractedData.rentalCharges,
      total: extractedData.currentCharges || extractedData.totalPayable || extractedData.total,
      balance: null,
      tcsAmount: '',
      vendorNotes: vendorNotes,
      termsConditions: '',
      adjustment: null,
      adjustmentDescription: null,
      branchId: null,
      branchName: extractedData.state || 'GUJARAT REGION',
      locationName: extractedData.state || 'GUJARAT REGION',
      isInclusiveTax: null,
      submittedBy: null,
      approvedBy: '',
      submittedDate: null,
      approvedDate: null,
      billStatus: null,
      createdBy: null,
      productId: null,
      itemName: extractedData.billPlanName || 'Premium Leased Line Intra Circle DLC Package',
      account: extractedData.account,
      accountCode: null,
      description: extractedData.description || `Bandwidth Advance Rental {charges from ${extractedData.servicePeriodFrom || ''} to ${extractedData.servicePeriodTo || ''}}`,
      quantity: extractedData.quantity || 1,
      usageUnit: extractedData.usageUnit || 'Month',
      taxAmount: extractedData.taxAmount || extractedData.totalTax,
      itemTotal: extractedData.subTotal,
      isBillable: null,
      referenceInvoiceType: null,
      sourceOfSupply: extractedData.sourceOfSupply || extractedData.state,
      destinationOfSupply: extractedData.destinationOfSupply || extractedData.state,
      gstTreatment: null,
      gstin: extractedData.customerGstin || extractedData.gstin,
      tdsCalculationType: null,
      tdsTaxId: null,
      tdsName: null,
      tdsPercentage: null,
      tdsSectionCode: null,
      tdsSection: null,
      tdsAmount: null,
      tcsTaxName: null,
      tcsPercentage: null,
      natureOfCollection: null,
      sku: null,
      lineItemLocationName: extractedData.lineItemLocationName || extractedData.installationAddress,
      rate: extractedData.rate || extractedData.subTotal,
      discountType: null,
      isDiscountBeforeTax: null,
      discount: null,
      discountAmount: null,
      hsnSac: extractedData.hsnSac || extractedData.hsnCode || '998414',
      purchaseOrderNumber: extractedData.poNumber,
      taxId: null,
      taxName: 'GST',
      taxPercentage: '18',
      taxType: null,
      itemTdsName: null,
      itemTdsPercentage: null,
      itemTdsAmount: null,
      itemTdsSectionCode: null,
      itemTdsSection: null,
      itemExemptionCode: null,
      itemType: 'Service',
      reverseChargeTaxName: null,
      reverseChargeTaxRate: null,
      reverseChargeTaxType: null,
      supplyType: null,
      itcEligibility: null,
      entityDiscountAmount: null,
      discountAccount: null,
      discountAccountCode: null,
      isLandedCost: null,
      customerName: extractedData.companyName,
      projectName: null,
      cgstRate: extractedData.cgstRate || (extractedData.cgst ? '9.0' : null),
      sgstRate: extractedData.sgstRate || (extractedData.sgst ? '9.0' : null),
      igstRate: extractedData.igstRate || (extractedData.igst ? '0' : null),
      cessRate: null,
      cgstFcy: null,
      sgstFcy: null,
      igstFcy: null,
      cessFcy: null,
      cgst: extractedData.cgstAmount || extractedData.cgst,
      sgst: extractedData.sgstAmount || extractedData.sgst,
      igst: extractedData.igstAmount,
      cess: null,
      roundOff: null,
      vendorCircuitId: extractedData.circuitId || extractedData.tataTeleNumber,
      accountRelationshipNo: extractedData.accountNumber,
      poArcValue: extractedData.annualCharges,
      linkAcceptanceDate: extractedData.linkCommissioningDate,
      billPeriodFromDate: extractedData.servicePeriodFrom,
      billPeriodToDate: extractedData.servicePeriodTo,
      warehouse: null,
      h8InwardNumber: null,
      entryDate: null,
      bandwidthMbps: extractedData.bandwidth,
      customerGstin: extractedData.customerGstin || extractedData.gstin
    };
  }

  /**
   * Map extracted data to Excel row format for Vodafone
   */
  mapDataToRowVodafone(extractedData, filename) {
    return {
      filename: filename || extractedData.filename,
      billDate: this.formatDate(extractedData.billDate),
      dueDate: this.formatDate(extractedData.dueDate),
      billId: extractedData.invoiceNumber || extractedData.billId,
      vendorName: extractedData.vendorName || 'Vodafone Idea',
      paymentTermsLabel: extractedData.paymentTermsLabel || 'Net 30',
      vendorCircuitId: extractedData.circuitId,
      billNumber: extractedData.invoiceNumber,
      purchaseOrder: extractedData.poNumber || extractedData.purchaseOrder,
      currencyCode: extractedData.currencyCode || 'INR',
      subTotal: extractedData.subTotal,
      total: extractedData.totalPayable || extractedData.total,
      branchId: extractedData.branchId || '1',
      branchName: extractedData.branchName || 'Main Branch',
      itemName: extractedData.itemName || 'MPLS Service',
      account: extractedData.account,
      description: extractedData.description || extractedData.planName,
      quantity: extractedData.quantity || 1,
      usageUnit: extractedData.usageUnit || 'Month',
      taxAmount: extractedData.tax || extractedData.taxAmount,
      sourceOfSupply: extractedData.sourceOfSupply || 'India',
      destinationOfSupply: extractedData.destinationOfSupply || 'India',
      gstin: extractedData.gstin,
      lineItemLocationName: extractedData.lineItemLocationName,
      gstinIsdUin: extractedData.gstinIsdUin,
      hsnSac: extractedData.hsnSac || '998414',
      purchaseOrderNumber: extractedData.poNumber,
      taxName: extractedData.taxName || 'GST',
      taxPercentage: extractedData.taxPercentage || 0.18,
      itemType: extractedData.itemType || 'Service',
      cgstRate: extractedData.cgst || 0.09,
      sgstRate: extractedData.sgst || 0.09,
      igstRate: extractedData.igstRate || 0,
      cgstFcy: extractedData.cgstFcy,
      sgstFcy: extractedData.sgstFcy,
      igstFcy: extractedData.igstFcy,
      cgst: extractedData.cgstAmount,
      sgst: extractedData.sgstAmount,
      igst: extractedData.igstAmount,
      roundOff: extractedData.roundOff,
      poArcValue: extractedData.poArcValue || extractedData.subTotal,
      chargesOfPeriods: extractedData.chargesOfPeriods,
      bandwidthMbps: extractedData.bandwidth || extractedData.bandwidthMbps,
      relationshipNumber: extractedData.relationshipNumber,
      controlNumber: extractedData.controlNumber,
      circuitId: extractedData.circuitId,
      companyName: extractedData.companyName,
      city: extractedData.city,
      state: extractedData.state,
      pin: extractedData.pin,
      contactPerson: extractedData.contactPerson,
      contactNumber: extractedData.contactNumber,
      installationAddress: extractedData.installationAddress
    };
  }

  /**
   * Map extracted data to Excel row format for Airtel (110 columns)
   */
  mapDataToRowAirtel(extractedData, filename) {
    const airtelTemplate = require('../config/airtelTemplate');

    return {
      // Column 1-10: Basic Info
      base: extractedData.base || null,
      bill_date: this.formatDate(extractedData.billDate),
      due_date: this.formatDate(extractedData.dueDate),
      bill_id: extractedData.billId || null,
      vendor_name: extractedData.vendorName || airtelTemplate.defaults.vendor_name,
      entity_discount_percent: extractedData.entityDiscountPercent || 0,
      payment_terms: extractedData.paymentTerms || airtelTemplate.defaults.payment_terms,
      payment_terms_label: extractedData.paymentTermsLabel || airtelTemplate.defaults.payment_terms_label,
      bill_number: extractedData.invoiceNumber || extractedData.billNumber,
      purchase_order: extractedData.purchaseOrder || extractedData.poNumber || null,

      // Column 11-20: Amounts & Adjustments
      currency_code: extractedData.currencyCode || airtelTemplate.defaults.currency_code,
      exchange_rate: extractedData.exchangeRate || airtelTemplate.defaults.exchange_rate,
      subtotal: extractedData.subTotal,
      total: extractedData.totalPayable || extractedData.total,
      balance: extractedData.balance || 0,
      tcs_amount: extractedData.tcsAmount || null,
      vendor_notes: extractedData.vendorNotes || '',
      terms_conditions: extractedData.termsConditions || '',
      adjustment: extractedData.adjustment || null,
      adjustment_description: extractedData.adjustmentDescription || null,

      // Column 21-30: Branch & Status
      branch_id: extractedData.branchId || null,
      branch_name: extractedData.branchName || extractedData.state || null,
      location_name: extractedData.locationName || extractedData.branchName || null,
      is_inclusive_tax: extractedData.isInclusiveTax || null,
      submitted_by: extractedData.submittedBy || null,
      approved_by: extractedData.approvedBy || null,
      submitted_date: this.formatDate(extractedData.submittedDate) || null,
      approved_date: this.formatDate(extractedData.approvedDate) || null,
      bill_status: extractedData.billStatus || null,
      created_by: extractedData.createdBy || null,

      // Column 31-40: Line Item Details
      product_id: extractedData.productId || null,
      item_name: extractedData.itemName || extractedData.description || null,
      account: extractedData.account || null,
      account_code: extractedData.accountCode || null,
      description: extractedData.description || null,
      quantity: extractedData.quantity || 1,
      usage_unit: extractedData.usageUnit || 'Month',
      tax_amount: extractedData.taxAmount || extractedData.tax || null,
      item_total: extractedData.itemTotal || extractedData.total,
      is_billable: extractedData.isBillable || null,

      // Column 41-50: Supply & GST
      reference_invoice_type: extractedData.referenceInvoiceType || null,
      source_of_supply: extractedData.sourceOfSupply || 'India',
      destination_of_supply: extractedData.destinationOfSupply || 'India',
      gst_treatment: extractedData.gstTreatment || null,
      gstin: extractedData.gstin || null,
      tds_calculation_type: extractedData.tdsCalculationType || null,
      tds_tax_id: extractedData.tdsTaxId || null,
      tds_name: extractedData.tdsName || null,
      tds_percentage: extractedData.tdsPercentage || null,
      tds_section_code: extractedData.tdsSectionCode || null,

      // Column 51-63: TDS/TCS & Item Details
      tds_section: extractedData.tdsSection || null,
      tds_amount: extractedData.tdsAmount || null,
      tcs_tax_name: extractedData.tcsTaxName || null,
      tcs_percentage: extractedData.tcsPercentage || null,
      nature_of_collection: extractedData.natureOfCollection || null,
      sku: extractedData.sku || null,
      line_item_location_name: extractedData.lineItemLocationName || null,
      rate: extractedData.rate || null,
      discount_type: extractedData.discountType || null,
      is_discount_before_tax: extractedData.isDiscountBeforeTax || null,
      discount: extractedData.discount || null,
      discount_amount: extractedData.discountAmount || null,
      hsn_sac: extractedData.hsnSac || '998422',

      // Column 64-80: Tax Details
      po_number: extractedData.poNumber || null,
      tax_id: extractedData.taxId || null,
      tax_name: extractedData.taxName || null,
      tax_percentage: extractedData.taxPercentage ? String(parseFloat(extractedData.taxPercentage).toFixed(2)) : null,
      tax_type: extractedData.taxType || null,
      item_tds_name: extractedData.itemTdsName || null,
      item_tds_percentage: extractedData.itemTdsPercentage || null,
      item_tds_amount: extractedData.itemTdsAmount || null,
      item_tds_section_code: extractedData.itemTdsSectionCode || null,
      item_tds_section: extractedData.itemTdsSection || null,
      item_exemption_code: extractedData.itemExemptionCode || null,
      item_type: extractedData.itemType || 'Service',
      reverse_charge_tax_name: extractedData.reverseChargeTaxName || null,
      reverse_charge_tax_rate: extractedData.reverseChargeTaxRate || null,
      reverse_charge_tax_type: extractedData.reverseChargeTaxType || null,
      supply_type: extractedData.supplyType || null,
      itc_eligibility: extractedData.itcEligibility || null,

      // Column 81-98: Discounts & GST Components
      entity_discount_amount: extractedData.entityDiscountAmount || null,
      discount_account: extractedData.discountAccount || null,
      discount_account_code: extractedData.discountAccountCode || null,
      is_landed_cost: extractedData.isLandedCost || null,
      customer_name: extractedData.customerName || null,
      project_name: extractedData.projectName || null,
      cgst_rate: extractedData.cgstRate ? parseFloat(extractedData.cgstRate).toFixed(2) : null,
      sgst_rate: extractedData.sgstRate ? parseFloat(extractedData.sgstRate).toFixed(2) : null,
      igst_rate: extractedData.igstRate ? parseFloat(extractedData.igstRate).toFixed(2) : 0,
      cess_rate: extractedData.cessRate ? parseFloat(extractedData.cessRate).toFixed(2) : 0,
      cgst_fcy: extractedData.cgstFcy || null,
      sgst_fcy: extractedData.sgstFcy || null,
      igst_fcy: extractedData.igstFcy || null,
      cess_fcy: extractedData.cessFcy || null,
      cgst: extractedData.cgstAmount || extractedData.cgst,
      sgst: extractedData.sgstAmount || extractedData.sgst,
      igst: extractedData.igstAmount || extractedData.igst || null,
      cess: extractedData.cessAmount || extractedData.cess || null,

      // Column 99-110: Custom Fields
      cf_round_off: extractedData.roundOff || null,
      cf_vendor_circuit_id: extractedData.circuitId || extractedData.vendorCircuitId || null,
      cf_account_relationship_no: extractedData.relationshipNumber || extractedData.accountNumber,
      cf_po_arc_value: extractedData.poArcValue || null,
      cf_link_acceptance_date: this.formatDate(extractedData.linkAcceptanceDate) || null,
      cf_bill_period_from: this.formatDate(extractedData.billPeriodFrom) || null,
      cf_bill_period_to: this.formatDate(extractedData.billPeriodTo) || null,
      cf_warehouse: extractedData.warehouse || null,
      cf_h8_inward_number: extractedData.h8InwardNumber || null,
      cf_entry_date: this.formatDate(extractedData.entryDate) || null,
      cf_bandwidth: extractedData.bandwidth || extractedData.bandwidthMbps || null,
      customer_gstin: extractedData.customerGstin
    };
  }

  /**
   * Map extracted data to Excel row format for Indus (110 columns)
   */
  mapDataToRowIndus(extractedData, filename) {
    const indusTemplate = require('../config/indusTemplate');

    return {
      // Column 1-10: Basic Info
      base: extractedData.base || null,
      bill_date: this.formatDate(extractedData.billDate),
      due_date: this.formatDate(extractedData.dueDate),
      bill_id: extractedData.billId || extractedData.cin,
      vendor_name: extractedData.vendorName || indusTemplate.defaults.vendor_name,
      entity_discount_percent: extractedData.entityDiscountPercent || 0,
      payment_terms: extractedData.paymentTerms || indusTemplate.defaults.payment_terms,
      payment_terms_label: extractedData.paymentTermsLabel || indusTemplate.defaults.payment_terms_label,
      bill_number: extractedData.invoiceNumber || extractedData.billNumber,
      purchase_order: extractedData.purchaseOrder || extractedData.poNumber,

      // Column 11-20: Amounts & Adjustments
      currency_code: extractedData.currencyCode || indusTemplate.defaults.currency_code,
      exchange_rate: extractedData.exchangeRate || indusTemplate.defaults.exchange_rate,
      subtotal: extractedData.subTotal,
      total: extractedData.totalPayable || extractedData.total,
      balance: extractedData.balance || 0,
      tcs_amount: extractedData.tcsAmount,
      vendor_notes: extractedData.vendorNotes || '',
      terms_conditions: extractedData.termsConditions || '',
      adjustment: extractedData.adjustment,
      adjustment_description: extractedData.adjustmentDescription,

      // Column 21-30: Branch & Status
      branch_id: extractedData.branchId,
      branch_name: extractedData.circle || extractedData.branchName,
      location_name: extractedData.state || extractedData.locationName,
      is_inclusive_tax: extractedData.isInclusiveTax,
      submitted_by: extractedData.submittedBy,
      approved_by: extractedData.approvedBy,
      submitted_date: this.formatDate(extractedData.submittedDate),
      approved_date: this.formatDate(extractedData.approvedDate),
      bill_status: extractedData.billStatus,
      created_by: extractedData.createdBy,

      // Column 31-40: Line Item Details
      product_id: extractedData.productId,
      item_name: extractedData.itemName || extractedData.description,
      account: extractedData.account,
      account_code: extractedData.accountCode,
      description: extractedData.description,
      quantity: extractedData.quantity || 1,
      usage_unit: extractedData.usageUnit || 'Month',
      tax_amount: extractedData.taxAmount || extractedData.tax,
      item_total: extractedData.itemTotal || extractedData.total,
      is_billable: extractedData.isBillable,

      // Column 41-50: Supply & GST
      reference_invoice_type: extractedData.referenceInvoiceType,
      source_of_supply: extractedData.sourceOfSupply || extractedData.state,
      destination_of_supply: extractedData.destinationOfSupply || extractedData.state,
      gst_treatment: extractedData.gstTreatment,
      gstin: extractedData.gstin,
      tds_calculation_type: extractedData.tdsCalculationType,
      tds_tax_id: extractedData.tdsTaxId,
      tds_name: extractedData.tdsName,
      tds_percentage: extractedData.tdsPercentage,
      tds_section_code: extractedData.tdsSectionCode,

      // Column 51-63: TDS/TCS & Item Details
      tds_section: extractedData.tdsSection,
      tds_amount: extractedData.tdsAmount,
      tcs_tax_name: extractedData.tcsTaxName,
      tcs_percentage: extractedData.tcsPercentage,
      nature_of_collection: extractedData.natureOfCollection,
      sku: extractedData.sku,
      line_item_location_name: extractedData.lineItemLocationName,
      rate: extractedData.rate,
      discount_type: extractedData.discountType,
      is_discount_before_tax: extractedData.isDiscountBeforeTax,
      discount: extractedData.discount,
      discount_amount: extractedData.discountAmount,
      hsn_sac: extractedData.hsnSac || '998599',

      // Column 64-80: Tax Details
      po_number: extractedData.poNumber,
      tax_id: extractedData.taxId,
      tax_name: extractedData.taxName,
      tax_percentage: extractedData.taxPercentage,
      tax_type: extractedData.taxType,
      item_tds_name: extractedData.itemTdsName,
      item_tds_percentage: extractedData.itemTdsPercentage,
      item_tds_amount: extractedData.itemTdsAmount,
      item_tds_section_code: extractedData.itemTdsSectionCode,
      item_tds_section: extractedData.itemTdsSection,
      item_exemption_code: extractedData.itemExemptionCode,
      item_type: extractedData.itemType || 'Service',
      reverse_charge_tax_name: extractedData.reverseChargeTaxName,
      reverse_charge_tax_rate: extractedData.reverseChargeTaxRate,
      reverse_charge_tax_type: extractedData.reverseChargeTaxType,
      supply_type: extractedData.supplyType,
      itc_eligibility: extractedData.itcEligibility,

      // Column 81-98: Discounts & GST Components
      entity_discount_amount: extractedData.entityDiscountAmount,
      discount_account: extractedData.discountAccount,
      discount_account_code: extractedData.discountAccountCode,
      is_landed_cost: extractedData.isLandedCost,
      customer_name: extractedData.customerName,
      project_name: extractedData.projectName,
      cgst_rate: extractedData.cgstRate || 0,
      sgst_rate: extractedData.sgstRate || 0,
      igst_rate: extractedData.igstRate || 0,
      cess_rate: extractedData.cessRate || 0,
      cgst_fcy: extractedData.cgstFcy,
      sgst_fcy: extractedData.sgstFcy,
      igst_fcy: extractedData.igstFcy,
      cess_fcy: extractedData.cessFcy,
      cgst: extractedData.cgstAmount || extractedData.cgst,
      sgst: extractedData.sgstAmount || extractedData.sgst,
      igst: extractedData.igstAmount || extractedData.igst,
      cess: extractedData.cessAmount || extractedData.cess,

      // Column 99-110: Custom Fields
      cf_round_off: extractedData.roundOff,
      cf_vendor_circuit_id: extractedData.circuitId || extractedData.vendorCircuitId,
      cf_account_relationship_no: extractedData.accountNumber || extractedData.relationshipNumber,
      cf_po_arc_value: extractedData.poArcValue,
      cf_link_acceptance_date: this.formatDate(extractedData.linkAcceptanceDate),
      cf_bill_period_from: this.formatDate(extractedData.billPeriodFrom),
      cf_bill_period_to: this.formatDate(extractedData.billPeriodTo),
      cf_warehouse: extractedData.warehouse,
      cf_h8_inward_number: extractedData.h8InwardNumber,
      cf_entry_date: this.formatDate(extractedData.entryDate),
      cf_bandwidth: extractedData.bandwidth || extractedData.bandwidthMbps,
      customer_gstin: extractedData.customerGstin
    };
  }

  /**
   * Map extracted data to Excel row format for Ascend (109 columns)
   */
  mapDataToRowAscend(extractedData, filename) {
    const ascendTemplate = require('../config/ascendTemplate');

    return {
      // Column 1-10: Basic Info
      base: extractedData.base || null,
      bill_date: this.formatDate(extractedData.billDate),
      due_date: this.formatDate(extractedData.dueDate),
      bill_id: extractedData.billId || null,
      vendor_name: extractedData.vendorName || ascendTemplate.defaults.vendor_name,
      entity_discount_percent: extractedData.entityDiscountPercent || 0,
      payment_terms: extractedData.paymentTerms || ascendTemplate.defaults.payment_terms,
      payment_terms_label: extractedData.paymentTermsLabel || ascendTemplate.defaults.payment_terms_label,
      bill_number: extractedData.invoiceNumber || extractedData.billNumber,
      purchase_order: extractedData.purchaseOrder || extractedData.poNumber,

      // Column 11-20: Amounts & Adjustments
      currency_code: extractedData.currencyCode || ascendTemplate.defaults.currency_code,
      exchange_rate: extractedData.exchangeRate || ascendTemplate.defaults.exchange_rate,
      subtotal: extractedData.subTotal,
      total: extractedData.totalPayable || extractedData.total,
      balance: extractedData.balance || 0,
      tcs_amount: extractedData.tcsAmount,
      vendor_notes: extractedData.vendorNotes || '',
      terms_conditions: extractedData.termsConditions || '',
      adjustment: extractedData.adjustment,
      adjustment_description: extractedData.adjustmentDescription,

      // Column 21-30: Branch & Status
      branch_id: extractedData.branchId,
      branch_name: extractedData.branchName,
      location_name: extractedData.locationName || extractedData.branchName,
      is_inclusive_tax: extractedData.isInclusiveTax,
      submitted_by: extractedData.submittedBy,
      approved_by: extractedData.approvedBy,
      submitted_date: this.formatDate(extractedData.submittedDate),
      approved_date: this.formatDate(extractedData.approvedDate),
      bill_status: extractedData.billStatus,
      created_by: extractedData.createdBy,

      // Column 31-40: Line Item Details
      product_id: extractedData.productId,
      item_name: extractedData.itemName || extractedData.description || ascendTemplate.defaults.item_name,
      account: extractedData.account || ascendTemplate.defaults.account,
      account_code: extractedData.accountCode,
      description: extractedData.description || extractedData.itemName,
      quantity: extractedData.quantity || ascendTemplate.defaults.quantity,
      usage_unit: extractedData.usageUnit || ascendTemplate.defaults.usage_unit,
      tax_amount: extractedData.taxAmount || extractedData.tax,
      item_total: extractedData.itemTotal || extractedData.subTotal,
      is_billable: extractedData.isBillable,

      // Column 41-50: Supply & GST
      reference_invoice_type: extractedData.referenceInvoiceType,
      source_of_supply: extractedData.sourceOfSupply || 'India',
      destination_of_supply: extractedData.destinationOfSupply || 'India',
      gst_treatment: extractedData.gstTreatment,
      gstin: extractedData.vendorGSTIN,
      tds_calculation_type: extractedData.tdsCalculationType,
      tds_tax_id: extractedData.tdsTaxId,
      tds_name: extractedData.tdsName,
      tds_percentage: extractedData.tdsPercentage,
      tds_section_code: extractedData.tdsSectionCode,

      // Column 51-63: TDS/TCS & Item Details
      tds_section: extractedData.tdsSection,
      tds_amount: extractedData.tdsAmount,
      tcs_tax_name: extractedData.tcsTaxName,
      tcs_percentage: extractedData.tcsPercentage,
      nature_of_collection: extractedData.natureOfCollection,
      sku: extractedData.sku,
      line_item_location_name: extractedData.lineItemLocationName,
      rate: extractedData.rate,
      discount_type: extractedData.discountType,
      is_discount_before_tax: extractedData.isDiscountBeforeTax,
      discount: extractedData.discount,
      discount_amount: extractedData.discountAmount,
      hsn_sac: extractedData.hsnSac || '998599',

      // Column 64-80: Tax Details
      po_number: extractedData.poNumber,
      tax_id: extractedData.taxId,
      tax_name: extractedData.taxName || 'GST',
      tax_percentage: extractedData.taxPercentage,
      tax_type: extractedData.taxType,
      item_tds_name: extractedData.itemTdsName,
      item_tds_percentage: extractedData.itemTdsPercentage,
      item_tds_amount: extractedData.itemTdsAmount,
      item_tds_section_code: extractedData.itemTdsSectionCode,
      item_tds_section: extractedData.itemTdsSection,
      item_exemption_code: extractedData.itemExemptionCode,
      item_type: extractedData.itemType || 'Service',
      reverse_charge_tax_name: extractedData.reverseChargeTaxName,
      reverse_charge_tax_rate: extractedData.reverseChargeTaxRate,
      reverse_charge_tax_type: extractedData.reverseChargeTaxType,
      supply_type: extractedData.supplyType,
      itc_eligibility: extractedData.itcEligibility,

      // Column 81-86: Entity & Project
      entity_discount_amount: extractedData.entityDiscountAmount,
      discount_account: extractedData.discountAccount,
      discount_account_code: extractedData.discountAccountCode,
      is_landed_cost: extractedData.isLandedCost,
      customer_name: extractedData.customerName,
      project_name: extractedData.projectName,

      // Column 87-98: GST Rates & Amounts
      cgst_rate: extractedData.cgstRate,
      sgst_rate: extractedData.sgstRate,
      igst_rate: extractedData.igstRate,
      cess_rate: extractedData.cessRate,
      cgst_fcy: extractedData.cgstFcy,
      sgst_fcy: extractedData.sgstFcy,
      igst_fcy: extractedData.igstFcy,
      cess_fcy: extractedData.cessFcy,
      cgst: extractedData.cgstAmount || extractedData.cgst,
      sgst: extractedData.sgstAmount || extractedData.sgst,
      igst: extractedData.igstAmount || extractedData.igst,
      cess: extractedData.cessAmount || extractedData.cess,

      // Column 99-109: Custom Fields
      cf_round_off: extractedData.roundOff,
      cf_vendor_circuit_id: extractedData.circuitId || extractedData.vendorCircuitId,
      cf_account_relationship_no: extractedData.accountNumber || extractedData.relationshipNumber,
      cf_po_arc_value: extractedData.poArcValue,
      cf_link_acceptance_date: this.formatDate(extractedData.linkAcceptanceDate),
      cf_bill_period_from: this.formatDate(extractedData.billPeriodFrom),
      cf_bill_period_to: this.formatDate(extractedData.billPeriodTo),
      cf_warehouse: extractedData.warehouse,
      cf_h8_inward_number: extractedData.h8InwardNumber,
      cf_entry_date: this.formatDate(extractedData.entryDate),
      cf_bandwidth: extractedData.bandwidth || extractedData.bandwidthMbps
    };
  }

  /**
   * Map extracted data to Excel row format for Sify (109 columns)
   */
  mapDataToRowSify(extractedData, filename) {
    const sifyTemplate = require('../config/sifyTemplate');

    return {
      // Column 1-10: Basic Info
      base: extractedData.base || null,
      bill_date: this.formatDate(extractedData.billDate),
      due_date: this.formatDate(extractedData.dueDate),
      bill_id: extractedData.billId || extractedData.cin,
      vendor_name: extractedData.vendorName || sifyTemplate.defaults.vendor_name,
      entity_discount_percent: extractedData.entityDiscountPercent || 0,
      payment_terms: extractedData.paymentTerms || sifyTemplate.defaults.payment_terms,
      payment_terms_label: extractedData.paymentTermsLabel || sifyTemplate.defaults.payment_terms_label,
      bill_number: extractedData.invoiceNumber || extractedData.billNumber,
      purchase_order: extractedData.purchaseOrder || extractedData.poNumber,

      // Column 11-20: Amounts & Adjustments
      currency_code: extractedData.currencyCode || sifyTemplate.defaults.currency_code,
      exchange_rate: extractedData.exchangeRate || sifyTemplate.defaults.exchange_rate,
      subtotal: extractedData.subTotal,
      total: extractedData.totalPayable || extractedData.total,
      balance: extractedData.balance || 0,
      tcs_amount: extractedData.tcsAmount,
      vendor_notes: extractedData.vendorNotes || '',
      terms_conditions: extractedData.termsConditions || '',
      adjustment: extractedData.adjustment,
      adjustment_description: extractedData.adjustmentDescription,

      // Column 21-30: Branch & Status
      branch_id: extractedData.branchId,
      branch_name: extractedData.branchName,
      location_name: extractedData.locationName || extractedData.branchName,
      is_inclusive_tax: extractedData.isInclusiveTax,
      submitted_by: extractedData.submittedBy,
      approved_by: extractedData.approvedBy,
      submitted_date: this.formatDate(extractedData.submittedDate),
      approved_date: this.formatDate(extractedData.approvedDate),
      bill_status: extractedData.billStatus,
      created_by: extractedData.createdBy,

      // Column 31-40: Line Item Details
      product_id: extractedData.productId,
      item_name: extractedData.itemName || 'Internet Services',
      account: extractedData.account || 'SIFY INTERNET SERVICES',
      account_code: extractedData.accountCode,
      description: extractedData.description || extractedData.itemName,
      quantity: extractedData.quantity || sifyTemplate.defaults.quantity,
      usage_unit: extractedData.usageUnit || sifyTemplate.defaults.usage_unit,
      tax_amount: extractedData.taxAmount || extractedData.tax,
      item_total: extractedData.itemTotal || extractedData.subTotal,
      is_billable: extractedData.isBillable,

      // Column 41-50: Supply & GST
      reference_invoice_type: extractedData.referenceInvoiceType,
      source_of_supply: extractedData.sourceOfSupply || 'India',
      destination_of_supply: extractedData.destinationOfSupply || 'India',
      gst_treatment: extractedData.gstTreatment,
      gstin: extractedData.vendorGSTIN,
      tds_calculation_type: extractedData.tdsCalculationType,
      tds_tax_id: extractedData.tdsTaxId,
      tds_name: extractedData.tdsName,
      tds_percentage: extractedData.tdsPercentage,
      tds_section_code: extractedData.tdsSectionCode,

      // Column 51-63: TDS/TCS & Item Details
      tds_section: extractedData.tdsSection,
      tds_amount: extractedData.tdsAmount,
      tcs_tax_name: extractedData.tcsTaxName,
      tcs_percentage: extractedData.tcsPercentage,
      nature_of_collection: extractedData.natureOfCollection,
      sku: extractedData.sku,
      line_item_location_name: extractedData.lineItemLocationName,
      rate: extractedData.rate,
      discount_type: extractedData.discountType,
      is_discount_before_tax: extractedData.isDiscountBeforeTax,
      discount: extractedData.discount,
      discount_amount: extractedData.discountAmount,
      hsn_sac: extractedData.hsnSac || '998314',

      // Column 64-80: Tax Details
      po_number: extractedData.poNumber,
      tax_id: extractedData.taxId,
      tax_name: extractedData.taxName || 'GST',
      tax_percentage: extractedData.taxPercentage,
      tax_type: extractedData.taxType,
      item_tds_name: extractedData.itemTdsName,
      item_tds_percentage: extractedData.itemTdsPercentage,
      item_tds_amount: extractedData.itemTdsAmount,
      item_tds_section_code: extractedData.itemTdsSectionCode,
      item_tds_section: extractedData.itemTdsSection,
      item_exemption_code: extractedData.itemExemptionCode,
      item_type: extractedData.itemType || sifyTemplate.defaults.item_type,
      reverse_charge_tax_name: extractedData.reverseChargeTaxName,
      reverse_charge_tax_rate: extractedData.reverseChargeTaxRate,
      reverse_charge_tax_type: extractedData.reverseChargeTaxType,
      supply_type: extractedData.supplyType,
      itc_eligibility: extractedData.itcEligibility,

      // Column 81-86: Entity & Project
      entity_discount_amount: extractedData.entityDiscountAmount,
      discount_account: extractedData.discountAccount,
      discount_account_code: extractedData.discountAccountCode,
      is_landed_cost: extractedData.isLandedCost,
      customer_name: extractedData.customerName,
      project_name: extractedData.projectName,

      // Column 87-98: GST Rates & Amounts
      cgst_rate: extractedData.cgstRate,
      sgst_rate: extractedData.sgstRate,
      igst_rate: extractedData.igstRate,
      cess_rate: extractedData.cessRate,
      cgst_fcy: extractedData.cgstFcy,
      sgst_fcy: extractedData.sgstFcy,
      igst_fcy: extractedData.igstFcy,
      cess_fcy: extractedData.cessFcy,
      cgst: extractedData.cgstAmount || extractedData.cgst,
      sgst: extractedData.sgstAmount || extractedData.sgst,
      igst: extractedData.igstAmount || extractedData.igst,
      cess: extractedData.cessAmount || extractedData.cess,

      // Column 99-109: Custom Fields
      cf_round_off: extractedData.roundOff,
      cf_vendor_circuit_id: extractedData.circuitId || extractedData.vendorCircuitId || extractedData.customerCode,
      cf_account_relationship_no: extractedData.accountNumber || extractedData.relationshipNumber,
      cf_po_arc_value: extractedData.poArcValue,
      cf_link_acceptance_date: this.formatDate(extractedData.linkAcceptanceDate),
      cf_bill_period_from: this.formatDate(extractedData.billPeriodFrom),
      cf_bill_period_to: this.formatDate(extractedData.billPeriodTo),
      cf_warehouse: extractedData.warehouse,
      cf_h8_inward_number: extractedData.h8InwardNumber,
      cf_entry_date: this.formatDate(extractedData.entryDate),
      cf_bandwidth: extractedData.bandwidth || extractedData.bandwidthMbps
    };
  }

  /**
   * Map extracted data to Excel row format for BSNL (109 columns)
   */
  mapDataToRowBsnl(extractedData, filename) {
    const bsnlTemplate = require('../config/bsnlTemplate');

    return {
      // Column 1-10: Basic Info
      base: extractedData.base || null,
      bill_date: this.formatDate(extractedData.billDate),
      due_date: this.formatDate(extractedData.dueDate),
      bill_id: extractedData.billId || extractedData.accountNumber,
      vendor_name: extractedData.vendorName || bsnlTemplate.defaults.vendor_name,
      entity_discount_percent: extractedData.entityDiscountPercent || 0,
      payment_terms: extractedData.paymentTerms || bsnlTemplate.defaults.payment_terms,
      payment_terms_label: extractedData.paymentTermsLabel || bsnlTemplate.defaults.payment_terms_label,
      bill_number: extractedData.invoiceNumber || extractedData.billNumber,
      purchase_order: extractedData.purchaseOrder || extractedData.poNumber,

      // Column 11-20: Amounts & Adjustments
      currency_code: extractedData.currencyCode || bsnlTemplate.defaults.currency_code,
      exchange_rate: extractedData.exchangeRate || bsnlTemplate.defaults.exchange_rate,
      subtotal: extractedData.subTotal,
      total: extractedData.totalPayable || extractedData.total,
      balance: extractedData.balance || 0,
      tcs_amount: extractedData.tcsAmount,
      vendor_notes: extractedData.vendorNotes || '',
      terms_conditions: extractedData.termsConditions || '',
      adjustment: extractedData.adjustments,
      adjustment_description: extractedData.adjustmentDescription,

      // Column 21-30: Branch & Status
      branch_id: extractedData.branchId,
      branch_name: extractedData.branchName,
      location_name: extractedData.locationName || extractedData.branchName,
      is_inclusive_tax: extractedData.isInclusiveTax,
      submitted_by: extractedData.submittedBy,
      approved_by: extractedData.approvedBy,
      submitted_date: this.formatDate(extractedData.submittedDate),
      approved_date: this.formatDate(extractedData.approvedDate),
      bill_status: extractedData.billStatus,
      created_by: extractedData.createdBy,

      // Column 31-40: Line Item Details
      product_id: extractedData.productId,
      item_name: extractedData.itemName || extractedData.tariffPlan || bsnlTemplate.defaults.item_name,
      account: extractedData.account || 'BSNL TELECOM SERVICES',
      account_code: extractedData.accountCode || extractedData.accountNumber,
      description: extractedData.description || extractedData.tariffPlan,
      quantity: extractedData.quantity || bsnlTemplate.defaults.quantity,
      usage_unit: extractedData.usageUnit || bsnlTemplate.defaults.usage_unit,
      tax_amount: extractedData.taxAmount || extractedData.tax,
      item_total: extractedData.itemTotal || extractedData.currentCharges,
      is_billable: extractedData.isBillable,

      // Column 41-50: Supply & GST
      reference_invoice_type: extractedData.referenceInvoiceType,
      source_of_supply: extractedData.sourceOfSupply || 'India',
      destination_of_supply: extractedData.destinationOfSupply || 'India',
      gst_treatment: extractedData.gstTreatment,
      gstin: extractedData.customerGstin,
      tds_calculation_type: extractedData.tdsCalculationType,
      tds_tax_id: extractedData.tdsTaxId,
      tds_name: extractedData.tdsName,
      tds_percentage: extractedData.tdsPercentage,
      tds_section_code: extractedData.tdsSectionCode,

      // Column 51-63: TDS/TCS & Item Details
      tds_section: extractedData.tdsSection,
      tds_amount: extractedData.tdsAmount,
      tcs_tax_name: extractedData.tcsTaxName,
      tcs_percentage: extractedData.tcsPercentage,
      nature_of_collection: extractedData.natureOfCollection,
      sku: extractedData.sku,
      line_item_location_name: extractedData.lineItemLocationName,
      rate: extractedData.rate,
      discount_type: extractedData.discountType,
      is_discount_before_tax: extractedData.isDiscountBeforeTax,
      discount: extractedData.discount,
      discount_amount: extractedData.discountAmount,
      hsn_sac: extractedData.hsnSac || '998422',

      // Column 64-80: Tax Details
      po_number: extractedData.poNumber,
      tax_id: extractedData.taxId,
      tax_name: extractedData.taxName || 'GST',
      tax_percentage: extractedData.taxPercentage,
      tax_type: extractedData.taxType,
      item_tds_name: extractedData.itemTdsName,
      item_tds_percentage: extractedData.itemTdsPercentage,
      item_tds_amount: extractedData.itemTdsAmount,
      item_tds_section_code: extractedData.itemTdsSectionCode,
      item_tds_section: extractedData.itemTdsSection,
      item_exemption_code: extractedData.itemExemptionCode,
      item_type: extractedData.itemType || bsnlTemplate.defaults.item_type,
      reverse_charge_tax_name: extractedData.reverseChargeTaxName,
      reverse_charge_tax_rate: extractedData.reverseChargeTaxRate,
      reverse_charge_tax_type: extractedData.reverseChargeTaxType,
      supply_type: extractedData.supplyType,
      itc_eligibility: extractedData.itcEligibility,

      // Column 81-86: Entity & Project
      entity_discount_amount: extractedData.entityDiscountAmount,
      discount_account: extractedData.discountAccount,
      discount_account_code: extractedData.discountAccountCode,
      is_landed_cost: extractedData.isLandedCost,
      customer_name: extractedData.customerName,
      project_name: extractedData.projectName,

      // Column 87-98: GST Rates & Amounts
      cgst_rate: extractedData.cgstRate,
      sgst_rate: extractedData.sgstRate,
      igst_rate: extractedData.igstRate,
      cess_rate: extractedData.cessRate,
      cgst_fcy: extractedData.cgstFcy,
      sgst_fcy: extractedData.sgstFcy,
      igst_fcy: extractedData.igstFcy,
      cess_fcy: extractedData.cessFcy,
      cgst: extractedData.cgstAmount || extractedData.cgst,
      sgst: extractedData.sgstAmount || extractedData.sgst,
      igst: extractedData.igstAmount || extractedData.igst,
      cess: extractedData.cessAmount || extractedData.cess,

      // Column 99-109: Custom Fields
      cf_round_off: extractedData.roundOff,
      cf_vendor_circuit_id: extractedData.circuitId || extractedData.phoneNumber,
      cf_account_relationship_no: extractedData.accountNumber || extractedData.relationshipNumber,
      cf_po_arc_value: extractedData.poArcValue,
      cf_link_acceptance_date: this.formatDate(extractedData.linkAcceptanceDate),
      cf_bill_period_from: this.formatDate(extractedData.billPeriodFrom),
      cf_bill_period_to: this.formatDate(extractedData.billPeriodTo),
      cf_warehouse: extractedData.warehouse,
      cf_h8_inward_number: extractedData.h8InwardNumber,
      cf_entry_date: this.formatDate(extractedData.entryDate),
      cf_bandwidth: extractedData.bandwidth || extractedData.bandwidthMbps
    };
  }

  /**
   * Map extracted data to Excel row format (delegates to vendor-specific mappers)
   */
  mapDataToRow(extractedData, filename, vendorType = 'vodafone') {
    if (vendorType === 'tata') {
      return this.mapDataToRowTata(extractedData, filename);
    } else if (vendorType === 'airtel') {
      return this.mapDataToRowAirtel(extractedData, filename);
    } else if (vendorType === 'indus') {
      return this.mapDataToRowIndus(extractedData, filename);
    } else if (vendorType === 'ascend') {
      return this.mapDataToRowAscend(extractedData, filename);
    } else if (vendorType === 'sify') {
      return this.mapDataToRowSify(extractedData, filename);
    } else if (vendorType === 'bsnl') {
      return this.mapDataToRowBsnl(extractedData, filename);
    } else {
      return this.mapDataToRowVodafone(extractedData, filename);
    }
  }

  /**
   * Convert column number to Excel column letter (A, B, ..., Z, AA, AB, ...)
   */
  getColumnLetter(columnNumber) {
    let columnLetter = '';
    while (columnNumber > 0) {
      const remainder = (columnNumber - 1) % 26;
      columnLetter = String.fromCharCode(65 + remainder) + columnLetter;
      columnNumber = Math.floor((columnNumber - 1) / 26);
    }
    return columnLetter;
  }

  /**
   * Format date for Excel
   */
  formatDate(dateValue) {
    if (!dateValue) return null;
    if (dateValue instanceof Date) return dateValue;

    // Parse date string (YYYY-MM-DD format)
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? dateValue : parsed;
  }

  /**
   * Add data row to worksheet
   */
  addDataRow(rowData) {
    const row = this.worksheet.addRow(rowData);

    // Apply number format to currency columns
    const currencyColumns = ['K', 'L', 'T', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AO'];
    currencyColumns.forEach(col => {
      const cell = row.getCell(col);
      if (cell.value && typeof cell.value === 'number') {
        cell.numFmt = '#,##0.00';
      }
    });

    // Apply date format
    const dateColumns = ['B', 'C'];
    dateColumns.forEach(col => {
      const cell = row.getCell(col);
      if (cell.value instanceof Date) {
        cell.numFmt = 'dd.mm.yyyy';
      }
    });

    return row;
  }

  /**
   * Generate Excel file from invoice data array
   */
  async generateExcel(invoiceDataArray, outputPath, customColumns = null, includeBlankColumns = true, vendorType = 'vodafone') {
    try {
      this.initializeWorkbook();
      this.defineColumns(customColumns, vendorType);

      // Add all data rows
      for (const invoiceData of invoiceDataArray) {
        const rowData = this.mapDataToRow(
          invoiceData.extractedData || invoiceData,
          invoiceData.filename,
          vendorType
        );
        this.addDataRow(rowData);
      }

      // Remove blank columns if requested
      if (!includeBlankColumns) {
        this.removeBlankColumns();
      }

      // Auto-filter on header row (only if columns <= 26 to avoid Excel issues)
      if (this.worksheet.columnCount <= 26) {
        this.worksheet.autoFilter = {
          from: 'A1',
          to: `${String.fromCharCode(64 + this.worksheet.columnCount)}1`
        };
      } else {
        // For more than 26 columns, use proper column reference
        const lastCol = this.getColumnLetter(this.worksheet.columnCount);
        this.worksheet.autoFilter = {
          from: 'A1',
          to: `${lastCol}1`
        };
      }

      // Freeze header row
      this.worksheet.views = [
        { state: 'frozen', xSplit: 0, ySplit: 1 }
      ];

      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      await fs.mkdir(outputDir, { recursive: true });

      // Save workbook
      await this.workbook.xlsx.writeFile(outputPath);

      return {
        success: true,
        filePath: outputPath,
        rowCount: invoiceDataArray.length
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Remove columns that have no data (all null/empty values)
   */
  removeBlankColumns() {
    const columnsToRemove = [];
    const totalRows = this.worksheet.rowCount;

    // Check each column
    this.worksheet.columns.forEach((column, colIndex) => {
      if (!column) return;

      let hasData = false;

      // Check all rows except header (row 1)
      for (let rowIndex = 2; rowIndex <= totalRows; rowIndex++) {
        const cell = this.worksheet.getRow(rowIndex).getCell(colIndex + 1);
        const value = cell.value;

        // Check if cell has meaningful data
        if (value !== null && value !== undefined && value !== '') {
          hasData = true;
          break;
        }
      }

      // Mark column for removal if it has no data
      if (!hasData) {
        columnsToRemove.push(colIndex + 1); // Excel columns are 1-indexed
      }
    });

    // Remove columns in reverse order to maintain indices
    columnsToRemove.reverse().forEach(colNumber => {
      this.worksheet.spliceColumns(colNumber, 1);
    });
  }

  /**
   * Generate Excel from database records
   */
  async generateFromDatabase(invoiceRecords, outputPath, customColumns = null, includeBlankColumns = true, vendorType = 'vodafone') {
    const invoiceDataArray = invoiceRecords.map(record => ({
      filename: record.filename,
      extractedData: JSON.parse(record.extracted_data || '{}')
    }));

    return this.generateExcel(invoiceDataArray, outputPath, customColumns, includeBlankColumns, vendorType);
  }
}

module.exports = new ExcelGenerator();
