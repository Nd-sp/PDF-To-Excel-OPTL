const db = require('../config/database');
const ExcelJS = require('exceljs');
const fs = require('fs').promises;
const path = require('path');

class ExportService {
  /**
   * Export batch data to Excel
   */
  async exportToExcel(batchId) {
    try {
      // Get batch info first
      const [batchInfo] = await db.query(`
        SELECT batch_name, vendor_type FROM upload_batches WHERE id = ?
      `, [batchId]);

      const [invoices] = await db.query(`
        SELECT * FROM invoice_data WHERE batch_id = ? ORDER BY id
      `, [batchId]);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Invoice Data');

      // Add headers
      worksheet.columns = this.getExcelColumns();

      // Add data rows
      invoices.forEach(invoice => {
        worksheet.addRow(this.mapInvoiceToRow(invoice));
      });

      // Style headers
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };

      // Generate filename: BatchName_VendorName_Date_Time.xlsx
      const batchName = (batchInfo[0]?.batch_name || `Batch_${batchId}`).replace(/[^a-zA-Z0-9-_]/g, '_');
      const vendorName = batchInfo[0]?.vendor_type === 'tata' ? 'TataTeleservices' : 'VodafoneIdea';
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
      const filename = `${batchName}_${vendorName}_${dateStr}_${timeStr}.xlsx`;
      const filepath = path.join(process.env.UPLOAD_DIR || './uploads', filename);

      await workbook.xlsx.writeFile(filepath);

      // Log export
      await this.logExport(batchId, 'excel', filepath, invoices.length);

      return { filepath, filename };
    } catch (error) {
      console.error('Excel export error:', error);
      throw error;
    }
  }

  /**
   * Export to CSV
   */
  async exportToCSV(batchId) {
    try {
      // Get batch info first
      const [batchInfo] = await db.query(`
        SELECT batch_name, vendor_type FROM upload_batches WHERE id = ?
      `, [batchId]);

      const [invoices] = await db.query(`
        SELECT * FROM invoice_data WHERE batch_id = ? ORDER BY id
      `, [batchId]);

      const columns = this.getCSVColumns();
      const headers = columns.map(c => c.header).join(',');
      const rows = invoices.map(invoice => {
        return columns.map(col => {
          const value = invoice[col.key];
          // Escape commas and quotes
          const escaped = value?.toString().replace(/"/g, '""') || '';
          return `"${escaped}"`;
        }).join(',');
      });

      const csv = [headers, ...rows].join('\n');

      // Generate filename: BatchName_VendorName_Date_Time.csv
      const batchName = (batchInfo[0]?.batch_name || `Batch_${batchId}`).replace(/[^a-zA-Z0-9-_]/g, '_');
      const vendorName = batchInfo[0]?.vendor_type === 'tata' ? 'TataTeleservices' : 'VodafoneIdea';
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      const filename = `${batchName}_${vendorName}_${dateStr}_${timeStr}.csv`;
      const filepath = path.join(process.env.UPLOAD_DIR || './uploads', filename);

      await fs.writeFile(filepath, csv, 'utf8');

      await this.logExport(batchId, 'csv', filepath, invoices.length);

      return { filepath, filename };
    } catch (error) {
      console.error('CSV export error:', error);
      throw error;
    }
  }

  /**
   * Export to JSON
   */
  async exportToJSON(batchId) {
    try {
      // Get batch info first
      const [batchInfo] = await db.query(`
        SELECT batch_name, vendor_type FROM upload_batches WHERE id = ?
      `, [batchId]);

      const [invoices] = await db.query(`
        SELECT * FROM invoice_data WHERE batch_id = ? ORDER BY id
      `, [batchId]);

      // Generate filename: BatchName_VendorName_Date_Time.json
      const batchName = (batchInfo[0]?.batch_name || `Batch_${batchId}`).replace(/[^a-zA-Z0-9-_]/g, '_');
      const vendorName = batchInfo[0]?.vendor_type === 'tata' ? 'TataTeleservices' : 'VodafoneIdea';
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      const filename = `${batchName}_${vendorName}_${dateStr}_${timeStr}.json`;
      const filepath = path.join(process.env.UPLOAD_DIR || './uploads', filename);

      await fs.writeFile(filepath, JSON.stringify(invoices, null, 2), 'utf8');

      await this.logExport(batchId, 'json', filepath, invoices.length);

      return { filepath, filename };
    } catch (error) {
      console.error('JSON export error:', error);
      throw error;
    }
  }

  /**
   * Get Excel column definitions
   */
  getExcelColumns() {
    return [
      { header: 'Filename', key: 'filename', width: 30 },
      { header: 'Bill Date', key: 'bill_date', width: 15 },
      { header: 'Due Date', key: 'due_date', width: 15 },
      { header: 'Bill ID', key: 'bill_id', width: 20 },
      { header: 'Invoice Ref No', key: 'invoice_ref_no', width: 35 },
      { header: 'Vendor Name', key: 'vendor_name', width: 20 },
      { header: 'Bill Number', key: 'bill_number', width: 20 },
      { header: 'Purchase Order', key: 'purchase_order', width: 20 },
      { header: 'PO Date', key: 'po_date', width: 15 },
      { header: 'Currency Code', key: 'currency_code', width: 12 },
      { header: 'Sub Total', key: 'sub_total', width: 15 },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Previous Outstanding', key: 'previous_outstanding', width: 18 },
      { header: 'Recurring Charges', key: 'recurring_charges', width: 18 },
      { header: 'One Time Charges', key: 'one_time_charges', width: 18 },
      { header: 'Usage Charges', key: 'usage_charges', width: 15 },
      { header: 'Tax Amount', key: 'tax_amount', width: 15 },
      { header: 'CGST', key: 'cgst', width: 12 },
      { header: 'SGST', key: 'sgst', width: 12 },
      { header: 'IGST', key: 'igst', width: 12 },
      { header: 'CGST Amount', key: 'cgst_amount', width: 15 },
      { header: 'SGST Amount', key: 'sgst_amount', width: 15 },
      { header: 'IGST Amount', key: 'igst_amount', width: 15 },
      { header: 'GSTIN', key: 'gstin', width: 20 },
      { header: 'HSN/SAC', key: 'hsn_sac', width: 12 },
      { header: 'Relationship Number', key: 'relationship_number', width: 20 },
      { header: 'Control Number', key: 'control_number', width: 15 },
      { header: 'Circuit ID', key: 'circuit_id', width: 25 },
      { header: 'Bandwidth (Mbps)', key: 'bandwidth_mbps', width: 15 },
      { header: 'Annual Charges', key: 'annual_charges', width: 15 },
      { header: 'Service Period From', key: 'service_period_from', width: 18 },
      { header: 'Service Period To', key: 'service_period_to', width: 18 },
      { header: 'Company Name', key: 'company_name', width: 30 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'State', key: 'state', width: 15 },
      { header: 'PIN', key: 'pin', width: 10 },
      { header: 'Contact Person', key: 'contact_person', width: 20 },
      { header: 'Contact Number', key: 'contact_number', width: 15 },
      { header: 'Installation Address', key: 'installation_address', width: 40 },
    ];
  }

  /**
   * Get CSV column definitions
   */
  getCSVColumns() {
    return this.getExcelColumns().map(col => ({
      header: col.header,
      key: col.key
    }));
  }

  /**
   * Map invoice object to Excel row
   */
  mapInvoiceToRow(invoice) {
    return {
      filename: invoice.filename,
      bill_date: invoice.bill_date,
      due_date: invoice.due_date,
      bill_id: invoice.bill_id,
      invoice_ref_no: invoice.invoice_ref_no,
      vendor_name: invoice.vendor_name,
      bill_number: invoice.bill_number,
      purchase_order: invoice.purchase_order,
      po_date: invoice.po_date,
      currency_code: invoice.currency_code,
      sub_total: invoice.sub_total,
      total: invoice.total,
      previous_outstanding: invoice.previous_outstanding,
      recurring_charges: invoice.recurring_charges,
      one_time_charges: invoice.one_time_charges,
      usage_charges: invoice.usage_charges,
      tax_amount: invoice.tax_amount,
      cgst: invoice.cgst,
      sgst: invoice.sgst,
      igst: invoice.igst,
      cgst_amount: invoice.cgst_amount,
      sgst_amount: invoice.sgst_amount,
      igst_amount: invoice.igst_amount,
      gstin: invoice.gstin,
      hsn_sac: invoice.hsn_sac,
      relationship_number: invoice.relationship_number,
      control_number: invoice.control_number,
      circuit_id: invoice.circuit_id,
      bandwidth_mbps: invoice.bandwidth_mbps,
      annual_charges: invoice.annual_charges,
      service_period_from: invoice.service_period_from,
      service_period_to: invoice.service_period_to,
      company_name: invoice.company_name,
      city: invoice.city,
      state: invoice.state,
      pin: invoice.pin,
      contact_person: invoice.contact_person,
      contact_number: invoice.contact_number,
      installation_address: invoice.installation_address,
    };
  }

  /**
   * Log export to database
   */
  async logExport(batchId, format, filepath, rowCount) {
    try {
      const stats = await fs.stat(filepath);
      await db.query(`
        INSERT INTO export_history
        (batch_id, export_format, file_path, file_size_bytes, row_count)
        VALUES (?, ?, ?, ?, ?)
      `, [batchId, format, filepath, stats.size, rowCount]);
    } catch (error) {
      console.error('Error logging export:', error);
    }
  }

  /**
   * Get export history for a batch
   */
  async getExportHistory(batchId) {
    const [history] = await db.query(`
      SELECT * FROM export_history
      WHERE batch_id = ?
      ORDER BY created_at DESC
    `, [batchId]);

    return history;
  }
}

module.exports = new ExportService();
