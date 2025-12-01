const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const { OpenAI } = require('openai');

// Initialize OpenAI client only if API key is provided
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

class PDFParser {
  /**
   * Extract text from PDF file
   */
  async extractText(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return {
        text: data.text,
        pages: data.numpages,
        info: data.info
      };
    } catch (error) {
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
  }

  /**
   * Extract structured data using AI (GPT-4)
   */
  async extractWithAI(pdfText, template = null) {
    try {
      if (!openai) {
        throw new Error('OpenAI client not initialized');
      }

      const systemPrompt = `You are an expert at extracting structured data from invoices and bills.
Extract the following information from the provided invoice text and return it as a JSON object.
Be precise and extract exact values as they appear in the document.`;

      const userPrompt = `Extract all relevant invoice data from the following text. Include:
- Invoice details (invoice number, date, due date, amounts)
- Company/vendor information
- Customer information
- Line items and charges
- Tax information (GST, CGST, SGST, IGST)
- Payment details
- Any circuit/service specific information

Text:
${pdfText}

Return ONLY a valid JSON object with the extracted data. Use null for missing fields.`;

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
      });

      const extractedData = JSON.parse(completion.choices[0].message.content);
      return extractedData;
    } catch (error) {
      console.error('AI extraction error:', error.message);
      // Fallback to regex-based extraction if AI fails
      return this.extractWithRegex(pdfText);
    }
  }

  /**
   * Extract data using regex patterns (fallback method) for Vodafone
   */
  extractWithRegexVodafone(text) {
    const patterns = {
      // Invoice details
      invoiceNumber: /Invoice\s*(?:No|Number)?[:.\s]*([A-Z0-9]+)/i,
      invoiceRefNo: /Invoice\s*Ref\s*No[:.\s]*([a-zA-Z0-9]+)/i,
      billDate: /(?:Bill|Invoice)\s*(?:Cycle\s*)?Date[:.\s]*(\d{2}\.?\d{2}\.?\d{2,4})/i,
      dueDate: /Due\s*[Dd]ate[:.\s]*(\d{2}\.?\d{2}\.?\d{2,4})/i,
      relationshipNumber: /Relationship\s*(?:no|number)?[:.\s]*(\d+)/i,
      invoiceType: /(TAX\s*INVOICE)/i,

      // Amounts
      totalPayable: /TOTAL\s*PAYABLE\s*([0-9,]+\.?\d{0,2})/i,
      subTotal: /(?:Sub\s*total|Total\s*taxable\s*charges)\s*([0-9,]+\.?\d{0,2})/i,
      tax: /\(\+\)\s*Tax\s*([0-9,]+\.?\d{0,2})/i,
      previousOutstanding: /(?:Your\s*previous\s*outstanding\s*balance|Amount\s*due).*?(?:INR|Rs\.?)[:.\s]*([0-9,]+\.?\d{0,2})/i,
      amountInWords: /Amount\s*in\s*words[:.\s]*([^\n]+)/i,
      totalValueOfServices: /Total\s*value\s*of\s*services\s*([0-9,]+\.?\d{0,2})/i,
      totalTaxableCharges: /Total\s*taxable\s*charges\s*([0-9,]+\.?\d{0,2})/i,
      miscCharges: /Misc\.\s*credits\s*\/\s*charges\s*([0-9,]+\.?\d{0,2})/i,

      // Company details
      companyName: /Company\s*Name\s*[:.]?\s*\.?\s*([^\n]+)/i,
      gstin: /GSTIN(?:\/GSTIN_ISD)?(?:\/UIN)?(?:\s*No)?[:.\s]*([A-Z0-9]{15})/i,
      contactPerson: /Kind\s*Attn[:.\s]*([^\n]+)/i,
      contactNumber: /Contact\s*No[:.\s]*([0-9]+)/i,
      city: /City[:.\s]*([A-Z\s]+)/i,
      state: /State[:.\s]*([A-Z\s]+)/i,
      pin: /Pin[:.\s]*(\d{6})/i,

      // Service details
      circuitId: /Circuit\s*ID\s*[:.]?\s*([A-Z0-9]+)/i,
      controlNumber: /Control\s*Number\s*[:.]?\s*(\d+)/i,
      bandwidth: /(?:CIR\s*)?Bandwidth\s*[:.]?\s*(\d+)\s*Mbps/i,
      portBandwidth: /Port\s*Bandwidth\s*[:.]?\s*([^\n]+)/i,
      planName: /Plan\s*Name\s*[:.]?\s*([^\n]+)/i,
      productFlavor: /Product\s*Flavor\s*[:.]?\s*([^\n]+)/i,
      billingPeriodicity: /Billing\s*Periodicity\s*[:.]?\s*([^\n]+)/i,
      vpnTopology: /VPN\s*Topology\s*[:.]?\s*([^\n]+)/i,
      typeOfSite: /Type\s*of\s*site\s*[:.]?\s*([^\n]+)/i,
      annualCharges: /Annual\s*Charges\s*Service\s*Rental.*?[:.\s]*([0-9,]+\.?\d{0,2})/i,
      natureOfService: /Nature\s*of\s*Service[:.\s]*([^\n]+)/i,

      // Service Period
      servicePeriod: /Charges\s*for\s*the\s*period\s*(\d{2}\.\d{2}\.\d{2})\s*to\s*(\d{2}\.\d{2}\.\d{2})/i,

      // Tax details
      cgst: /Central\s*GST\s*@\s*([0-9.]+)%/i,
      sgst: /State\s*GST\s*@\s*([0-9.]+)%/i,
      igst: /IGST\s*@\s*([0-9.]+)%/i,
      cgstAmount: /Central\s*GST\s*@\s*[0-9.]+%\s*([0-9,]+\.?\d{0,2})/i,
      sgstAmount: /State\s*GST\s*@\s*[0-9.]+%\s*([0-9,]+\.?\d{0,2})/i,
      igstAmount: /IGST\s*@\s*[0-9.]+%\s*([0-9,]+\.?\d{0,2})/i,
      totalTaxAmount: /Total\s*taxes\s*([0-9,]+\.?\d{0,2})/i,
      reverseCharge: /No\s*Tax\s*is\s*payable\s*under\s*reverse\s*charge/i,

      // Vendor Information
      vendorName: /Vodafone\s*Idea/i,
      vendorPan: /PAN\s*No[:.\s]*([A-Z0-9]{10})/i,
      vendorGstin: /Vodafone\s*Idea\s*GSTIN[:.\s]*([A-Z0-9]{15})/i,
      vendorCin: /CIN[:-]([A-Z0-9]+)/i,
      vendorEmail: /vbsbillingsupport\.in@vodafoneidea\.com/i,
      vendorPhone: /(\d{12})\s*\(Vi\s*toll\s*free\)/i,
      vendorChargeablePhone: /(\+91\s*\d{10})\s*\(Chargeable\)/i,
      vendorBusinessAddress: /Business\s*Office\s*Address[:.\s]*([^\n]+(?:\n[^\n]+)?)/i,
      vendorRegisteredAddress: /Regd\s*Office\s*Address[:.\s]*([^\n]+(?:\n[^\n]+)?)/i,

      // Place of Supply
      placeOfSupply: /Place\s*of\s*Supply\s*\(State\)[:.\s]*([^\n]+)/i,
      stateCode: /State\s*Code[:.\s]*(\d{2})/i,

      // Purchase order
      poNumber: /(?:PO\s*Number|Purchase\s*Order)\s*[:.]?\s*([A-Z0-9\s-]+)/i,
      poDate: /PO\s*Date\s*[:.]?\s*(\d{2}\.\d{2}\.\d{2,4})/i,

      // Charges
      recurringCharges: /Recurring\s*charges\s*([0-9,]+\.?\d{0,2})/i,
      oneTimeCharges: /One\s*time\s*charges\s*([0-9,]+\.?\d{0,2})/i,
      usageCharges: /Usage\s*charges\s*([0-9,]+\.?\d{0,2})/i,

      // Bank Details
      bankName: /Bank\s*Name[:.\s]*(State\s*Bank\s*of\s*India)/i,
      bankAccountNumber: /Account\s*no[:.\s]*(\d+)/i,
      ifscCode: /(?:RTGS\/)?IFSC\s*Code[:.\s]*([A-Z0-9]+)/i,
      swiftCode: /Swift\s*Code[:.\s]*([A-Z0-9]+)/i,
      micrCode: /MICR\s*Code[:.\s]*([A-Z0-9]+|NA)/i,
      bankBranchAddress: /Bank\s*branch\s*address[:.\s]*([^\n]+)/i,

      // HSN/SAC
      hsnCode: /HSN\s*Code[:.\s]*(\d+)/i,
    };

    const extracted = {};

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (key === 'servicePeriod' && match) {
        // Special handling for service period (two dates)
        extracted.servicePeriodFrom = (match[1] && typeof match[1] === 'string') ? match[1].trim() : null;
        extracted.servicePeriodTo = (match[2] && typeof match[2] === 'string') ? match[2].trim() : null;
      } else if (key === 'reverseCharge') {
        // Boolean field
        extracted[key] = match ? false : null; // "No Tax is payable" means false
      } else if (key === 'vendorEmail' || key === 'vendorPhone' || key === 'vendorChargeablePhone') {
        // Direct values without capture groups
        if (match && match[0] && typeof match[0] === 'string') {
          extracted[key] = match[0].trim();
        } else {
          extracted[key] = null;
        }
      } else {
        extracted[key] = (match && match[1] && typeof match[1] === 'string') ? match[1].trim() : null;
      }
    }

    // Parse addresses
    extracted.shipToAddress = this.extractAddress(text, 'Ship To');
    extracted.billToAddress = this.extractAddress(text, 'Bill To');
    extracted.installationAddress = this.extractAddress(text, 'Installation Address');

    // Set vendor name default if found
    if (!extracted.vendorName && text.match(/Vodafone\s*Idea/i)) {
      extracted.vendorName = 'Vodafone Idea';
    }

    // Extract vendor email if pattern didn't work
    if (!extracted.vendorEmail && text.includes('vbsbillingsupport.in@vodafoneidea.com')) {
      extracted.vendorEmail = 'vbsbillingsupport.in@vodafoneidea.com';
    }

    return extracted;
  }

  /**
   * Extract data using regex patterns for Tata
   */
  extractWithRegexTata(text) {
    const patterns = {
      // Invoice details
      invoiceNumber: /Invoice\s*No[:.\s]*(\d+)/i,
      billNumber: /Invoice\s*No[:.\s]*(\d+)/i,
      accountNumber: /Account\s*No[:.\s]*(\d+)/i,
      billDate: /Bill\s*Date[:.\s]*(\d{2}-[A-Za-z]{3}-\d{2})/i,
      dueDate: /Due\s*Date[:.\s]*(\d{2}-[A-Za-z]{3}-\d{2}|Pay\s*Immediate)/i,

      // Amounts
      totalPayable: /Bill\s*Amount[:.\s]*Rs\.?\s*([0-9,]+\.?\d{0,2})/i,
      currentCharges: /Total\s*Current\s*Charges\s*([0-9,]+\.?\d{0,2})/i,
      subTotal: /SubTotal\s*([0-9,]+\.?\d{0,2})/i,
      rentalCharges: /(?:Rental\s*charges|1\)\s*Rental\s*charges)\s*([0-9,]+\.?\d{0,2})/i,
      usageCharges: /(?:Usage\s*Charges|2\)\s*Usage\s*Charges)\s*([0-9,]+\.?\d{0,2})/i,
      oneTimeCharges: /(?:One\s*Time\s*Charges|5\)\s*One\s*Time\s*Charges)\s*([0-9,]+\.?\d{0,2})/i,
      previousBalance: /Previous\s*Balance\s*Rs\.?\s*([0-9,]+\.?\d{0,2})/i,

      // Customer details
      companyName: /^([A-Z][A-Z\s]+(?:PRIVATE|LIMITED|LTD|PVT)[A-Z\s]*)/m,
      contactPerson: /Mr\s+([A-Z\s]+)\s*\.\s*\./i,
      contactNumber: /\((\d{10})\)/,
      customerPan: /Customer\s*PAN\s*No\s*([A-Z0-9]{10})/i,
      customerGstin: /Customer\s*GST\s*No\s*([A-Z0-9]{15})/i,

      // Vendor details
      vendorName: /TATA\s*TELESERVICES/i,
      vendorGstin: /Tata\s*Teleservices\s*GST\s*No[:.\s]*([A-Z0-9]{15})/i,
      vendorPan: /Tata\s*Teleservices\s*PAN\s*Number[:.\s]*([A-Z0-9]{10})/i,
      vendorCin: /CIN[:-]([A-Z0-9]+)/i,

      // Circuit/Service details
      circuitId: /(?:Circuit\s*ID|CIRCUIT\s*ID)\s*[:.]?\s*(\d+)/i,
      tataTeleNumber: /Tata\s*Tele\s*Number\s*[:.]?\s*(\d+)/i,
      poNumber: /(?:Po\s*No|P\.O\.No\.)[:.\s]*([A-Z0-9\/-]+)/i,
      bandwidth: /Bandwidth\s*[:.]?\s*(\d+)\s*Mbps/i,
      linkCommissioningDate: /Link\s*Commissioning\s*Date[:.\s]*(\d{2}-[A-Za-z]{3}-\d{2})/i,
      annualCharges: /(?:Annual\s*Rental\s*charges|ARC\s*-\s*RS\.)\s*([0-9,]+)/i,

      // Service period
      servicePeriod: /charges\s*from\s*(\d{2}-[A-Za-z]{3}-\d{2})\s*to\s*(\d{2}-[A-Za-z]{3}-\d{2})/i,
      billPeriod: /Bill\s*Period\s*[:.]?\s*(\w+)/i,

      // Tax details
      cgst: /Central\s*Goods\s*and\s*Services\s*Tax\s*@\s*([0-9.]+)%/i,
      sgst: /State\s*Goods\s*and\s*Services\s*Tax\s*@\s*([0-9.]+)%/i,
      igst: /IGST\s*@\s*([0-9.]+)%/i,
      cgstAmount: /Central\s*Goods\s*and\s*Services\s*Tax\s*@\s*[0-9.]+%\s*([0-9,]+\.?\d{0,2})/i,
      sgstAmount: /State\s*Goods\s*and\s*Services\s*Tax\s*@\s*[0-9.]+%\s*([0-9,]+\.?\d{0,2})/i,
      igstAmount: /IGST\s*@\s*[0-9.]+%\s*([0-9,]+\.?\d{0,2})/i,
      totalTax: /Goods\s*and\s*Services\s*Tax\s*([0-9,]+\.?\d{0,2})/i,

      // HSN/SAC
      hsnCode: /HSN\s*Code?\s*[:.]?\s*(\d+)/i,

      // Address details
      city: /([A-Z]+),\s*(\d{6})/,
      state: /([A-Z]+)\s*-\s*\d{6}/,
      pin: /-\s*(\d{6})/,
      stateCode: /State\s*Code:\s*(\d{2})/i,

      // IRN
      irn: /IRN\s*[:.]?\s*([a-f0-9]+)/i,

      // Bill plan
      billPlanName: /Bill\s*Plan\s*Name\s*[:.]?\s*([^\n]+)/i,

      // Credit limit
      creditLimit: /Credit\s*Limit\s*[:.]?\s*(\d+)/i,
      securityDeposit: /Security\s*Deposit\s*[:.]?\s*(\d+)/i,

      // Service type
      serviceType: /Service\s*Type\s*[:.]?\s*([A-Z]+)/i,

      // Product variant
      productVariant: /Product\s*Variant\s*[:.]?\s*([^\n]+)/i,

      // VAN number
      vanNumber: /VAN\s*NO\s*[:.]?\s*([A-Z0-9]+)/i,
    };

    const extracted = {};

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (key === 'servicePeriod' && match) {
        extracted.servicePeriodFrom = (match[1] && typeof match[1] === 'string') ? match[1].trim() : null;
        extracted.servicePeriodTo = (match[2] && typeof match[2] === 'string') ? match[2].trim() : null;
      } else if (key === 'city' && match) {
        extracted[key] = (match[1] && typeof match[1] === 'string') ? match[1].trim() : null;
      } else {
        extracted[key] = (match && match[1] && typeof match[1] === 'string') ? match[1].trim() : null;
      }
    }

    // Set vendor name default
    if (!extracted.vendorName) {
      extracted.vendorName = 'TATA TELESERVICES LTD';
    }

    // Extract installation address
    extracted.installationAddress = this.extractTataAddress(text);

    return extracted;
  }

  /**
   * Extract address from Tata invoice
   */
  extractTataAddress(text) {
    const addressPattern = /Installation\/\s*Place\s*of\s*Supply:\s*([^\n]+(?:\n[^\n]+)?)/i;
    const match = text.match(addressPattern);
    if (match && match[1] && typeof match[1] === 'string') {
      return match[1].trim().replace(/\s+/g, ' ');
    }
    return null;
  }

  /**
   * Extract data using regex patterns for Airtel
   */
  extractWithRegexAirtel(text) {
    const airtelTemplate = require('../config/airtelTemplate');
    const patterns = airtelTemplate.extractionPatterns;

    const extracted = {};

    // Basic Invoice Information
    extracted.vendorName = airtelTemplate.defaults.vendor_name;

    const billNumberMatch = text.match(patterns.bill_number);
    extracted.invoiceNumber = extracted.billNumber = billNumberMatch ? billNumberMatch[1].trim() : null;

    const billDateMatch = text.match(patterns.bill_date);
    extracted.billDate = billDateMatch ? this.formatDate(billDateMatch[1]) : null;

    const dueDateMatch = text.match(patterns.due_date);
    extracted.dueDate = dueDateMatch ? this.formatDate(dueDateMatch[1]) : null;

    const internalIdMatch = text.match(patterns.internal_id);
    extracted.billId = internalIdMatch ? internalIdMatch[1].trim() : null;

    // Financial Information
    const subtotalMatch = text.match(patterns.subtotal);
    extracted.subTotal = subtotalMatch ? this.cleanNumeric(subtotalMatch[1]) : null;

    const totalMatch = text.match(patterns.total);
    extracted.total = extracted.totalPayable = totalMatch ? this.cleanNumeric(totalMatch[1]) : null;

    // Additional Financial Information
    const recurringChargesMatch = text.match(patterns.recurring_charges);
    extracted.recurringCharges = recurringChargesMatch ? this.cleanNumeric(recurringChargesMatch[1]) : null;

    const oneTimeChargesMatch = text.match(patterns.one_time_charges);
    extracted.oneTimeCharges = oneTimeChargesMatch ? this.cleanNumeric(oneTimeChargesMatch[1]) : null;

    const discountAmountMatch = text.match(patterns.discount_amount);
    extracted.discountAmount = discountAmountMatch ? this.cleanNumeric(discountAmountMatch[1]) : null;

    const amountInWordsMatch = text.match(patterns.amount_in_words);
    extracted.amountInWords = amountInWordsMatch ? amountInWordsMatch[1].trim() : null;

    // Rate Information
    const monthlyRateMatch = text.match(patterns.monthly_rate);
    extracted.rate = monthlyRateMatch ? this.cleanNumeric(monthlyRateMatch[1]) : null;
    if (!extracted.rate && extracted.subTotal) {
      extracted.rate = extracted.subTotal;
    }

    // Total Taxes (for verification)
    const totalTaxesMatch = text.match(patterns.total_taxes);
    const totalTaxes = totalTaxesMatch ? this.cleanNumeric(totalTaxesMatch[1], true) : null;

    // GST Information - Amounts
    const cgstMatch = text.match(patterns.cgst);
    extracted.cgst = extracted.cgstAmount = cgstMatch ? this.cleanNumeric(cgstMatch[1], true) : null;

    const sgstMatch = text.match(patterns.sgst);
    extracted.sgst = extracted.sgstAmount = sgstMatch ? this.cleanNumeric(sgstMatch[1], true) : null;

    const igstMatch = text.match(patterns.igst);
    extracted.igst = extracted.igstAmount = igstMatch ? this.cleanNumeric(igstMatch[1], true) : null;

    // GST Information - Rates (Calculate from amounts - more accurate than PDF text)
    const cgstRateMatch = text.match(patterns.cgst_rate);
    const sgstRateMatch = text.match(patterns.sgst_rate);
    const igstRateMatch = text.match(patterns.igst_rate);
    const taxPercentageMatch = text.match(patterns.tax_percentage);

    // Calculate rates from actual amounts (most accurate)
    if (extracted.subTotal && extracted.cgst && extracted.cgst > 0) {
      extracted.cgstRate = parseFloat(((extracted.cgst / extracted.subTotal) * 100).toFixed(2));
    } else if (cgstRateMatch) {
      extracted.cgstRate = parseFloat(cgstRateMatch[1] || cgstRateMatch[2]);
    }

    if (extracted.subTotal && extracted.sgst && extracted.sgst > 0) {
      extracted.sgstRate = parseFloat(((extracted.sgst / extracted.subTotal) * 100).toFixed(2));
    } else if (sgstRateMatch) {
      extracted.sgstRate = parseFloat(sgstRateMatch[1] || sgstRateMatch[2]);
    }

    if (extracted.subTotal && extracted.igst && extracted.igst > 0) {
      extracted.igstRate = parseFloat(((extracted.igst / extracted.subTotal) * 100).toFixed(2));
    } else if (igstRateMatch) {
      extracted.igstRate = parseFloat(igstRateMatch[1] || igstRateMatch[2]);
    }

    // Tax Percentage (total GST rate)
    if (extracted.cgstRate && extracted.sgstRate) {
      extracted.taxPercentage = parseFloat((extracted.cgstRate + extracted.sgstRate).toFixed(2));
    } else if (extracted.igstRate) {
      extracted.taxPercentage = extracted.igstRate;
    } else if (taxPercentageMatch) {
      extracted.taxPercentage = parseFloat(taxPercentageMatch[1] || taxPercentageMatch[2]);
    }

    // Tax Amount (total of all taxes)
    extracted.taxAmount = 0;
    if (extracted.cgst) extracted.taxAmount += extracted.cgst;
    if (extracted.sgst) extracted.taxAmount += extracted.sgst;
    if (extracted.igst) extracted.taxAmount += extracted.igst;
    if (extracted.taxAmount === 0) extracted.taxAmount = null;

    // Tax Name
    if (extracted.taxPercentage) {
      extracted.taxName = `GST${Math.round(extracted.taxPercentage)}`;
    }

    // GSTIN & Tax Information
    const customerGstinMatch = text.match(patterns.customer_gstin);
    extracted.customerGstin = customerGstinMatch ? customerGstinMatch[1].trim() : null;

    const vendorGstinMatch = text.match(patterns.vendor_gstin);
    // Map to customerGstin if not found, as column 60 is usually Customer GSTIN in reports
    if (!extracted.customerGstin && vendorGstinMatch) {
       extracted.customerGstin = vendorGstinMatch[1].trim();
    }
    // Keep vendorGstin separate
    extracted.vendorGstin = vendorGstinMatch ? vendorGstinMatch[1].trim() : null;
    // Set gstin to customerGstin for the main column
    extracted.gstin = extracted.customerGstin;

    const customerPanMatch = text.match(patterns.customer_pan);
    extracted.customerPan = customerPanMatch ? customerPanMatch[1].trim() : null;

    const irnCodeMatch = text.match(patterns.irn_code);
    extracted.irnCode = irnCodeMatch ? irnCodeMatch[1].trim() : null;

    // HSN/SAC Code
    const hsnSacMatch = text.match(patterns.hsn_sac);
    extracted.hsnSac = hsnSacMatch ? hsnSacMatch[1].trim() : '998422';

    // Location & Supply Information (Clean up extra text)
    const placeOfSupplyMatch = text.match(patterns.place_of_supply);
    if (placeOfSupplyMatch) {
      let place = placeOfSupplyMatch[1].trim();
      // Clean up common suffixes
      place = place.replace(/\s*(State Code|STATE CODE)\s*$/i, '').trim();
      // For Airtel, use "India" if state-specific
      extracted.sourceOfSupply = extracted.destinationOfSupply = 'India';
      extracted.state = extracted.locationName = place;
    } else {
      extracted.sourceOfSupply = extracted.destinationOfSupply = 'India';
    }

    const stateMatch = text.match(patterns.state);
    if (stateMatch) {
      const stateName = stateMatch[1].trim();
      if (!extracted.state) {
        extracted.state = extracted.locationName = stateName;
      }
    }

    const branchMatch = text.match(patterns.branch);
    extracted.branchName = branchMatch ? branchMatch[1].trim() : null;

    // Service Details
    const serviceDescriptionMatch = text.match(patterns.service_description);
    extracted.description = serviceDescriptionMatch ? serviceDescriptionMatch[1].trim() : null;

    const itemNameMatch = text.match(patterns.item_name);
    extracted.itemName = itemNameMatch ? itemNameMatch[1].trim() : extracted.description;

    // Remove default itemName to avoid incorrect population
    // if (!extracted.itemName) {
    //   extracted.itemName = 'Telecom Services - Airtel';
    // }

    // Account & Circuit Information
    const accountNumberMatch = text.match(patterns.account_number);
    extracted.accountNumber = extracted.relationshipNumber = accountNumberMatch ? accountNumberMatch[1].trim() : null;

    const circuitIdMatch = text.match(patterns.circuit_id);
    extracted.circuitId = extracted.vendorCircuitId = circuitIdMatch ? circuitIdMatch[1].trim() : null;

    const serviceIdMatch = text.match(patterns.service_id);
    if (!extracted.circuitId && serviceIdMatch) {
      extracted.circuitId = extracted.vendorCircuitId = serviceIdMatch[1].trim();
    }

    // Bandwidth
    const bandwidthMatch = text.match(patterns.bandwidth);
    extracted.bandwidth = extracted.bandwidthMbps = bandwidthMatch ? parseFloat(bandwidthMatch[1]) : null;

    // Bill Period Dates
    const billPeriodFromMatch = text.match(patterns.bill_period_from);
    extracted.billPeriodFrom = billPeriodFromMatch ? this.formatDate(billPeriodFromMatch[1]) : null;

    const billPeriodToMatch = text.match(patterns.bill_period_to);
    extracted.billPeriodTo = billPeriodToMatch ? this.formatDate(billPeriodToMatch[1]) : null;

    // Additional Information
    const vendorNotesMatch = text.match(patterns.vendor_notes);
    extracted.vendorNotes = vendorNotesMatch ? vendorNotesMatch[1].trim().substring(0, 200) : '';

    const termsConditionsMatch = text.match(patterns.terms_conditions);
    extracted.termsConditions = termsConditionsMatch ? termsConditionsMatch[1].trim().substring(0, 200) : '';

    // Default Values
    extracted.currencyCode = airtelTemplate.defaults.currency_code;
    extracted.exchangeRate = airtelTemplate.defaults.exchange_rate;
    extracted.paymentTerms = airtelTemplate.defaults.payment_terms;
    extracted.paymentTermsLabel = airtelTemplate.defaults.payment_terms_label;

    // Additional standard fields
    extracted.quantity = 1;
    extracted.usageUnit = 'Month';
    extracted.itemType = 'Service';
    extracted.balance = 0;
    extracted.itemTotal = extracted.total;

    return extracted;
  }

  /**
   * Extract data using regex patterns for Indus Towers
   */
  extractWithRegexIndus(text) {
    const indusTemplate = require('../config/indusTemplate');
    const patterns = indusTemplate.extractionPatterns;

    const extracted = {};

    // Basic Invoice Information
    extracted.vendorName = indusTemplate.defaults.vendor_name;

    const invoiceNumberMatch = text.match(patterns.invoice_number);
    extracted.invoiceNumber = extracted.billNumber = invoiceNumberMatch ? invoiceNumberMatch[1].trim() : null;

    const invoiceDateMatch = text.match(patterns.invoice_date);
    extracted.billDate = invoiceDateMatch ? this.formatDate(invoiceDateMatch[1]) : null;

    // Circle and State
    const circleMatch = text.match(patterns.circle);
    extracted.circle = circleMatch ? circleMatch[1].trim() : null;

    const stateMatch = text.match(patterns.state);
    extracted.state = extracted.sourceOfSupply = extracted.destinationOfSupply = stateMatch ? stateMatch[1].trim() : null;

    // Financial Information
    const amountMatch = text.match(patterns.amount);
    extracted.subTotal = extracted.total = extracted.totalPayable = amountMatch ? this.cleanNumeric(amountMatch[1]) : null;

    const totalMatch = text.match(patterns.total);
    if (totalMatch) {
      extracted.total = extracted.totalPayable = this.cleanNumeric(totalMatch[1]);
    }

    // HSN/SAC Code
    const hsnMatch = text.match(patterns.hsn_code);
    extracted.hsnSac = hsnMatch ? hsnMatch[1].trim() : null;

    // Description
    const descMatch = text.match(patterns.description);
    extracted.description = extracted.itemName = descMatch ? descMatch[1].trim() : null;

    // GSTIN - Customer (first occurrence)
    const customerGstinMatch = text.match(patterns.customer_gstin_label);
    extracted.customerGstin = customerGstinMatch ? customerGstinMatch[1].trim() : null;

    // PAN Number
    const panMatch = text.match(patterns.pan);
    extracted.pan = panMatch ? panMatch[1].trim() : null;

    // CIN Number
    const cinMatch = text.match(patterns.cin);
    extracted.cin = extracted.billId = cinMatch ? cinMatch[1].trim() : null;

    // Account Number
    const accountMatch = text.match(patterns.account_number);
    extracted.accountNumber = accountMatch ? accountMatch[1].trim() : null;

    // IFSC Code
    const ifscMatch = text.match(patterns.ifsc);
    extracted.ifscCode = ifscMatch ? ifscMatch[1].trim() : null;

    // GST Amounts
    const cgstMatch = text.match(patterns.cgst);
    extracted.cgst = extracted.cgstAmount = cgstMatch ? this.cleanNumeric(cgstMatch[1]) : null;

    const sgstMatch = text.match(patterns.sgst);
    extracted.sgst = extracted.sgstAmount = sgstMatch ? this.cleanNumeric(sgstMatch[1]) : null;

    const igstMatch = text.match(patterns.igst);
    extracted.igst = extracted.igstAmount = igstMatch ? this.cleanNumeric(igstMatch[1]) : null;

    // GST Rates
    const cgstRateMatch = text.match(patterns.cgst_rate);
    extracted.cgstRate = cgstRateMatch ? parseFloat(cgstRateMatch[1]) : null;

    const sgstRateMatch = text.match(patterns.sgst_rate);
    extracted.sgstRate = sgstRateMatch ? parseFloat(sgstRateMatch[1]) : null;

    const igstRateMatch = text.match(patterns.igst_rate);
    extracted.igstRate = igstRateMatch ? parseFloat(igstRateMatch[1]) : null;

    // Vendor GSTIN (different from customer)
    const vendorGstinMatch = text.match(patterns.vendor_gstin);
    extracted.vendorGSTIN = vendorGstinMatch ? vendorGstinMatch[1].trim() : null;

    // Default Values
    extracted.currencyCode = indusTemplate.defaults.currency_code;
    extracted.exchangeRate = indusTemplate.defaults.exchange_rate;
    extracted.paymentTerms = indusTemplate.defaults.payment_terms;
    extracted.paymentTermsLabel = indusTemplate.defaults.payment_terms_label;

    // Additional standard fields
    extracted.quantity = 1;
    extracted.usageUnit = 'Month';
    extracted.itemType = 'Service';

    return extracted;
  }

  /**
   * Extract data using regex patterns for Ascend
   */
  extractWithRegexAscend(text) {
    const ascendTemplate = require('../config/ascendTemplate');
    const patterns = ascendTemplate.extractionPatterns;

    const extracted = {};

    // Basic Invoice Information
    extracted.vendorName = ascendTemplate.defaults.vendor_name;

    const billNumberMatch = text.match(patterns.bill_number);
    extracted.invoiceNumber = extracted.billNumber = billNumberMatch ? billNumberMatch[1].trim() : null;

    const billDateMatch = text.match(patterns.bill_date);
    extracted.billDate = billDateMatch ? this.formatDate(billDateMatch[1]) : null;

    const dueDateMatch = text.match(patterns.due_date);
    extracted.dueDate = dueDateMatch ? this.formatDate(dueDateMatch[1]) : null;

    // Bill Period
    const billPeriodFromMatch = text.match(patterns.bill_period_from);
    extracted.billPeriodFrom = billPeriodFromMatch ? this.formatDate(billPeriodFromMatch[1]) : null;

    const billPeriodToMatch = text.match(patterns.bill_period_to);
    extracted.billPeriodTo = billPeriodToMatch ? this.formatDate(billPeriodToMatch[1]) : null;

    // Financial Information
    const subtotalMatch = text.match(patterns.subtotal);
    extracted.subTotal = subtotalMatch ? this.cleanNumeric(subtotalMatch[1]) : null;

    const totalMatch = text.match(patterns.total);
    extracted.total = extracted.totalPayable = totalMatch ? this.cleanNumeric(totalMatch[1]) : null;

    // GST Information
    const cgstMatch = text.match(patterns.cgst);
    extracted.cgst = extracted.cgstAmount = cgstMatch ? this.cleanNumeric(cgstMatch[1]) : null;

    const sgstMatch = text.match(patterns.sgst);
    extracted.sgst = extracted.sgstAmount = sgstMatch ? this.cleanNumeric(sgstMatch[1]) : null;

    const igstMatch = text.match(patterns.igst);
    extracted.igst = extracted.igstAmount = igstMatch ? this.cleanNumeric(igstMatch[1]) : null;

    // GST Rates
    const cgstRateMatch = text.match(patterns.cgst_rate);
    extracted.cgstRate = cgstRateMatch ? parseFloat(cgstRateMatch[1]) : null;

    const sgstRateMatch = text.match(patterns.sgst_rate);
    extracted.sgstRate = sgstRateMatch ? parseFloat(sgstRateMatch[1]) : null;

    const igstRateMatch = text.match(patterns.igst_rate);
    extracted.igstRate = igstRateMatch ? parseFloat(igstRateMatch[1]) : null;

    // Tax Amount
    const taxAmountMatch = text.match(patterns.tax_amount);
    extracted.taxAmount = taxAmountMatch ? this.cleanNumeric(taxAmountMatch[1]) : null;

    // GSTIN Information
    const gstinMatch = text.match(patterns.gstin);
    extracted.vendorGSTIN = gstinMatch ? gstinMatch[1].trim() : null;

    const customerGstinMatch = text.match(patterns.customer_gstin);
    extracted.customerGstin = customerGstinMatch ? customerGstinMatch[1].trim() : null;

    // PAN
    const panMatch = text.match(patterns.pan);
    extracted.pan = panMatch ? panMatch[1].trim() : null;

    // Place of Supply
    const placeOfSupplyMatch = text.match(patterns.place_of_supply);
    if (placeOfSupplyMatch) {
      extracted.sourceOfSupply = extracted.destinationOfSupply = placeOfSupplyMatch[2] ? placeOfSupplyMatch[2].trim() : null;
    }

    // HSN/SAC
    const hsnSacMatch = text.match(patterns.hsn_sac);
    extracted.hsnSac = hsnSacMatch ? hsnSacMatch[1].trim() : null;

    // Description
    const descriptionMatch = text.match(patterns.description);
    extracted.description = extracted.itemName = descriptionMatch ? descriptionMatch[1].trim() : ascendTemplate.defaults.item_name;

    // IRN
    const irnMatch = text.match(patterns.irn);
    extracted.irn = irnMatch ? irnMatch[1].trim() : null;

    // Bank Details
    const accountNumberMatch = text.match(patterns.account_number);
    extracted.accountNumber = accountNumberMatch ? accountNumberMatch[1].trim() : null;

    const ifscMatch = text.match(patterns.ifsc);
    extracted.ifscCode = ifscMatch ? ifscMatch[1].trim() : null;

    // Default Values
    extracted.currencyCode = ascendTemplate.defaults.currency_code;
    extracted.exchangeRate = ascendTemplate.defaults.exchange_rate;
    extracted.paymentTerms = ascendTemplate.defaults.payment_terms;
    extracted.paymentTermsLabel = ascendTemplate.defaults.payment_terms_label;

    // Additional standard fields
    extracted.quantity = ascendTemplate.defaults.quantity;
    extracted.usageUnit = ascendTemplate.defaults.usage_unit;
    extracted.itemType = 'Service';
    extracted.account = ascendTemplate.defaults.account;

    // Calculate tax rates if not found but amounts are available
    if (!extracted.cgstRate && extracted.subTotal && extracted.cgst) {
      extracted.cgstRate = ((extracted.cgst / extracted.subTotal) * 100).toFixed(2);
    }
    if (!extracted.sgstRate && extracted.subTotal && extracted.sgst) {
      extracted.sgstRate = ((extracted.sgst / extracted.subTotal) * 100).toFixed(2);
    }
    if (!extracted.igstRate && extracted.subTotal && extracted.igst) {
      extracted.igstRate = ((extracted.igst / extracted.subTotal) * 100).toFixed(2);
    }

    // Calculate tax amount if not found
    if (!extracted.taxAmount && (extracted.cgst || extracted.sgst || extracted.igst)) {
      extracted.taxAmount = (extracted.cgst || 0) + (extracted.sgst || 0) + (extracted.igst || 0);
    }

    return extracted;
  }

  /**
   * Extract data using regex patterns for Sify
   */
  extractWithRegexSify(text) {
    const sifyTemplate = require('../config/sifyTemplate');
    const patterns = sifyTemplate.extractionPatterns;

    const extracted = {};

    // Basic Invoice Information
    extracted.vendorName = sifyTemplate.defaults.vendor_name;

    const billNumberMatch = text.match(patterns.bill_number);
    extracted.invoiceNumber = extracted.billNumber = billNumberMatch ? billNumberMatch[1].trim() : null;

    const billDateMatch = text.match(patterns.bill_date);
    extracted.billDate = billDateMatch ? this.formatDate(billDateMatch[1]) : null;

    const dueDateMatch = text.match(patterns.due_date);
    extracted.dueDate = dueDateMatch ? this.formatDate(dueDateMatch[1]) : null;

    // Financial Information
    const subtotalMatch = text.match(patterns.subtotal);
    extracted.subTotal = subtotalMatch ? this.cleanNumeric(subtotalMatch[1]) : null;

    const totalMatch = text.match(patterns.total);
    extracted.total = extracted.totalPayable = totalMatch ? this.cleanNumeric(totalMatch[1]) : null;

    const taxAmountMatch = text.match(patterns.tax_amount);
    extracted.taxAmount = taxAmountMatch ? this.cleanNumeric(taxAmountMatch[1]) : null;

    // GST Information
    const cgstMatch = text.match(patterns.cgst);
    if (cgstMatch) {
      extracted.cgst = extracted.cgstAmount = this.cleanNumeric(cgstMatch[2] || cgstMatch[1]);
    }

    const sgstMatch = text.match(patterns.sgst);
    if (sgstMatch) {
      extracted.sgst = extracted.sgstAmount = this.cleanNumeric(sgstMatch[2] || sgstMatch[1]);
    }

    const igstMatch = text.match(patterns.igst);
    if (igstMatch) {
      extracted.igst = extracted.igstAmount = this.cleanNumeric(igstMatch[2] || igstMatch[1]);
    }

    // GST Rates
    const cgstRateMatch = text.match(patterns.cgst_rate);
    extracted.cgstRate = cgstRateMatch ? parseFloat(cgstRateMatch[1]) : null;

    const sgstRateMatch = text.match(patterns.sgst_rate);
    extracted.sgstRate = sgstRateMatch ? parseFloat(sgstRateMatch[1]) : null;

    const igstRateMatch = text.match(patterns.igst_rate);
    extracted.igstRate = igstRateMatch ? parseFloat(igstRateMatch[1]) : null;

    // GSTIN Information
    const gstinMatches = text.match(new RegExp(patterns.gstin.source, 'gi'));
    if (gstinMatches && gstinMatches.length > 0) {
      extracted.vendorGSTIN = gstinMatches[0].replace(/GSTIN\s*:\s*/i, '').trim();
      if (gstinMatches.length > 1) {
        extracted.customerGstin = gstinMatches[1].replace(/GSTIN\s*:\s*/i, '').trim();
      }
    }

    // PAN
    const panMatch = text.match(patterns.pan);
    extracted.pan = panMatch ? panMatch[1].trim() : null;

    // Place of Supply
    const placeOfSupplyMatch = text.match(patterns.place_of_supply);
    extracted.sourceOfSupply = extracted.destinationOfSupply = placeOfSupplyMatch ? placeOfSupplyMatch[1].trim() : 'India';

    // State Code
    const stateCodeMatch = text.match(patterns.state_code);
    extracted.stateCode = stateCodeMatch ? stateCodeMatch[1].trim() : null;

    // Customer Code
    const customerCodeMatch = text.match(patterns.customer_code);
    extracted.customerCode = customerCodeMatch ? customerCodeMatch[1].trim() : null;

    // PO Number
    const poNumberMatch = text.match(patterns.po_number);
    extracted.poNumber = extracted.purchaseOrder = poNumberMatch ? poNumberMatch[1].trim() : null;

    // Currency
    const currencyMatch = text.match(patterns.currency);
    extracted.currencyCode = currencyMatch ? currencyMatch[1].trim() : sifyTemplate.defaults.currency_code;

    // CIN
    const cinMatch = text.match(patterns.cin);
    extracted.cin = extracted.billId = cinMatch ? cinMatch[1].trim() : null;

    // LUT Number
    const lutMatch = text.match(patterns.lut_number);
    extracted.lutNumber = lutMatch ? lutMatch[1].trim() : null;

    // Default Values
    extracted.exchangeRate = sifyTemplate.defaults.exchange_rate;
    extracted.paymentTerms = sifyTemplate.defaults.payment_terms;
    extracted.paymentTermsLabel = sifyTemplate.defaults.payment_terms_label;

    // Additional standard fields
    extracted.quantity = sifyTemplate.defaults.quantity;
    extracted.usageUnit = sifyTemplate.defaults.usage_unit;
    extracted.itemType = sifyTemplate.defaults.item_type;

    return extracted;
  }

  /**
   * Extract data using regex patterns for BSNL
   */
  extractWithRegexBsnl(text) {
    const bsnlTemplate = require('../config/bsnlTemplate');
    const patterns = bsnlTemplate.extractionPatterns;

    const extracted = {};

    // Basic Invoice Information
    extracted.vendorName = bsnlTemplate.defaults.vendor_name;

    const billNumberMatch = text.match(patterns.bill_number);
    extracted.invoiceNumber = extracted.billNumber = billNumberMatch ? billNumberMatch[1].trim() : null;

    const billDateMatch = text.match(patterns.bill_date);
    extracted.billDate = billDateMatch ? this.formatDate(billDateMatch[1]) : null;

    const dueDateMatch = text.match(patterns.due_date);
    extracted.dueDate = dueDateMatch ? this.formatDate(dueDateMatch[1]) : null;

    // Account and Phone
    const accountNumberMatch = text.match(patterns.account_number);
    extracted.accountNumber = extracted.relationshipNumber = accountNumberMatch ? accountNumberMatch[1].trim() : null;

    const phoneNumberMatch = text.match(patterns.phone_number);
    extracted.phoneNumber = phoneNumberMatch ? phoneNumberMatch[1].trim() : null;

    // Bill Period
    const billPeriodFromMatch = text.match(patterns.bill_period_from);
    extracted.billPeriodFrom = billPeriodFromMatch ? this.formatDate(billPeriodFromMatch[1]) : null;

    const billPeriodToMatch = text.match(patterns.bill_period_to);
    extracted.billPeriodTo = billPeriodToMatch ? this.formatDate(billPeriodToMatch[1]) : null;

    // Financial Information
    const totalMatch = text.match(patterns.total);
    extracted.total = extracted.totalPayable = totalMatch ? this.cleanNumeric(totalMatch[1]) : null;

    const subtotalMatch = text.match(patterns.subtotal);
    extracted.subTotal = subtotalMatch ? this.cleanNumeric(subtotalMatch[1]) : null;

    const taxAmountMatch = text.match(patterns.tax_amount);
    extracted.taxAmount = taxAmountMatch ? this.cleanNumeric(taxAmountMatch[1]) : null;

    // GST Information
    const cgstMatch = text.match(patterns.cgst);
    if (cgstMatch) {
      extracted.cgstRate = parseFloat(cgstMatch[1]);
      extracted.cgst = extracted.cgstAmount = this.cleanNumeric(cgstMatch[2]);
    }

    const sgstMatch = text.match(patterns.sgst);
    if (sgstMatch) {
      extracted.sgstRate = parseFloat(sgstMatch[1]);
      extracted.sgst = extracted.sgstAmount = this.cleanNumeric(sgstMatch[2]);
    }

    const igstMatch = text.match(patterns.igst);
    if (igstMatch) {
      extracted.igstRate = parseFloat(igstMatch[1]);
      extracted.igst = extracted.igstAmount = this.cleanNumeric(igstMatch[2]);
    }

    // GSTIN
    const gstinMatch = text.match(patterns.gstin);
    extracted.customerGstin = gstinMatch ? gstinMatch[1].trim() : null;

    // Tariff Plan
    const tariffPlanMatch = text.match(patterns.tariff_plan);
    extracted.tariffPlan = extracted.itemName = tariffPlanMatch ? tariffPlanMatch[1].trim() : bsnlTemplate.defaults.item_name;

    // Charges breakdown
    const recurringChargesMatch = text.match(patterns.recurring_charges);
    extracted.recurringCharges = recurringChargesMatch ? this.cleanNumeric(recurringChargesMatch[1]) : null;

    const usageChargesMatch = text.match(patterns.usage_charges);
    extracted.usageCharges = usageChargesMatch ? this.cleanNumeric(usageChargesMatch[1]) : null;

    const oneTimeChargesMatch = text.match(patterns.one_time_charges);
    extracted.oneTimeCharges = oneTimeChargesMatch ? this.cleanNumeric(oneTimeChargesMatch[1]) : null;

    const discountMatch = text.match(patterns.discount);
    extracted.discount = discountMatch ? this.cleanNumeric(discountMatch[1]) : null;

    // Account Summary
    const previousBalanceMatch = text.match(patterns.previous_balance);
    extracted.previousBalance = previousBalanceMatch ? this.cleanNumeric(previousBalanceMatch[1]) : null;

    const paymentReceivedMatch = text.match(patterns.payment_received);
    extracted.paymentReceived = paymentReceivedMatch ? this.cleanNumeric(paymentReceivedMatch[1]) : null;

    const adjustmentsMatch = text.match(patterns.adjustments);
    extracted.adjustments = adjustmentsMatch ? this.cleanNumeric(adjustmentsMatch[1]) : null;

    const currentChargesMatch = text.match(patterns.current_charges);
    extracted.currentCharges = currentChargesMatch ? this.cleanNumeric(currentChargesMatch[1]) : null;

    // Calculate subtotal if not found
    if (!extracted.subTotal && extracted.recurringCharges !== null) {
      extracted.subTotal = extracted.recurringCharges + (extracted.usageCharges || 0) + (extracted.oneTimeCharges || 0);
    }

    // Default Values
    extracted.currencyCode = bsnlTemplate.defaults.currency_code;
    extracted.exchangeRate = bsnlTemplate.defaults.exchange_rate;
    extracted.paymentTerms = bsnlTemplate.defaults.payment_terms;
    extracted.paymentTermsLabel = bsnlTemplate.defaults.payment_terms_label;

    // Additional standard fields
    extracted.quantity = bsnlTemplate.defaults.quantity;
    extracted.usageUnit = bsnlTemplate.defaults.usage_unit;
    extracted.itemType = bsnlTemplate.defaults.item_type;
    extracted.sourceOfSupply = extracted.destinationOfSupply = 'India';

    return extracted;
  }

  /**
   * Main regex extraction method that delegates to vendor-specific extractors
   */
  extractWithRegex(text, vendorType = 'vodafone') {
    if (vendorType === 'tata') {
      return this.extractWithRegexTata(text);
    } else if (vendorType === 'airtel') {
      return this.extractWithRegexAirtel(text);
    } else if (vendorType === 'indus') {
      return this.extractWithRegexIndus(text);
    } else if (vendorType === 'ascend') {
      return this.extractWithRegexAscend(text);
    } else if (vendorType === 'sify') {
      return this.extractWithRegexSify(text);
    } else if (vendorType === 'bsnl') {
      return this.extractWithRegexBsnl(text);
    } else {
      return this.extractWithRegexVodafone(text);
    }
  }

  /**
   * Extract address from text
   */
  extractAddress(text, label) {
    const addressPattern = new RegExp(`${label}\\s*[:.]?([^]+?)(?=Bill To|Ship To|City:|Description|$)`, 'i');
    const match = text.match(addressPattern);
    if (match && match[1] && typeof match[1] === 'string') {
      return match[1].trim().replace(/\s+/g, ' ');
    }
    return null;
  }

  /**
   * Parse extracted data based on template
   */
  async parseWithTemplate(pdfText, template) {
    const extractedData = {};

    if (!template || !template.field_mappings) {
      return this.extractWithRegex(pdfText);
    }

    const mappings = typeof template.field_mappings === 'string'
      ? JSON.parse(template.field_mappings)
      : template.field_mappings;

    for (const [fieldName, config] of Object.entries(mappings)) {
      if (config.pattern) {
        const regex = new RegExp(config.pattern, 'i');
        const match = pdfText.match(regex);
        extractedData[fieldName] = (match && match[1] && typeof match[1] === 'string') ? match[1].trim() : null;
      }
    }

    return extractedData;
  }

  /**
   * Format date strings
   */
  formatDate(dateStr) {
    if (!dateStr) return null;

    // Handle "Pay Immediate" or special values
    if (dateStr.toLowerCase().includes('pay immediate') || dateStr.toLowerCase().includes('immediate')) {
      return null; // Or keep as is if needed
    }

    const monthMap = {
      'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
      'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
      'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
    };

    // Handle DD-MMM-YYYY format (Airtel: 07-MAY-2025)
    const match1 = dateStr.match(/(\d{1,2})-([A-Za-z]{3})-(\d{4})/);
    if (match1) {
      const month = monthMap[match1[2].toLowerCase()];
      return `${match1[3]}-${month}-${match1[1].padStart(2, '0')}`;
    }

    // Handle DD-MMM-YY format (Tata: 03-Nov-25)
    const match2 = dateStr.match(/(\d{2})-([A-Za-z]{3})-(\d{2})/);
    if (match2) {
      const month = monthMap[match2[2].toLowerCase()];
      const year = parseInt(match2[3]) > 50 ? `19${match2[3]}` : `20${match2[3]}`;
      return `${year}-${month}-${match2[1]}`;
    }

    // Handle DD.MM.YY format (Vodafone)
    const match3 = dateStr.match(/(\d{2})\.(\d{2})\.(\d{2})$/);
    if (match3) {
      const year = parseInt(match3[3]) > 50 ? `19${match3[3]}` : `20${match3[3]}`;
      return `${year}-${match3[2]}-${match3[1]}`;
    }

    // Handle DD.MM.YYYY format
    const match4 = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (match4) {
      return `${match4[3]}-${match4[2]}-${match4[1]}`;
    }

    // Handle DD/MM/YYYY format (Indus: 29/10/2025)
    const match5 = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (match5) {
      return `${match5[3]}-${match5[2]}-${match5[1]}`;
    }

    return dateStr;
  }

  /**
   * Clean numeric values
   * @param {string|number} value - The value to clean
   * @param {boolean} excludeYears - Whether to exclude values that look like years (2020-2030)
   */
  cleanNumeric(value, excludeYears = false) {
    if (!value) return null;
    const num = parseFloat(value.toString().replace(/,/g, ''));
    
    // Check if it's a year (e.g. 2024, 2025) if requested
    if (excludeYears && Number.isInteger(num) && num >= 2020 && num <= 2030) {
      return null;
    }
    
    return num;
  }

  /**
   * Main extraction method
   */
  async extractInvoiceData(filePath, template = null, useAI = true, vendorType = 'vodafone') {
    const startTime = Date.now();

    try {
      // Extract text from PDF
      const { text, pages } = await this.extractText(filePath);

      let extractedData;

      // Try AI extraction first if enabled and available
      if (useAI && openai) {
        try {
          extractedData = await this.extractWithAI(text, template);
        } catch (aiError) {
          console.warn('AI extraction failed, falling back to regex:', aiError.message);
          extractedData = template
            ? await this.parseWithTemplate(text, template)
            : this.extractWithRegex(text, vendorType);
        }
      } else if (template) {
        extractedData = await this.parseWithTemplate(text, template);
      } else {
        extractedData = this.extractWithRegex(text, vendorType);
      }

      // Format dates
      const dateFields = ['billDate', 'dueDate', 'poDate', 'servicePeriodFrom', 'servicePeriodTo'];
      for (const field of dateFields) {
        if (extractedData[field]) {
          extractedData[field] = this.formatDate(extractedData[field]);
        }
      }

      // Clean numeric values
      const numericFields = [
        'totalPayable', 'subTotal', 'tax', 'bandwidth',
        'recurringCharges', 'oneTimeCharges', 'usageCharges',
        'cgst', 'sgst', 'igst',
        'cgstAmount', 'sgstAmount', 'igstAmount', 'totalTaxAmount',
        'previousOutstanding', 'totalValueOfServices', 'totalTaxableCharges',
        'miscCharges', 'annualCharges', 'poArcValue'
      ];

      for (const field of numericFields) {
        if (extractedData[field]) {
          extractedData[field] = this.cleanNumeric(extractedData[field]);
        }
      }

      const processingTime = Date.now() - startTime;

      // Add vendor type to extracted data
      extractedData.vendorType = vendorType;

      return {
        success: true,
        data: extractedData,
        metadata: {
          pages,
          processingTime,
          extractionMethod: useAI ? 'AI' : (template ? 'Template' : 'Regex'),
          vendorType
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        metadata: {
          processingTime: Date.now() - startTime
        }
      };
    }
  }
}

module.exports = new PDFParser();
